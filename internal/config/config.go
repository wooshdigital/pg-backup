package config

import (
	"fmt"
	"os"
	"time"

	"gopkg.in/yaml.v3"
)

// CompressionFormat specifies the compression algorithm to use.
type CompressionFormat string

const (
	CompressionFormatGzip CompressionFormat = "gzip"
	CompressionFormatZstd CompressionFormat = "zstd"
	CompressionFormatNone CompressionFormat = "none"
)

// Config holds the application configuration.
type Config struct {
	Database    DatabaseConfig    `yaml:"database"`
	Storage     StorageConfig     `yaml:"storage"`
	Compression CompressionConfig `yaml:"compression"`
	Schedule    ScheduleConfig    `yaml:"schedule"`
}

// DatabaseConfig holds database connection settings.
type DatabaseConfig struct {
	DSN string `yaml:"dsn"`
}

// StorageConfig holds settings for where dumps are stored.
type StorageConfig struct {
	Dir string `yaml:"dir"`
}

// CompressionConfig holds compression settings.
type CompressionConfig struct {
	// Format is the compression algorithm: "gzip", "zstd", or "none".
	Format CompressionFormat `yaml:"format"`
	// Level is the compression level. Interpretation depends on the Format:
	//   gzip: 1 (BestSpeed) – 9 (BestCompression), 0 = default (-1)
	//   zstd: 1 (fastest) – 4 (best), 0 = default (2)
	//   none: ignored
	Level int `yaml:"level"`
}

// ScheduleConfig holds scheduling settings.
type ScheduleConfig struct {
	Interval time.Duration `yaml:"interval"`
}

// Validate checks that the configuration is valid.
func (c *Config) Validate() error {
	if c.Database.DSN == "" {
		return fmt.Errorf("database.dsn is required")
	}
	if c.Storage.Dir == "" {
		return fmt.Errorf("storage.dir is required")
	}

	switch c.Compression.Format {
	case CompressionFormatGzip, CompressionFormatZstd, CompressionFormatNone, "":
		// valid
	default:
		return fmt.Errorf("compression.format %q is not supported; use gzip, zstd, or none", c.Compression.Format)
	}

	return nil
}

// Load reads a YAML config file from path and returns a validated Config.
func Load(path string) (*Config, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, fmt.Errorf("opening config file %q: %w", path, err)
	}
	defer f.Close()

	var cfg Config
	dec := yaml.NewDecoder(f)
	dec.KnownFields(true)
	if err := dec.Decode(&cfg); err != nil {
		return nil, fmt.Errorf("decoding config: %w", err)
	}

	if err := cfg.Validate(); err != nil {
		return nil, fmt.Errorf("invalid config: %w", err)
	}

	return &cfg, nil
}