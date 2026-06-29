package compress

import "io"

// Compressor wraps an io.Writer with a compression layer.
type Compressor interface {
	// Wrap returns a WriteCloser that compresses data written to it and
	// forwards the compressed bytes to w. The caller must call Close() on the
	// returned WriteCloser to flush and finalise the compressed stream.
	Wrap(w io.Writer) (io.WriteCloser, error)

	// Extension returns the file extension associated with this compressor
	// (e.g. ".gz").
	Extension() string
}