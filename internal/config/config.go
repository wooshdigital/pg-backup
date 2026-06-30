package config

import (
	"fmt"
	"os"

	"gopkg.in/yaml.v3"
)

// Config is the root configuration structure.
type Config struct {
	Database DatabaseConfig `yaml:"database"`
	Storage  StorageConfig  `yaml:"storage"`
	Compress CompressConfig `yaml:"compress"`
	Backup   BackupConfig   `yaml:"backup"`
}

// DatabaseConfig holds PostgreSQL connection settings.
type DatabaseConfig struct {
	DSN string `yaml:"dsn"`
}

// StorageConfig holds S3 / object-storage settings.
type StorageConfig struct {
	Bucket   string `yaml:"bucket"`
	Region   string `yaml:"region"`
	Endpoint string `yaml:"endpoint"` // optional; used for LocalStack / MinIO
}

// CompressConfig controls the compression algorithm.
type CompressConfig struct {
	Algorithm string `yaml:"algorithm"` // e.g. "gzip", "zstd", "none"
}

// BackupConfig contains top-level backup behaviour flags.
type BackupConfig struct {
	// StreamDirect skips writing to a local temp file and pipes data directly
	// from the compressor to the uploader.
	StreamDirect bool `yaml:"stream_direct"`
}

// Load reads and parses the YAML configuration file at the given path.
// Environment variables are NOT expanded here; use them in DSN / endpoint
// strings directly if needed.
func Load(path string) (*Config, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, fmt.Errorf("open config file %q: %w", path, err)
	}
	defer f.Close()

	var cfg Config
	if err = yaml.NewDecoder(f).Decode(&cfg); err != nil {
		return nil, fmt.Errorf("decode config file %q: %w", path, err)
	}

	if err = cfg.validate(); err != nil {
		return nil, fmt.Errorf("invalid config: %w", err)
	}

	return &cfg, nil
}

func (c *Config) validate() error {
	if c.Database.DSN == "" {
		return fmt.Errorf("database.dsn must not be empty")
	}
	if c.Storage.Bucket == "" {
		return fmt.Errorf("storage.bucket must not be empty")
	}
	if c.Storage.Region == "" {
		c.Storage.Region = "us-east-1"
	}
	if c.Compress.Algorithm == "" {
		c.Compress.Algorithm = "gzip"
	}
	return nil
}