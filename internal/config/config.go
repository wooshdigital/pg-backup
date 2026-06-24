package config

import (
	"fmt"
	"os"

	"gopkg.in/yaml.v3"
)

// CompressionFormat represents the compression algorithm to use.
type CompressionFormat string

const (
	CompressionGzip CompressionFormat = "gzip"
	CompressionZstd CompressionFormat = "zstd"
	CompressionNone CompressionFormat = "none"
)

// Config holds all configuration for the worker.
type Config struct {
	Database Database    `yaml:"database"`
	Storage  Storage     `yaml:"storage"`
	Worker   WorkerCfg   `yaml:"worker"`
	Compress CompressCfg `yaml:"compress"`
}

// Database holds database connection settings.
type Database struct {
	DSN string `yaml:"dsn"`
}

// Storage holds artifact storage settings.
type Storage struct {
	Path string `yaml:"path"`
}

// WorkerCfg holds worker-level settings.
type WorkerCfg struct {
	Schedule string `yaml:"schedule"`
}

// CompressCfg holds compression settings.
type CompressCfg struct {
	// Format specifies the compression algorithm: "gzip", "zstd", or "none".
	Format CompressionFormat `yaml:"format"`
	// Level specifies the compression level.
	// For gzip: 1 (BestSpeed) to 9 (BestCompression); 0 = default (-1).
	// For zstd: 1 (Fastest) to 4 (Best); 0 = default (2).
	Level int `yaml:"level"`
}

// Validate checks that the config values are valid.
func (c *Config) Validate() error {
	switch c.Compress.Format {
	case CompressionGzip, CompressionZstd, CompressionNone, "":
		// valid
	default:
		return fmt.Errorf("config: invalid compression format %q (must be gzip, zstd, or none)", c.Compress.Format)
	}
	return nil
}

// Load reads and parses a YAML config file at path.
func Load(path string) (*Config, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, fmt.Errorf("config: open %s: %w", path, err)
	}
	defer f.Close()

	var cfg Config
	dec := yaml.NewDecoder(f)
	dec.KnownFields(true)
	if err := dec.Decode(&cfg); err != nil {
		return nil, fmt.Errorf("config: decode %s: %w", path, err)
	}

	// Apply defaults
	if cfg.Compress.Format == "" {
		cfg.Compress.Format = CompressionGzip
	}

	if err := cfg.Validate(); err != nil {
		return nil, err
	}

	return &cfg, nil
}

// NewCompressor returns a compress.Compressor based on the CompressCfg.
// It is defined here to avoid an import cycle; the actual construction
// is delegated to the compress package via the factory in compress.go.
func (c *CompressCfg) EffectiveFormat() CompressionFormat {
	if c.Format == "" {
		return CompressionGzip
	}
	return c.Format
}