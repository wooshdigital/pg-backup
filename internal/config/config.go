package config

import (
	"fmt"
	"os"
	"time"

	"gopkg.in/yaml.v3"
)

// CompressionFormat enumerates supported compression formats.
type CompressionFormat string

const (
	CompressionGzip CompressionFormat = "gzip"
	CompressionZstd CompressionFormat = "zstd"
	CompressionNone CompressionFormat = "none"
)

// Config holds all runtime configuration for the pg-dump worker.
type Config struct {
	// Database connection string (DSN or URL).
	DatabaseURL string `yaml:"database_url"`

	// OutputDir is the directory where dump artifacts are written.
	OutputDir string `yaml:"output_dir"`

	// DumpTimeout limits how long pg_dump may run.
	DumpTimeout time.Duration `yaml:"dump_timeout"`

	// Compression settings.
	CompressionFormat CompressionFormat `yaml:"compression_format"`
	CompressionLevel  int               `yaml:"compression_level"`
}

// Validate checks that required fields are set and values are in range.
func (c *Config) Validate() error {
	if c.DatabaseURL == "" {
		return fmt.Errorf("config: database_url is required")
	}
	if c.OutputDir == "" {
		return fmt.Errorf("config: output_dir is required")
	}
	switch c.CompressionFormat {
	case CompressionGzip, CompressionZstd, CompressionNone, "":
		// valid
	default:
		return fmt.Errorf("config: compression_format %q is not valid (use gzip, zstd, or none)", c.CompressionFormat)
	}
	return nil
}

// Load reads a YAML config file from path and returns a validated Config.
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

	// Apply defaults.
	if cfg.CompressionFormat == "" {
		cfg.CompressionFormat = CompressionGzip
	}
	if cfg.DumpTimeout == 0 {
		cfg.DumpTimeout = 30 * time.Minute
	}

	if err := cfg.Validate(); err != nil {
		return nil, err
	}
	return &cfg, nil
}