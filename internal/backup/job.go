package backup

import (
	"context"
	"fmt"
	"io"
	"log/slog"
	"time"

	"github.com/soapboxsys/ombudslib/internal/compress"
	"github.com/soapboxsys/ombudslib/internal/dumper"
	"github.com/soapboxsys/ombudslib/internal/storage"
	"github.com/soapboxsys/ombudslib/internal/tempfile"
)

// BackupResult contains metadata about a completed backup operation.
type BackupResult struct {
	Key      string
	Size     int64
	Duration time.Duration
	Error    error
}

// Job orchestrates the full backup pipeline: dump → compress → upload.
type Job struct {
	Dumper      dumper.Dumper
	Compressor  compress.Compressor
	Storage     storage.Backend
	StreamDirect bool
	Logger      *slog.Logger
}

// NewJob constructs a new Job with the given dependencies.
func NewJob(d dumper.Dumper, c compress.Compressor, s storage.Backend, streamDirect bool, logger *slog.Logger) *Job {
	if logger == nil {
		logger = slog.Default()
	}
	return &Job{
		Dumper:       d,
		Compressor:   c,
		Storage:      s,
		StreamDirect: streamDirect,
		Logger:       logger,
	}
}

// Run executes a complete backup cycle and returns a BackupResult.
func (j *Job) Run(ctx context.Context) BackupResult {
	start := time.Now()

	j.Logger.InfoContext(ctx, "backup job started")

	var (
		key  string
		size int64
		err  error
	)

	if j.StreamDirect {
		key, size, err = j.runStreamDirect(ctx)
	} else {
		key, size, err = j.runViaTemp(ctx)
	}

	duration := time.Since(start)

	result := BackupResult{
		Key:      key,
		Size:     size,
		Duration: duration,
		Error:    err,
	}

	if err != nil {
		j.Logger.ErrorContext(ctx, "backup job failed",
			slog.String("error", err.Error()),
			slog.Duration("duration", duration),
		)
	} else {
		j.Logger.InfoContext(ctx, "backup job completed",
			slog.String("key", key),
			slog.Int64("size_bytes", size),
			slog.Duration("duration", duration),
		)
	}

	return result
}

// runViaTemp performs the backup by writing to a temp file first, then uploading.
func (j *Job) runViaTemp(ctx context.Context) (string, int64, error) {
	// Step 1: create temp file
	j.Logger.InfoContext(ctx, "creating temp file")
	tmp, err := tempfile.New("backup-*.dump")
	if err != nil {
		return "", 0, fmt.Errorf("create temp file: %w", err)
	}
	defer func() {
		j.Logger.InfoContext(ctx, "removing temp file", slog.String("path", tmp.Path()))
		if removeErr := tmp.Remove(); removeErr != nil {
			j.Logger.WarnContext(ctx, "failed to remove temp file",
				slog.String("path", tmp.Path()),
				slog.String("error", removeErr.Error()),
			)
		}
	}()

	// Step 2: stream pg_dump → compressor → temp file
	j.Logger.InfoContext(ctx, "dumping and compressing database", slog.String("temp_path", tmp.Path()))
	if err := j.dumpAndCompress(ctx, tmp); err != nil {
		return "", 0, fmt.Errorf("dump and compress: %w", err)
	}

	// Step 3: seek temp file to start
	j.Logger.InfoContext(ctx, "seeking temp file to beginning")
	if err := tmp.Seek(); err != nil {
		return "", 0, fmt.Errorf("seek temp file: %w", err)
	}

	// Step 4: upload to storage
	key := storage.GenerateKey(j.Compressor.Extension())
	j.Logger.InfoContext(ctx, "uploading backup", slog.String("key", key))

	size, err := j.Storage.Upload(ctx, key, tmp)
	if err != nil {
		return "", 0, fmt.Errorf("upload: %w", err)
	}

	return key, size, nil
}

// dumpAndCompress runs pg_dump, pipes through the compressor, and writes to dst.
func (j *Job) dumpAndCompress(ctx context.Context, dst io.Writer) error {
	pr, pw := io.Pipe()

	dumpErr := make(chan error, 1)
	go func() {
		defer pw.Close()
		if err := j.Dumper.Dump(ctx, pw); err != nil {
			pw.CloseWithError(err)
			dumpErr <- err
			return
		}
		dumpErr <- nil
	}()

	if err := j.Compressor.Compress(ctx, pr, dst); err != nil {
		// Drain the dump error channel to avoid goroutine leak
		<-dumpErr
		return fmt.Errorf("compress: %w", err)
	}

	if err := <-dumpErr; err != nil {
		return fmt.Errorf("dump: %w", err)
	}

	return nil
}

// runStreamDirect performs the backup by streaming directly from compressor to storage.
func (j *Job) runStreamDirect(ctx context.Context) (string, int64, error) {
	j.Logger.InfoContext(ctx, "using direct-stream pipeline")

	key := storage.GenerateKey(j.Compressor.Extension())

	pr, pw := io.Pipe()

	// Run the full dump+compress pipeline in a goroutine writing to pw
	pipeErr := make(chan error, 1)
	go func() {
		defer pw.Close()
		if err := j.dumpAndCompress(ctx, pw); err != nil {
			pw.CloseWithError(err)
			pipeErr <- err
			return
		}
		pipeErr <- nil
	}()

	j.Logger.InfoContext(ctx, "uploading backup via direct stream", slog.String("key", key))
	size, uploadErr := j.Storage.Upload(ctx, key, pr)
	if uploadErr != nil {
		pr.CloseWithError(uploadErr)
		<-pipeErr
		return "", 0, fmt.Errorf("upload: %w", uploadErr)
	}

	if err := <-pipeErr; err != nil {
		return "", 0, fmt.Errorf("pipeline: %w", err)
	}

	return key, size, nil
}