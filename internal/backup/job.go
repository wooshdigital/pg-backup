package backup

import (
	"context"
	"fmt"
	"io"
	"log/slog"
	"time"

	"github.com/sgorgun/go-backup/internal/compress"
	"github.com/sgorgun/go-backup/internal/dumper"
	"github.com/sgorgun/go-backup/internal/storage"
	"github.com/sgorgun/go-backup/internal/tempfile"
)

// BackupResult holds the outcome of a completed backup run.
type BackupResult struct {
	Key      string
	Size     int64
	Duration time.Duration
	Err      error
}

// Job orchestrates the full backup pipeline: dump → compress → upload.
type Job struct {
	Dumper    dumper.Dumper
	Compressor compress.Compressor
	Storage   storage.Backend
	// StreamDirect, when true, pipes compressor output directly to the uploader
	// without writing to a temp file first.
	StreamDirect bool
	// KeyFunc generates the storage key for each backup.
	KeyFunc func() string
}

// Run executes one full backup cycle and returns a BackupResult.
func (j *Job) Run(ctx context.Context) BackupResult {
	start := time.Now()

	key := j.key()
	slog.Info("backup started", "key", key, "stream_direct", j.StreamDirect)

	var (
		size int64
		err  error
	)

	if j.StreamDirect {
		size, err = j.runStreamDirect(ctx, key)
	} else {
		size, err = j.runViaTempFile(ctx, key)
	}

	duration := time.Since(start)
	result := BackupResult{
		Key:      key,
		Size:     size,
		Duration: duration,
		Err:      err,
	}

	if err != nil {
		slog.Error("backup failed",
			"key", key,
			"duration_ms", duration.Milliseconds(),
			"error", err,
		)
	} else {
		slog.Info("backup completed",
			"key", key,
			"size_bytes", size,
			"duration_ms", duration.Milliseconds(),
		)
	}

	return result
}

// runViaTempFile dumps → compresses → writes to temp file, then uploads the temp file.
func (j *Job) runViaTempFile(ctx context.Context, key string) (int64, error) {
	// 1. Create temp file.
	slog.Debug("creating temp file")
	tf, err := tempfile.New()
	if err != nil {
		return 0, fmt.Errorf("create temp file: %w", err)
	}
	defer func() {
		if removeErr := tf.Remove(); removeErr != nil {
			slog.Warn("failed to remove temp file", "path", tf.Path(), "error", removeErr)
		}
	}()

	// 2. Stream pg_dump → compressor → temp file.
	slog.Debug("dumping database", "key", key)
	dumpReader, err := j.Dumper.Dump(ctx)
	if err != nil {
		return 0, fmt.Errorf("start dump: %w", err)
	}

	slog.Debug("compressing dump output")
	compressedReader, err := j.Compressor.Compress(dumpReader)
	if err != nil {
		return 0, fmt.Errorf("compress: %w", err)
	}

	written, err := io.Copy(tf.File(), compressedReader)
	if err != nil {
		return 0, fmt.Errorf("write compressed data to temp file: %w", err)
	}
	slog.Debug("dump+compress complete", "bytes_written", written)

	// 3. Seek temp file back to start.
	if _, err = tf.File().Seek(0, io.SeekStart); err != nil {
		return 0, fmt.Errorf("seek temp file: %w", err)
	}

	// 4. Upload to storage.
	slog.Debug("uploading to storage", "key", key)
	size, err := j.Storage.Put(ctx, key, tf.File())
	if err != nil {
		return 0, fmt.Errorf("upload: %w", err)
	}

	return size, nil
}

// runStreamDirect connects dump → compressor → uploader via io.Pipe (no temp file).
func (j *Job) runStreamDirect(ctx context.Context, key string) (int64, error) {
	return RunPipeline(ctx, j.Dumper, j.Compressor, j.Storage, key)
}

// key returns the storage key for this backup, using KeyFunc if set.
func (j *Job) key() string {
	if j.KeyFunc != nil {
		return j.KeyFunc()
	}
	return storage.NewKey(time.Now())
}