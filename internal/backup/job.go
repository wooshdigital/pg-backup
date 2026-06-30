package backup

import (
	"context"
	"fmt"
	"io"
	"log/slog"
	"time"

	"github.com/sdreger/cmd-worker/internal/compress"
	"github.com/sdreger/cmd-worker/internal/dumper"
	"github.com/sdreger/cmd-worker/internal/storage"
	"github.com/sdreger/cmd-worker/internal/tempfile"
)

// BackupResult holds the outcome of a completed backup operation.
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
	// StreamDirect bypasses the temp file and pipes data directly from the
	// compressor to the uploader. Useful when disk space is scarce.
	StreamDirect bool
	Logger       *slog.Logger
}

// Run executes a complete backup cycle and returns a BackupResult.
func (j *Job) Run(ctx context.Context) BackupResult {
	start := time.Now()
	logger := j.Logger
	if logger == nil {
		logger = slog.Default()
	}

	logger.InfoContext(ctx, "backup job started")

	key := storage.GenerateKey(time.Now())
	logger.InfoContext(ctx, "generated storage key", slog.String("key", key))

	var (
		size int64
		err  error
	)

	if j.StreamDirect {
		size, err = j.runStreaming(ctx, key, logger)
	} else {
		size, err = j.runViaTemp(ctx, key, logger)
	}

	duration := time.Since(start)

	if err != nil {
		logger.ErrorContext(ctx, "backup job failed",
			slog.String("key", key),
			slog.Duration("duration", duration),
			slog.String("error", err.Error()),
		)
		return BackupResult{Key: key, Duration: duration, Err: err}
	}

	logger.InfoContext(ctx, "backup job completed",
		slog.String("key", key),
		slog.Int64("size_bytes", size),
		slog.Duration("duration", duration),
	)

	return BackupResult{
		Key:      key,
		Size:     size,
		Duration: duration,
	}
}

// runViaTemp writes the dump through the compressor into a temporary file,
// then seeks back to the start and uploads from there.
func (j *Job) runViaTemp(ctx context.Context, key string, logger *slog.Logger) (int64, error) {
	logger.InfoContext(ctx, "creating temporary file")

	tmp, err := tempfile.New()
	if err != nil {
		return 0, fmt.Errorf("create temp file: %w", err)
	}
	defer func() {
		if removeErr := tmp.Remove(); removeErr != nil {
			logger.WarnContext(ctx, "failed to remove temp file",
				slog.String("path", tmp.Path()),
				slog.String("error", removeErr.Error()),
			)
		}
	}()

	logger.InfoContext(ctx, "temp file created", slog.String("path", tmp.Path()))

	// Stage 1: dump → compress → temp file
	logger.InfoContext(ctx, "starting dump and compress stage")
	cw, err := j.Compressor.NewWriter(tmp.File())
	if err != nil {
		return 0, fmt.Errorf("create compressor writer: %w", err)
	}

	if err = j.Dumper.Dump(ctx, cw); err != nil {
		_ = cw.Close()
		return 0, fmt.Errorf("dump: %w", err)
	}

	if err = cw.Close(); err != nil {
		return 0, fmt.Errorf("close compressor writer: %w", err)
	}
	logger.InfoContext(ctx, "dump and compress stage completed")

	// Stage 2: seek to beginning for upload
	if _, err = tmp.File().Seek(0, io.SeekStart); err != nil {
		return 0, fmt.Errorf("seek temp file: %w", err)
	}

	// Stage 3: upload
	logger.InfoContext(ctx, "starting upload stage", slog.String("key", key))
	size, err := j.Storage.Upload(ctx, key, tmp.File())
	if err != nil {
		return 0, fmt.Errorf("upload: %w", err)
	}
	logger.InfoContext(ctx, "upload stage completed",
		slog.String("key", key),
		slog.Int64("size_bytes", size),
	)

	return size, nil
}

// runStreaming connects the compressor output directly to the uploader via an
// io.Pipe, avoiding a local temp file write.
func (j *Job) runStreaming(ctx context.Context, key string, logger *slog.Logger) (int64, error) {
	logger.InfoContext(ctx, "starting streaming pipeline (no temp file)", slog.String("key", key))

	size, err := RunStreamingPipeline(ctx, key, j.Dumper, j.Compressor, j.Storage)
	if err != nil {
		return 0, err
	}

	logger.InfoContext(ctx, "streaming pipeline completed",
		slog.String("key", key),
		slog.Int64("size_bytes", size),
	)
	return size, nil
}