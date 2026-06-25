// Package config loads and validates worker configuration from a YAML file.
package config

import (
	"fmt"
	"os"

	"gopkg.in/yaml.v3"

	"github.com/example/pgdumpworker/internal/compress"
)

// Config holds the complete worker configuration.
type Config struct {
	// Database connection string (DSN / postgres URI).
	DatabaseURL string `yaml:"database_url"`

	// OutputDir is the directory where dump files are written.
	OutputDir string `yaml:"output_dir"`

	// CompressionFormat selects the compression algorithm (none | gzip | zstd).
	// Defaults to "gzip" when empty.
	CompressionFormat compress.Format `yaml:"compression_format"`

	// CompressionLevel is an algorithm-specific compression level.
	// When 0, a sensible default is chosen by the compressor.
	CompressionLevel int `yaml:"compression_level"`
}

// Load reads a YAML configuration file from path and returns a validated Config.
func Load(path string) (*Config, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, fmt.Errorf("config: open %q: %w", path, err)
	}
	defer f.Close()

	var cfg Config
	dec := yaml.NewDecoder(f)
	dec.KnownFields(true)
	if err := dec.Decode(&cfg); err != nil {
		return nil, fmt.Errorf("config: decode %q: %w", path, err)
	}

	if err := cfg.validate(); err != nil {
		return nil, err
	}

	return &cfg, nil
}

// validate checks that required fields are present and values are within
// acceptable ranges.
func (c *Config) validate() error {
	if c.DatabaseURL == "" {
		return fmt.Errorf("config: database_url is required")
	}
	if c.OutputDir == "" {
		return fmt.Errorf("config: output_dir is required")
	}

	// Default compression format.
	if c.CompressionFormat == "" {
		c.CompressionFormat = compress.FormatGzip
	}

	switch c.CompressionFormat {
	case compress.FormatNone, compress.FormatGzip, compress.FormatZstd:
		// valid
	default:
		return fmt.Errorf("config: unknown compression_format %q (valid: none, gzip, zstd)", c.CompressionFormat)
	}

	return nil
}

// CompressorConfig returns a compress.Config derived from the current Config.
func (c *Config) CompressorConfig() compress.Config {
	return compress.Config{
		Format: c.CompressionFormat,
		Level:  c.CompressionLevel,
	}
}