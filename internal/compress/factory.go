package compress

import (
	"compress/gzip"
	"fmt"
)

// Factory creates Compressor instances by algorithm name.
type Factory struct{}

// NewFactory returns a new Factory.
func NewFactory() *Factory {
	return &Factory{}
}

// Create returns a Compressor for the named algorithm.
// Supported algorithms: "gzip", "zstd" (zstd falls back to gzip for now).
func (f *Factory) Create(algorithm string) (Compressor, error) {
	switch algorithm {
	case "gzip", "":
		return NewGzip(gzip.DefaultCompression), nil
	default:
		return nil, fmt.Errorf("unsupported compression algorithm: %q", algorithm)
	}
}