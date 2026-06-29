package backup

import (
	"context"
	"fmt"
	"io"
	"log/slog"
	"time"

	"github.com/example/dbbackup/internal/compress"
	"github.com/example/dbbackup/internal/dumper"
	"github.com/example/dbbackup/internal/storage"
	"github.com/example/dbbackup/internal/tempfile"
)

// BackupResult holds the outcome of a completed backup run.
type BackupResult struct {
	Key      string
	Size     int64
	Duration time.Duration
	Err      error
}

// Job orchestrates a single backup cycle: dump → compress → upload.
type Job struct {
	Dumper    dumper.Dumper
	Compressor compress.Compressor
	Storage   storage.StorageBackend
	// StorageKey is the object key used when uploading to the storage backend.
	StorageKey string
	// StreamDirect skips the temporary file and pipes the compressed stream
	// directly into the uploader.
	StreamDirect bool
	Logger       *slog.Logger
}

// Run executes a complete backup cycle and returns a BackupResult.
func (j *Job) Run(ctx context.Context) BackupResult {
	start := time.Now()
	log := j.logger()

	log.Info("backup started", "key", j.StorageKey, "stream_direct", j.StreamDirect)

	var (
		size int64
		err  error
	)

	if j.StreamDirect {
		size, err = j.runDirect(ctx, log)
	} else {
		size, err = j.runViaTemp(ctx, log)
	}

	result := BackupResult{
		Key:      j.StorageKey,
		Size:     size,
		Duration: time.Since(start),
		Err:      err,
	}

	if err != nil {
		log.Error("backup failed", "key", j.StorageKey, "duration", result.Duration, "error", err)
	} else {
		log.Info("backup completed", "key", j.StorageKey, "size_bytes", size, "duration", result.Duration)
	}

	return result
}

// runViaTemp dumps → compresses into a temp file, then uploads the file.
func (j *Job) runViaTemp(ctx context.Context, log *slog.Logger) (int64, error) {
	// 1. Create temp file.
	log.Debug("creating temp file")
	tf, err := tempfile.New()
	if err != nil {
		return 0, fmt.Errorf("create temp file: %w", err)
	}
	defer func() {
		log.Debug("removing temp file", "path", tf.Name())
		_ = tf.Remove()
	}()

	// 2. Dump → compress → temp file.
	log.Debug("starting dump+compress to temp file")
	cw, err := j.Compressor.Wrap(tf)
	if err != nil {
		return 0, fmt.Errorf("wrap compressor: %w", err)
	}

	if err = j.Dumper.Dump(ctx, cw); err != nil {
		return 0, fmt.Errorf("dump: %w", err)
	}

	if err = cw.Close(); err != nil {
		return 0, fmt.Errorf("close compressor: %w", err)
	}
	log.Debug("dump+compress finished")

	// 3. Seek to start.
	if _, err = tf.Seek(0, io.SeekStart); err != nil {
		return 0, fmt.Errorf("seek temp file: %w", err)
	}

	// 4. Upload.
	log.Info("uploading backup", "key", j.StorageKey)
	fi, err := tf.Stat()
	if err != nil {
		return 0, fmt.Errorf("stat temp file: %w", err)
	}
	size := fi.Size()

	if err = j.Storage.Upload(ctx, j.StorageKey, tf, size); err != nil {
		return 0, fmt.Errorf("upload: %w", err)
	}
	log.Info("upload complete", "key", j.StorageKey, "size_bytes", size)

	return size, nil
}

// runDirect pipes dump → compress → uploader without a temporary file.
func (j *Job) runDirect(ctx context.Context, log *slog.Logger) (int64, error) {
	pr, pw := io.Pipe()

	// Wrap the pipe writer with the compressor.
	cw, err := j.Compressor.Wrap(pw)
	if err != nil {
		return 0, fmt.Errorf("wrap compressor: %w", err)
	}

	// Run the dump in a goroutine so the upload can consume concurrently.
	dumpErrCh := make(chan error, 1)
	go func() {
		log.Debug("dump goroutine started")
		dErr := j.Dumper.Dump(ctx, cw)
		if dErr != nil {
			_ = cw.Close()
			_ = pw.CloseWithError(fmt.Errorf("dump: %w", dErr))
			dumpErrCh <- dErr
			return
		}
		if dErr = cw.Close(); dErr != nil {
			_ = pw.CloseWithError(fmt.Errorf("close compressor: %w", dErr))
			dumpErrCh <- dErr
			return
		}
		_ = pw.Close()
		dumpErrCh <- nil
	}()

	// Count bytes as they flow through.
	cr := &countingReader{r: pr}

	log.Info("streaming upload started", "key", j.StorageKey)
	// Size is unknown for direct streaming; pass -1 to indicate streaming.
	uploadErr := j.Storage.Upload(ctx, j.StorageKey, cr, -1)

	dumpErr := <-dumpErrCh

	if dumpErr != nil {
		return cr.n, fmt.Errorf("dump: %w", dumpErr)
	}
	if uploadErr != nil {
		return cr.n, fmt.Errorf("upload: %w", uploadErr)
	}

	log.Info("streaming upload complete", "key", j.StorageKey, "size_bytes", cr.n)
	return cr.n, nil
}

func (j *Job) logger() *slog.Logger {
	if j.Logger != nil {
		return j.Logger
	}
	return slog.Default()
}

// countingReader wraps an io.Reader and counts bytes read.
type countingReader struct {
	r io.Reader
	n int64
}

func (c *countingReader) Read(p []byte) (int, error) {
	n, err := c.r.Read(p)
	c.n += int64(n)
	return n, err
}