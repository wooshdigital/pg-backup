package compress

import "io"

// Compressor wraps a writer with a compression layer.
type Compressor interface {
	// NewWriter returns a WriteCloser that compresses data written to it and
	// forwards the compressed bytes to w.
	// The caller MUST call Close() to flush any pending compressed data.
	NewWriter(w io.Writer) (io.WriteCloser, error)
}