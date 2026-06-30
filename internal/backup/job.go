package backup

import (
	"context"
	"fmt"
	"io"
	"log/slog"
	"time"

	"github.com/ssoready/conf/internal/compress"
	"github.com/ssoready/conf/internal/dumper"
	"github.com/ssoready/conf/internal/storage"
	"github.com/ssoready/conf/internal/tempfile"
)

// BackupResult holds the outcome of a completed backup run.
type BackupResult struct {
	Key      string
	Size     int64
	Duration time.Duration
	Err      error
}

// Job orchestrates the full backup cycle: dump → compress → upload.
type Job struct {
	Dumper    dumper.Dumper
	Compressor compress.Compressor
	Storage   storage.Backend
	Logger    *slog.Logger

	// StreamDirect, when true, streams compressed data directly to the uploader
	// via an io.Pipe, bypassing the intermediate temp file.
	StreamDirect bool
}

// Run executes a single full backup cycle and returns a BackupResult.
func (j *Job) Run(ctx context.Context) BackupResult {
	start := time.Now()
	log := j.Logger
	if log == nil {
		log = slog.Default()
	}

	log.InfoContext(ctx, "backup.start")

	var (
		key  string
		size int64
		err  error
	)

	if j.StreamDirect {
		key, size, err = j.runStreamed(ctx, log)
	} else {
		key, size, err = j.runBuffered(ctx, log)
	}

	dur := time.Since(start)

	if err != nil {
		log.ErrorContext(ctx, "backup.failed",
			slog.String("error", err.Error()),
			slog.Duration("duration", dur),
		)
		return BackupResult{Err: err, Duration: dur}
	}

	log.InfoContext(ctx, "backup.complete",
		slog.String("key", key),
		slog.Int64("size_bytes", size),
		slog.Duration("duration", dur),
	)

	return BackupResult{
		Key:      key,
		Size:     size,
		Duration: dur,
	}
}

// runBuffered writes dump output through the compressor into a temp file, then
// seeks back to the beginning and uploads.
func (j *Job) runBuffered(ctx context.Context, log *slog.Logger) (string, int64, error) {
	// 1. Create temp file.
	log.InfoContext(ctx, "backup.tempfile.create")
	tf, err := tempfile.New()
	if err != nil {
		return "", 0, fmt.Errorf("create temp file: %w", err)
	}
	defer func() {
		if removeErr := tf.Remove(); removeErr != nil {
			log.WarnContext(ctx, "backup.tempfile.remove_failed",
				slog.String("error", removeErr.Error()),
			)
		}
	}()

	// 2. Stream pg_dump → compressor → temp file.
	log.InfoContext(ctx, "backup.dump.start")
	if err = j.dumpCompressTo(ctx, tf); err != nil {
		return "", 0, fmt.Errorf("dump and compress: %w", err)
	}
	log.InfoContext(ctx, "backup.dump.complete")

	// 3. Seek temp file to start.
	if _, err = tf.Seek(0, io.SeekStart); err != nil {
		return "", 0, fmt.Errorf("seek temp file: %w", err)
	}

	// Get size for logging.
	info, err := tf.Stat()
	if err != nil {
		return "", 0, fmt.Errorf("stat temp file: %w", err)
	}
	size := info.Size()
	log.InfoContext(ctx, "backup.upload.start",
		slog.Int64("size_bytes", size),
	)

	// 4. Upload to storage.
	key, err := j.Storage.Put(ctx, tf)
	if err != nil {
		return "", 0, fmt.Errorf("upload: %w", err)
	}
	log.InfoContext(ctx, "backup.upload.complete", slog.String("key", key))

	// 5. Temp file is removed by the deferred tf.Remove() above.
	return key, size, nil
}

// runStreamed pipes dump output through the compressor directly to the uploader
// without buffering in a temp file.
func (j *Job) runStreamed(ctx context.Context, log *slog.Logger) (string, int64, error) {
	log.InfoContext(ctx, "backup.stream.start")
	key, size, err := RunPipeline(ctx, j.Dumper, j.Compressor, j.Storage)
	if err != nil {
		return "", 0, fmt.Errorf("stream pipeline: %w", err)
	}
	log.InfoContext(ctx, "backup.stream.complete",
		slog.String("key", key),
		slog.Int64("size_bytes", size),
	)
	return key, size, nil
}

// dumpCompressTo runs pg_dump, passes its output through the compressor, and
// writes the result into dst.
func (j *Job) dumpCompressTo(ctx context.Context, dst io.Writer) error {
	pr, pw := io.Pipe()

	dumpErrCh := make(chan error, 1)
	go func() {
		defer pw.Close()
		dumpErrCh <- j.Dumper.Dump(ctx, pw)
	}()

	if err := j.Compressor.Compress(pr, dst); err != nil {
		// Drain the pipe so the goroutine can exit.
		_, _ = io.Copy(io.Discard, pr)
		<-dumpErrCh
		return fmt.Errorf("compress: %w", err)
	}

	if err := <-dumpErrCh; err != nil {
		return fmt.Errorf("dump: %w", err)
	}
	return nil
}