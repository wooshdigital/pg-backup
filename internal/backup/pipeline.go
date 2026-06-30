package backup

import (
	"context"
	"fmt"
	"io"

	"github.com/ssoready/conf/internal/compress"
	"github.com/ssoready/conf/internal/dumper"
	"github.com/ssoready/conf/internal/storage"
)

// countingReader wraps an io.Reader and counts bytes read.
type countingReader struct {
	r     io.Reader
	total int64
}

func (c *countingReader) Read(p []byte) (n int, err error) {
	n, err = c.r.Read(p)
	c.total += int64(n)
	return
}

// RunPipeline streams pg_dump output through the compressor directly into the
// storage backend without writing a local temp file. It returns the storage key
// and the number of compressed bytes uploaded.
func RunPipeline(
	ctx context.Context,
	d dumper.Dumper,
	c compress.Compressor,
	s storage.Backend,
) (key string, size int64, err error) {
	// Pipe A: dump goroutine writes raw SQL → compressor reads it.
	dumpR, dumpW := io.Pipe()

	// Pipe B: compressor writes compressed bytes → uploader reads it.
	compR, compW := io.Pipe()

	cr := &countingReader{r: compR}

	// Goroutine 1: run pg_dump and write into dumpW.
	dumpErrCh := make(chan error, 1)
	go func() {
		defer dumpW.Close()
		if dErr := d.Dump(ctx, dumpW); dErr != nil {
			dumpW.CloseWithError(dErr)
			dumpErrCh <- dErr
			return
		}
		dumpErrCh <- nil
	}()

	// Goroutine 2: compress dumpR → compW.
	compErrCh := make(chan error, 1)
	go func() {
		defer compW.Close()
		if cErr := c.Compress(dumpR, compW); cErr != nil {
			compW.CloseWithError(cErr)
			compErrCh <- cErr
			return
		}
		compErrCh <- nil
	}()

	// Main goroutine: upload from cr (counts bytes as they flow through).
	key, err = s.Put(ctx, cr)
	if err != nil {
		// Signal upstream goroutines to stop.
		_ = compR.CloseWithError(err)
		_ = dumpR.CloseWithError(err)
		// Drain error channels.
		<-compErrCh
		<-dumpErrCh
		return "", 0, fmt.Errorf("upload: %w", err)
	}

	// Collect errors from goroutines.
	if cErr := <-compErrCh; cErr != nil {
		<-dumpErrCh
		return "", 0, fmt.Errorf("compress: %w", cErr)
	}
	if dErr := <-dumpErrCh; dErr != nil {
		return "", 0, fmt.Errorf("dump: %w", dErr)
	}

	return key, cr.total, nil
}