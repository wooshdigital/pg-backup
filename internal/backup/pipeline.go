package backup

import (
	"context"
	"fmt"
	"io"
	"log/slog"

	"github.com/smnzlnsk/backup-worker/internal/compress"
	"github.com/smnzlnsk/backup-worker/internal/dumper"
	"github.com/smnzlnsk/backup-worker/internal/storage"
)

// RunStreamPipeline connects pg_dump → compressor → uploader using io.Pipe,
// avoiding the need for a temporary file on disk.
func RunStreamPipeline(
	ctx context.Context,
	d dumper.Dumper,
	c compress.Compressor,
	s storage.Backend,
	key string,
	logger *slog.Logger,
) (int64, error) {
	// Pipe 1: dump output → compressor input
	dumpReader, dumpWriter := io.Pipe()

	// Pipe 2: compressor output → uploader input
	uploadReader, uploadWriter := io.Pipe()

	dumpErrCh := make(chan error, 1)
	compressErrCh := make(chan error, 1)

	// Stage 1: run pg_dump into dumpWriter
	go func() {
		defer dumpWriter.Close()
		if err := d.Dump(ctx, dumpWriter); err != nil {
			dumpWriter.CloseWithError(err)
			dumpErrCh <- fmt.Errorf("dump stage: %w", err)
			return
		}
		dumpErrCh <- nil
	}()

	// Stage 2: compress dumpReader output into uploadWriter
	go func() {
		defer uploadWriter.Close()
		_, err := c.Compress(dumpReader, uploadWriter)
		if err != nil {
			dumpReader.CloseWithError(err)
			uploadWriter.CloseWithError(err)
			compressErrCh <- fmt.Errorf("compress stage: %w", err)
			return
		}
		compressErrCh <- nil
	}()

	// Stage 3: upload from uploadReader (blocking)
	if logger != nil {
		logger.Info("streaming upload started", "key", key)
	}
	size, uploadErr := s.Upload(ctx, key, uploadReader)
	// Drain the pipe so goroutines can finish
	if uploadErr != nil {
		uploadReader.CloseWithError(uploadErr)
	}

	compressErr := <-compressErrCh
	dumpErr := <-dumpErrCh

	if dumpErr != nil {
		return 0, dumpErr
	}
	if compressErr != nil {
		return 0, compressErr
	}
	if uploadErr != nil {
		return 0, fmt.Errorf("upload stage: %w", uploadErr)
	}

	if logger != nil {
		logger.Info("streaming upload complete", "key", key, "bytes", size)
	}
	return size, nil
}