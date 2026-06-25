package compress

import (
	"fmt"
)

// Config holds configuration for selecting and tuning a compressor.
type Config struct {
	// Format is one of "gzip", "zstd", or "none".
	Format string
	// Level is the compression level. Interpretation depends on the Format.
	// For gzip: 1–9 (or -1 for default). For zstd: 1–4.
	Level int
}

// NewCompressor returns a Compressor based on the provided Config.
func NewCompressor(cfg Config) (Compressor, error) {
	switch cfg.Format {
	case "gzip":
		return NewGzipCompressor(cfg.Level), nil
	case "zstd":
		return NewZstdCompressor(cfg.Level), nil
	case "none", "":
		return &NoopCompressor{}, nil
	default:
		return nil, fmt.Errorf("compress: unknown format %q (expected gzip, zstd, or none)", cfg.Format)
	}
}