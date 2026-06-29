package backup

import (
	"context"
	"fmt"
	"io"
	"log/slog"
	"time"

	"github.com/smnzlnsk/backup-worker/internal/compress"
	"github.com/smnzlnsk/backup-worker/internal/dumper"
	"github.com/smnzlnsk/backup-worker/internal/storage"
	"github.com/smnzlnsk/backup-worker/internal/tempfile"
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
	Dumper      dumper.Dumper
	Compressor  compress.Compressor
	Storage     storage.Backend
	StreamDirect bool
	Logger      *slog.Logger
}

// Run executes a complete backup cycle and returns a BackupResult.
func (j *Job) Run(ctx context.Context) BackupResult {
	start := time.Now()
	logger := j.Logger
	if logger == nil {
		logger = slog.Default()
	}

	logger.Info("backup job started")

	key := storage.GenerateKey(time.Now())
	logger.Info("generated storage key", "key", key)

	var (
		size int64
		err  error
	)

	if j.StreamDirect {
		size, err = j.runStreamDirect(ctx, key, logger)
	} else {
		size, err = j.runViaTempFile(ctx, key, logger)
	}

	duration := time.Since(start)

	if err != nil {
		logger.Error("backup job failed", "error", err, "duration", duration)
		return BackupResult{Err: err, Duration: duration}
	}

	logger.Info("backup job completed", "key", key, "size", size, "duration", duration)
	return BackupResult{
		Key:      key,
		Size:     size,
		Duration: duration,
	}
}

// runViaTempFile dumps → compresses → writes to a temp file, then uploads from the temp file.
func (j *Job) runViaTempFile(ctx context.Context, key string, logger *slog.Logger) (int64, error) {
	// Step 1: create temp file
	logger.Info("creating temp file")
	tmp, err := tempfile.New()
	if err != nil {
		return 0, fmt.Errorf("create temp file: %w", err)
	}
	defer func() {
		if removeErr := tmp.Remove(); removeErr != nil {
			logger.Warn("failed to remove temp file", "error", removeErr)
		}
	}()

	// Step 2: stream pg_dump → compressor → temp file
	logger.Info("starting dump and compress stage")
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

	compressedSize, err := j.Compressor.Compress(pr, tmp.File())
	if err != nil {
		pr.CloseWithError(err)
		return 0, fmt.Errorf("compress: %w", err)
	}

	if err := <-dumpErr; err != nil {
		return 0, err
	}

	logger.Info("dump and compress complete", "compressed_size", compressedSize)

	// Step 3: seek temp file to start
	if _, err := tmp.File().Seek(0, io.SeekStart); err != nil {
		return 0, fmt.Errorf("seek temp file: %w", err)
	}

	// Step 4: upload to storage
	logger.Info("uploading to storage", "key", key)
	size, err := j.Storage.Upload(ctx, key, tmp.File())
	if err != nil {
		return 0, fmt.Errorf("upload: %w", err)
	}
	logger.Info("upload complete", "key", key, "bytes_uploaded", size)

	return size, nil
}

// runStreamDirect connects compressor output directly to the uploader via io.Pipe.
func (j *Job) runStreamDirect(ctx context.Context, key string, logger *slog.Logger) (int64, error) {
	logger.Info("starting direct-stream pipeline")
	return RunStreamPipeline(ctx, j.Dumper, j.Compressor, j.Storage, key, logger)
}