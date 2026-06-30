package compress

import (
	"compress/gzip"
	"fmt"
	"io"
)

// New returns a Compressor for the given algorithm name.
// Supported values: "gzip", "none" (pass-through).
func New(algorithm string) (Compressor, error) {
	switch algorithm {
	case "gzip", "":
		return &gzipCompressor{level: gzip.DefaultCompression}, nil
	case "none":
		return &nopCompressor{}, nil
	default:
		return nil, fmt.Errorf("unsupported compression algorithm %q", algorithm)
	}
}

// gzipCompressor compresses data with the standard library's gzip package.
type gzipCompressor struct {
	level int
}

func (c *gzipCompressor) NewWriter(w io.Writer) (io.WriteCloser, error) {
	gw, err := gzip.NewWriterLevel(w, c.level)
	if err != nil {
		return nil, fmt.Errorf("create gzip writer: %w", err)
	}
	return gw, nil
}

// nopCompressor is a pass-through that applies no compression.
type nopCompressor struct{}

func (n *nopCompressor) NewWriter(w io.Writer) (io.WriteCloser, error) {
	return &nopWriteCloser{w}, nil
}

type nopWriteCloser struct{ io.Writer }

func (n *nopWriteCloser) Close() error { return nil }