package compress

import (
	"compress/gzip"
	"fmt"

	"github.com/klauspost/compress/zstd"
)

// Format represents a supported compression format.
type Format string

const (
	FormatNone Format = "none"
	FormatGzip Format = "gzip"
	FormatZstd Format = "zstd"
)

// Config holds compression configuration used by NewCompressor.
type Config struct {
	Format Format
	// Level is the compression level. Interpretation depends on the Format:
	//   gzip: 1-9 (or -1 for default)
	//   zstd: 1-4 mapping to SpeedFastest..SpeedBestCompression
	//   none: ignored
	Level int
}

// DefaultConfig returns a Config with sensible defaults (gzip at default level).
func DefaultConfig() Config {
	return Config{
		Format: FormatGzip,
		Level:  gzip.DefaultCompression,
	}
}

// NewCompressor constructs the appropriate Compressor for the given Config.
func NewCompressor(cfg Config) (Compressor, error) {
	switch cfg.Format {
	case FormatNone, "":
		return &NopCompressor{}, nil

	case FormatGzip:
		level := cfg.Level
		if level == 0 {
			level = gzip.DefaultCompression
		}
		return NewGzipCompressor(level)

	case FormatZstd:
		level := zstdLevel(cfg.Level)
		return NewZstdCompressor(level)

	default:
		return nil, fmt.Errorf("compress: unknown format %q", cfg.Format)
	}
}

// zstdLevel maps a numeric level (1-4) to a zstd.EncoderLevel.
// Out-of-range values default to SpeedDefault.
func zstdLevel(l int) zstd.EncoderLevel {
	switch l {
	case 1:
		return zstd.SpeedFastest
	case 2:
		return zstd.SpeedDefault
	case 3:
		return zstd.SpeedBetterCompression
	case 4:
		return zstd.SpeedBestCompression
	default:
		return zstd.SpeedDefault
	}
}