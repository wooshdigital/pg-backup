// Package config handles loading and validation of worker configuration.
package config

import (
	"fmt"
	"os"
	"time"

	"gopkg.in/yaml.v3"

	"github.com/your-org/your-project/internal/compress"
)

// Config holds all configuration for the dump worker.
type Config struct {
	// Database connection settings.
	Database DatabaseConfig `yaml:"database"`

	// Storage settings for where dumps are written.
	Storage StorageConfig `yaml:"storage"`

	// Compression settings.
	Compression CompressionConfig `yaml:"compression"`

	// Schedule settings.
	Schedule ScheduleConfig `yaml:"schedule"`
}

// DatabaseConfig holds PostgreSQL connection details.
type DatabaseConfig struct {
	DSN string `yaml:"dsn"`
}

// StorageConfig holds output storage settings.
type StorageConfig struct {
	// Directory is the local directory where dump files are written.
	Directory string `yaml:"directory"`
}

// CompressionConfig holds compression pipeline settings.
type CompressionConfig struct {
	// Format selects the compression algorithm: "gzip", "zstd", or "none".
	// Defaults to "gzip" if unset.
	Format compress.Format `yaml:"format"`

	// Level is the compression level.
	// For gzip: 1 (BestSpeed) – 9 (BestCompression), -1 for default.
	// For zstd: 1 (Fastest) – 4 (BestCompression), 0 for default.
	// For none: ignored.
	Level int `yaml:"level"`
}

// ScheduleConfig holds scheduling settings.
type ScheduleConfig struct {
	// Cron is a standard cron expression for when dumps run.
	Cron string `yaml:"cron"`

	// Timeout is the maximum duration for a single dump run.
	Timeout time.Duration `yaml:"timeout"`
}

// Load reads a YAML config file from path and validates it.
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
		return nil, fmt.Errorf("config: validate: %w", err)
	}

	cfg.applyDefaults()

	return &cfg, nil
}

// applyDefaults sets sensible defaults for unset fields.
func (c *Config) applyDefaults() {
	if c.Compression.Format == "" {
		c.Compression.Format = compress.FormatGzip
	}
	if c.Storage.Directory == "" {
		c.Storage.Directory = "/tmp/dumps"
	}
	if c.Schedule.Timeout == 0 {
		c.Schedule.Timeout = 30 * time.Minute
	}
}

// validate returns an error if required fields are missing or invalid.
func (c *Config) validate() error {
	if c.Database.DSN == "" {
		return fmt.Errorf("database.dsn is required")
	}

	switch c.Compression.Format {
	case compress.FormatGzip, compress.FormatZstd, compress.FormatNone, "":
		// valid
	default:
		return fmt.Errorf("compression.format %q is invalid (valid: gzip, zstd, none)", c.Compression.Format)
	}

	return nil
}

// NewCompressor creates a Compressor from the compression configuration.
func (c *Config) NewCompressor() (compress.Compressor, error) {
	format := c.Compression.Format
	if format == "" {
		format = compress.FormatGzip
	}
	return compress.NewCompressor(format, c.Compression.Level)
}