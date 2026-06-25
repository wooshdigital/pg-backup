package compress

import (
	"compress/gzip"
	"fmt"

	"github.com/klauspost/compress/zstd"
)

// Format represents the compression format.
type Format string

const (
	FormatGzip Format = "gzip"
	FormatZstd Format = "zstd"
	FormatNone Format = "none"
)

// Config holds configuration for creating a Compressor.
type Config struct {
	Format Format
	// Level is the compression level. For gzip: 1–9 or -1 (default).
	// For zstd: 1–4 (maps to SpeedFastest through BestCompression).
	Level int
}

// NewCompressor creates a Compressor based on the provided Config.
func NewCompressor(cfg Config) (Compressor, error) {
	switch cfg.Format {
	case FormatGzip:
		level := cfg.Level
		if level == 0 {
			level = gzip.DefaultCompression
		}
		return NewGzipCompressor(level)
	case FormatZstd:
		level := zstdLevel(cfg.Level)
		return NewZstdCompressor(level)
	case FormatNone, "":
		return &NopCompressor{}, nil
	default:
		return nil, fmt.Errorf("compress: unknown format %q", cfg.Format)
	}
}

// zstdLevel maps an integer (1–4) to a zstd.EncoderLevel.
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