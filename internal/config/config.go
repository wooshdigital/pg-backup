package config

import (
	"fmt"
	"os"

	"gopkg.in/yaml.v3"
)

// CompressionFormat specifies the compression algorithm to use.
type CompressionFormat string

const (
	CompressionGzip CompressionFormat = "gzip"
	CompressionZstd CompressionFormat = "zstd"
	CompressionNone CompressionFormat = "none"
)

// Config holds application configuration.
type Config struct {
	// Database connection details.
	Database DatabaseConfig `yaml:"database"`

	// Storage configuration.
	Storage StorageConfig `yaml:"storage"`

	// Compression configuration.
	Compression CompressionConfig `yaml:"compression"`
}

// DatabaseConfig holds PostgreSQL connection configuration.
type DatabaseConfig struct {
	Host     string `yaml:"host"`
	Port     int    `yaml:"port"`
	Name     string `yaml:"name"`
	User     string `yaml:"user"`
	Password string `yaml:"password"`
	SSLMode  string `yaml:"ssl_mode"`
}

// StorageConfig holds output storage configuration.
type StorageConfig struct {
	// OutputDir is the directory where dump files are written.
	OutputDir string `yaml:"output_dir"`
}

// CompressionConfig holds compression-related settings.
type CompressionConfig struct {
	// Format is one of "gzip", "zstd", or "none".
	Format CompressionFormat `yaml:"format"`

	// Level is the compression level.
	// For gzip: 1 (BestSpeed) – 9 (BestCompression), -1 = default.
	// For zstd: 1 (Fastest) – 4 (BestCompression), 0 = default (2).
	Level int `yaml:"level"`
}

// Load reads and parses a YAML config file at path.
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

	return &cfg, nil
}

// validate performs basic sanity checks on the loaded config.
func (c *Config) validate() error {
	if c.Database.Host == "" {
		return fmt.Errorf("database.host is required")
	}
	if c.Database.Name == "" {
		return fmt.Errorf("database.name is required")
	}
	if c.Database.User == "" {
		return fmt.Errorf("database.user is required")
	}

	switch c.Compression.Format {
	case CompressionGzip, CompressionZstd, CompressionNone, "":
		// valid
	default:
		return fmt.Errorf("compression.format %q is not supported (use gzip, zstd, or none)", c.Compression.Format)
	}

	return nil
}

// Defaults fills in zero-value fields with sensible defaults.
func (c *Config) Defaults() {
	if c.Database.Port == 0 {
		c.Database.Port = 5432
	}
	if c.Database.SSLMode == "" {
		c.Database.SSLMode = "disable"
	}
	if c.Storage.OutputDir == "" {
		c.Storage.OutputDir = "/tmp"
	}
	if c.Compression.Format == "" {
		c.Compression.Format = CompressionGzip
	}
	if c.Compression.Level == 0 {
		// Use codec-specific defaults; factory handles 0 → default.
	}
}