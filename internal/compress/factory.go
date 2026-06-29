package compress

import "fmt"

// Factory creates Compressor instances by name.
type Factory struct{}

// NewFactory returns a new Factory.
func NewFactory() *Factory {
	return &Factory{}
}

// Get returns a Compressor for the given algorithm name.
// Supported: "gzip", "zstd", "none".
func (f *Factory) Get(algorithm string) (Compressor, error) {
	switch algorithm {
	case "gzip", "":
		return &GzipCompressor{}, nil
	case "zstd":
		return &ZstdCompressor{}, nil
	case "none":
		return &NoopCompressor{}, nil
	default:
		return nil, fmt.Errorf("unsupported compression algorithm: %q", algorithm)
	}
}