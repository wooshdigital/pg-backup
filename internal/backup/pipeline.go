package backup

import (
	"context"
	"fmt"
	"io"
	"log/slog"

	"github.com/sgorgun/go-backup/internal/compress"
	"github.com/sgorgun/go-backup/internal/dumper"
	"github.com/sgorgun/go-backup/internal/storage"
)

// RunPipeline streams dump output through the compressor and directly into the
// storage backend using an io.Pipe, avoiding any temp file on disk.
//
// The pipeline looks like:
//
//	pg_dump → compressor → io.Pipe → storage.Put
func RunPipeline(
	ctx context.Context,
	d dumper.Dumper,
	c compress.Compressor,
	s storage.Backend,
	key string,
) (int64, error) {
	slog.Debug("pipeline: starting direct-stream backup", "key", key)

	// Start the dump.
	dumpReader, err := d.Dump(ctx)
	if err != nil {
		return 0, fmt.Errorf("pipeline: start dump: %w", err)
	}

	// Wrap the dump reader with the compressor.
	compressedReader, err := c.Compress(dumpReader)
	if err != nil {
		return 0, fmt.Errorf("pipeline: compress: %w", err)
	}

	// Create an io.Pipe so we can stream the compressor output into storage.Put
	// without buffering everything in memory or on disk.
	pr, pw := io.Pipe()

	// Goroutine: copy compressed data into the pipe writer.
	copyErrCh := make(chan error, 1)
	go func() {
		_, copyErr := io.Copy(pw, compressedReader)
		// Close the writer; this signals EOF (or error) to the reader side.
		pw.CloseWithError(copyErr)
		copyErrCh <- copyErr
	}()

	// Upload from the pipe reader side; this blocks until the writer goroutine finishes.
	slog.Debug("pipeline: uploading", "key", key)
	size, uploadErr := s.Put(ctx, key, pr)
	// Drain copy error (writer goroutine should have already finished at this point).
	copyErr := <-copyErrCh

	if uploadErr != nil {
		return 0, fmt.Errorf("pipeline: upload: %w", uploadErr)
	}
	if copyErr != nil {
		return 0, fmt.Errorf("pipeline: compress copy: %w", copyErr)
	}

	slog.Debug("pipeline: direct-stream complete", "key", key, "size_bytes", size)
	return size, nil
}