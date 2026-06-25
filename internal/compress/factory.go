package compress

import (
	"fmt"

	"github.com/klauspost/compress/zstd"
)

// Format identifies a compression algorithm.
type Format string

const (
	FormatNone Format = "none"
	FormatGzip Format = "gzip"
	FormatZstd Format = "zstd"
)

// Config holds parameters used by NewCompressor.
type Config struct {
	// Format selects the compression algorithm.
	Format Format
	// Level is an algorithm-specific compression level. When zero, a sensible
	// default is chosen for the selected format.
	Level int
}

// NewCompressor returns a Compressor configured according to cfg.
// An error is returned if the format is unrecognised.
func NewCompressor(cfg Config) (Compressor, error) {
	switch cfg.Format {
	case FormatNone, "":
		return &NopCompressor{}, nil

	case FormatGzip:
		return &GzipCompressor{Level: cfg.Level}, nil

	case FormatZstd:
		var level zstd.EncoderLevel
		if cfg.Level == 0 {
			level = zstd.SpeedDefault
		} else {
			level = zstd.EncoderLevelFromZstd(cfg.Level)
		}
		return &ZstdCompressor{Level: level}, nil

	default:
		return nil, fmt.Errorf("compress: unknown format %q (valid: none, gzip, zstd)", cfg.Format)
	}
}