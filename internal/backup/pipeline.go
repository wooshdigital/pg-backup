package backup

import (
	"context"
	"fmt"
	"io"

	"github.com/sdreger/cmd-worker/internal/compress"
	"github.com/sdreger/cmd-worker/internal/dumper"
	"github.com/sdreger/cmd-worker/internal/storage"
)

// RunStreamingPipeline streams pg_dump output through the compressor and
// uploads the compressed bytes directly to storage without writing a temp file.
//
// It uses an io.Pipe to connect the compressor writer (producer goroutine) to
// the storage uploader (consumer on the current goroutine).
func RunStreamingPipeline(
	ctx context.Context,
	key string,
	d dumper.Dumper,
	c compress.Compressor,
	s storage.StorageBackend,
) (int64, error) {
	pr, pw := io.Pipe()

	// Producer goroutine: dump → compress → pipe writer
	producerErr := make(chan error, 1)
	go func() {
		defer close(producerErr)

		cw, err := c.NewWriter(pw)
		if err != nil {
			_ = pw.CloseWithError(fmt.Errorf("create compressor writer: %w", err))
			producerErr <- err
			return
		}

		if err = d.Dump(ctx, cw); err != nil {
			_ = cw.Close()
			_ = pw.CloseWithError(fmt.Errorf("dump: %w", err))
			producerErr <- err
			return
		}

		if err = cw.Close(); err != nil {
			_ = pw.CloseWithError(fmt.Errorf("close compressor writer: %w", err))
			producerErr <- err
			return
		}

		_ = pw.Close()
	}()

	// Consumer: read from pipe reader → upload
	size, uploadErr := s.Upload(ctx, key, pr)
	if uploadErr != nil {
		// Signal the producer to stop if it's still running.
		_ = pr.CloseWithError(uploadErr)
	}

	// Wait for the producer to finish and collect its error.
	pErr := <-producerErr

	if pErr != nil {
		return 0, fmt.Errorf("producer error: %w", pErr)
	}
	if uploadErr != nil {
		return 0, fmt.Errorf("upload error: %w", uploadErr)
	}

	return size, nil
}