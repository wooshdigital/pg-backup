// Package config loads and validates worker configuration.
package config

import (
	"fmt"
	"os"
	"time"

	"gopkg.in/yaml.v3"
)

// CompressionFormat enumerates the supported compression algorithms.
type CompressionFormat string

const (
	CompressionNone CompressionFormat = "none"
	CompressionGzip CompressionFormat = "gzip"
	CompressionZstd CompressionFormat = "zstd"
)

// Config holds all configuration for the dump worker.
type Config struct {
	// Database connection details.
	Database DatabaseConfig `yaml:"database"`

	// Storage destination.
	Storage StorageConfig `yaml:"storage"`

	// Compression settings.
	Compression CompressionConfig `yaml:"compression"`

	// Worker behaviour.
	Schedule string        `yaml:"schedule"`
	Timeout  time.Duration `yaml:"timeout"`
}

// DatabaseConfig contains PostgreSQL connection details.
type DatabaseConfig struct {
	DSN string `yaml:"dsn"`
}

// StorageConfig describes where completed dumps are written.
type StorageConfig struct {
	// Path is a local directory path when using local storage.
	Path string `yaml:"path"`
}

// CompressionConfig controls how dump output is compressed.
type CompressionConfig struct {
	// Format selects the compression algorithm: "gzip", "zstd", or "none".
	// Defaults to "gzip" when empty.
	Format CompressionFormat `yaml:"format"`

	// Level is the compression level. Semantics depend on the chosen format:
	//   gzip: 1 (BestSpeed) – 9 (BestCompression); 0 means DefaultCompression (-1).
	//   zstd: 1 (fastest) – 22 (best); 0 means default (3).
	//   none: ignored.
	Level int `yaml:"level"`
}

// Load reads configuration from the file at path and returns a validated Config.
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
		return nil, fmt.Errorf("config: %w", err)
	}

	return &cfg, nil
}

// validate checks that mandatory fields are present and values are in range.
func (c *Config) validate() error {
	if c.Database.DSN == "" {
		return fmt.Errorf("database.dsn must not be empty")
	}

	// Apply default compression format.
	if c.Compression.Format == "" {
		c.Compression.Format = CompressionGzip
	}

	switch c.Compression.Format {
	case CompressionNone, CompressionGzip, CompressionZstd:
		// valid
	default:
		return fmt.Errorf("compression.format %q is not one of: none, gzip, zstd", c.Compression.Format)
	}

	if c.Compression.Format == CompressionGzip {
		// gzip levels: -1 (default), 1–9.
		if c.Compression.Level != 0 && (c.Compression.Level < 1 || c.Compression.Level > 9) {
			return fmt.Errorf("compression.level %d is out of range for gzip (1–9 or 0 for default)", c.Compression.Level)
		}
	}

	if c.Compression.Format == CompressionZstd {
		if c.Compression.Level != 0 && (c.Compression.Level < 1 || c.Compression.Level > 22) {
			return fmt.Errorf("compression.level %d is out of range for zstd (1–22 or 0 for default)", c.Compression.Level)
		}
	}

	return nil
}

// NewCompressor returns a compress.Compressor matching the configuration.
// It is defined here to avoid an import cycle; the actual construction is
// delegated to the compress package via the factory in that package.
func (c *Config) CompressionFormatString() string {
	return string(c.Compression.Format)
}