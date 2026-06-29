package compress

import (
	"context"
	"io"
)

// Compressor defines the interface for compression implementations.
type Compressor interface {
	// Compress reads from r, compresses the data, and writes to w.
	Compress(ctx context.Context, r io.Reader, w io.Writer) error
	// Extension returns the file extension associated with this compressor (e.g. ".gz").
	Extension() string
}

// DefaultLevel is the default compression level used when none is specified.
const DefaultLevel = -1