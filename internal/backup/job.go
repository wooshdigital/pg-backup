package backup

import (
	"context"
	"fmt"
	"io"
	"log/slog"
	"time"

	"github.com/smlgh/smarti/internal/compress"
	"github.com/smlgh/smarti/internal/dumper"
	"github.com/smlgh/smarti/internal/storage"
	"github.com/smlgh/smarti/internal/tempfile"
)

// BackupResult holds the outcome of a completed backup run.
type BackupResult struct {
	Key      string
	Size     int64
	Duration time.Duration
	Err      error
}

// Job orchestrates a full backup cycle: dump → compress → upload.
type Job struct {
	Dumper    dumper.Dumper
	Compressor compress.Compressor
	Storage   storage.StorageBackend
	// StorageKey is the object key used when uploading to the backend.
	StorageKey string
	// StreamDirect, when true, pipes compressed data directly to the uploader
	// without writing an intermediate temp file.
	StreamDirect bool
	Logger       *slog.Logger
}

// Run executes a complete backup cycle and returns a BackupResult.
func (j *Job) Run(ctx context.Context) BackupResult {
	start := time.Now()
	log := j.logger()

	log.InfoContext(ctx, "backup job started", "key", j.StorageKey, "stream_direct", j.StreamDirect)

	var (
		key  string
		size int64
		err  error
	)

	if j.StreamDirect {
		key, size, err = j.runStreamDirect(ctx, log)
	} else {
		key, size, err = j.runViaTempFile(ctx, log)
	}

	duration := time.Since(start)

	if err != nil {
		log.ErrorContext(ctx, "backup job failed", "key", j.StorageKey, "duration_ms", duration.Milliseconds(), "error", err)
		return BackupResult{Key: key, Size: size, Duration: duration, Err: err}
	}

	log.InfoContext(ctx, "backup job completed", "key", key, "size_bytes", size, "duration_ms", duration.Milliseconds())
	return BackupResult{Key: key, Size: size, Duration: duration}
}

// runViaTempFile dumps → compresses into a temp file, then uploads the file.
func (j *Job) runViaTempFile(ctx context.Context, log *slog.Logger) (string, int64, error) {
	// 1. Create temp file.
	log.InfoContext(ctx, "creating temp file")
	tf, err := tempfile.New()
	if err != nil {
		return "", 0, fmt.Errorf("create temp file: %w", err)
	}
	defer func() {
		if removeErr := tf.Remove(); removeErr != nil {
			log.WarnContext(ctx, "failed to remove temp file", "path", tf.Path(), "error", removeErr)
		}
	}()

	// 2. Stream pg_dump → compressor → temp file.
	log.InfoContext(ctx, "dumping and compressing", "temp_path", tf.Path())
	pr, pw := io.Pipe()

	dumpErr := make(chan error, 1)
	go func() {
		defer pw.Close()
		if err := j.Dumper.Dump(ctx, pw); err != nil {
			pw.CloseWithError(err)
			dumpErr <- fmt.Errorf("dump: %w", err)
			return
		}
		dumpErr <- nil
	}()

	if err := j.Compressor.Compress(ctx, pr, tf.File()); err != nil {
		// drain dump error too
		<-dumpErr
		return "", 0, fmt.Errorf("compress: %w", err)
	}

	if err := <-dumpErr; err != nil {
		return "", 0, err
	}

	// 3. Seek temp file to start.
	log.InfoContext(ctx, "seeking temp file to beginning")
	if _, err := tf.File().Seek(0, io.SeekStart); err != nil {
		return "", 0, fmt.Errorf("seek temp file: %w", err)
	}

	// 4. Upload to storage backend.
	log.InfoContext(ctx, "uploading to storage", "key", j.StorageKey)
	key, size, err := j.Storage.Upload(ctx, j.StorageKey, tf.File())
	if err != nil {
		return key, size, fmt.Errorf("upload: %w", err)
	}

	// 5. Temp file is removed by the deferred Remove() above.
	return key, size, nil
}

// runStreamDirect pipes dump → compressor → uploader without a temp file.
func (j *Job) runStreamDirect(ctx context.Context, log *slog.Logger) (string, int64, error) {
	log.InfoContext(ctx, "starting direct-stream pipeline", "key", j.StorageKey)
	return RunPipeline(ctx, j.Dumper, j.Compressor, j.Storage, j.StorageKey, log)
}

func (j *Job) logger() *slog.Logger {
	if j.Logger != nil {
		return j.Logger
	}
	return slog.Default()
}