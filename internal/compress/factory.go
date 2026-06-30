package compress

import (
	"fmt"

	"github.com/smlgh/smarti/internal/config"
)

// DefaultGzipLevel is the default gzip compression level.
const DefaultGzipLevel = 6

// FromConfig constructs a Compressor from the application config.
func FromConfig(cfg config.CompressConfig) (Compressor, error) {
	switch cfg.Algorithm {
	case "gzip", "gz", "":
		level := cfg.Level
		if level == 0 {
			level = DefaultGzipLevel
		}
		return NewGzip(level), nil
	case "zstd":
		return NewZstd(), nil
	case "noop", "none":
		return NewNoop(), nil
	default:
		return nil, fmt.Errorf("unknown compression algorithm: %q", cfg.Algorithm)
	}
}