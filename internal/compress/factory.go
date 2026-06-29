package compress

import (
	"fmt"
)

// Config holds configuration for selecting and tuning the compressor.
type Config struct {
	Algorithm string `yaml:"algorithm"`
	Level     int    `yaml:"level"`
}

// NewFromConfig creates a Compressor from a Config.
func NewFromConfig(cfg Config) (Compressor, error) {
	switch cfg.Algorithm {
	case "gzip", "":
		level := cfg.Level
		if level == 0 {
			level = DefaultLevel
		}
		return NewGzip(level)
	case "zstd":
		return NewZstd(cfg.Level)
	default:
		return nil, fmt.Errorf("unknown compression algorithm: %q", cfg.Algorithm)
	}
}