package compress

import (
	"compress/gzip"
	"fmt"
	"io"
)

// Factory creates Compressor instances by algorithm name.
type Factory struct{}

// NewFactory returns a new Factory.
func NewFactory() *Factory { return &Factory{} }

// Create returns a Compressor for the given algorithm using its default level.
func (f *Factory) Create(algorithm string) (Compressor, error) {
	switch algorithm {
	case "gzip", "gz":
		return &gzipCompressor{level: gzip.DefaultCompression}, nil
	case "none", "":
		return &noopCompressorImpl{}, nil
	default:
		return nil, fmt.Errorf("unknown compression algorithm %q", algorithm)
	}
}

// CreateWithLevel returns a Compressor for the given algorithm at a specific level.
func (f *Factory) CreateWithLevel(algorithm string, level int) (Compressor, error) {
	switch algorithm {
	case "gzip", "gz":
		if level < gzip.HuffmanOnly || level > gzip.BestCompression {
			return nil, fmt.Errorf("gzip level %d out of range [%d, %d]", level, gzip.HuffmanOnly, gzip.BestCompression)
		}
		return &gzipCompressor{level: level}, nil
	case "none", "":
		return &noopCompressorImpl{}, nil
	default:
		return nil, fmt.Errorf("unknown compression algorithm %q", algorithm)
	}
}

// --- gzip ---

type gzipCompressor struct {
	level int
}

func (g *gzipCompressor) Extension() string { return ".gz" }

func (g *gzipCompressor) Compress(r io.Reader, w io.Writer) error {
	gz, err := gzip.NewWriterLevel(w, g.level)
	if err != nil {
		return fmt.Errorf("gzip writer: %w", err)
	}
	if _, err = io.Copy(gz, r); err != nil {
		return fmt.Errorf("gzip copy: %w", err)
	}
	return gz.Close()
}

// --- noop ---

type noopCompressorImpl struct{}

func (n *noopCompressorImpl) Extension() string { return "" }

func (n *noopCompressorImpl) Compress(r io.Reader, w io.Writer) error {
	_, err := io.Copy(w, r)
	return err
}