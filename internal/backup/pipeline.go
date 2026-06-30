package backup

import (
	"context"
	"fmt"
	"io"
	"log/slog"

	"github.com/smlgh/smarti/internal/compress"
	"github.com/smlgh/smarti/internal/dumper"
	"github.com/smlgh/smarti/internal/storage"
)

// RunPipeline connects the dumper → compressor → storage uploader using two
// io.Pipe pairs, avoiding any intermediate temp file.
//
//	goroutine 1:  Dumper.Dump  → pw1
//	goroutine 2:  pr1 → Compressor.Compress → pw2
//	main:         pr2 → Storage.Upload
func RunPipeline(
	ctx context.Context,
	d dumper.Dumper,
	c compress.Compressor,
	s storage.StorageBackend,
	key string,
	log *slog.Logger,
) (string, int64, error) {
	if log == nil {
		log = slog.Default()
	}

	// Pipe 1: raw dump output.
	pr1, pw1 := io.Pipe()
	// Pipe 2: compressed output.
	pr2, pw2 := io.Pipe()

	dumpErrCh := make(chan error, 1)
	compressErrCh := make(chan error, 1)

	// Goroutine 1: run the dumper.
	go func() {
		defer func() {
			_ = pw1.Close()
		}()
		if err := d.Dump(ctx, pw1); err != nil {
			_ = pw1.CloseWithError(err)
			dumpErrCh <- fmt.Errorf("dump: %w", err)
			return
		}
		dumpErrCh <- nil
	}()

	// Goroutine 2: compress pipe1 → pipe2.
	go func() {
		defer func() {
			_ = pw2.Close()
		}()
		if err := c.Compress(ctx, pr1, pw2); err != nil {
			_ = pw2.CloseWithError(err)
			compressErrCh <- fmt.Errorf("compress: %w", err)
			return
		}
		compressErrCh <- nil
	}()

	// Main: upload from pipe2.
	uploadedKey, size, uploadErr := s.Upload(ctx, key, pr2)

	// Drain goroutines – they finish when Upload returns (pipe closed).
	dumpErr := <-dumpErrCh
	compressErr := <-compressErrCh

	// Propagate errors in priority order: dump > compress > upload.
	if dumpErr != nil {
		return uploadedKey, size, dumpErr
	}
	if compressErr != nil {
		return uploadedKey, size, compressErr
	}
	if uploadErr != nil {
		return uploadedKey, size, fmt.Errorf("upload: %w", uploadErr)
	}

	return uploadedKey, size, nil
}