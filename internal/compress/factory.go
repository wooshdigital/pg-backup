package compress

import (
	"fmt"

	"github.com/your-org/your-project/internal/config"
)

// NewCompressor constructs a Compressor matching the supplied configuration.
// Returns an error if the format is unrecognised.
func NewCompressor(cfg config.CompressionConfig) (Compressor, error) {
	switch cfg.Format {
	case config.CompressionNone:
		return &NoneCompressor{}, nil

	case config.CompressionGzip, "":
		return &GzipCompressor{Level: cfg.Level}, nil

	case config.CompressionZstd:
		return &ZstdCompressor{Level: cfg.Level}, nil

	default:
		return nil, fmt.Errorf("compress: unknown format %q", cfg.Format)
	}
}