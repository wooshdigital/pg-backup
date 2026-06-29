package config

import (
	"fmt"
	"os"

	"gopkg.in/yaml.v3"

	"github.com/soapboxsys/ombudslib/internal/compress"
)

// Config holds the full application configuration.
type Config struct {
	Database     DatabaseConfig     `yaml:"database"`
	Storage      StorageConfig      `yaml:"storage"`
	Compression  compress.Config    `yaml:"compression"`
	StreamDirect bool               `yaml:"stream_direct"`
}

// DatabaseConfig holds Postgres connection settings.
type DatabaseConfig struct {
	DSN string `yaml:"dsn"`
}

// StorageConfig holds storage provider configuration.
type StorageConfig struct {
	Type  string      `yaml:"type"` // "s3" or "local"
	S3    S3Config    `yaml:"s3"`
	Local LocalConfig `yaml:"local"`
}

// S3Config holds AWS S3 / compatible storage settings.
type S3Config struct {
	Bucket          string `yaml:"bucket"`
	Endpoint        string `yaml:"endpoint"`
	Region          string `yaml:"region"`
	AccessKeyID     string `yaml:"access_key_id"`
	SecretAccessKey string `yaml:"secret_access_key"`
	ForcePathStyle  bool   `yaml:"force_path_style"`
}

// LocalConfig holds local filesystem storage settings.
type LocalConfig struct {
	Path string `yaml:"path"`
}

// Load reads the configuration from the path specified by the CONFIG_PATH
// environment variable, falling back to "config.yaml".
func Load() (*Config, error) {
	path := os.Getenv("CONFIG_PATH")
	if path == "" {
		path = "config.yaml"
	}

	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("read config file %q: %w", path, err)
	}

	cfg := &Config{
		Compression: compress.Config{
			Algorithm: "gzip",
			Level:     -1,
		},
	}

	if err := yaml.Unmarshal(data, cfg); err != nil {
		return nil, fmt.Errorf("parse config file: %w", err)
	}

	if cfg.Database.DSN == "" {
		// Fall back to environment variable
		cfg.Database.DSN = os.Getenv("DATABASE_URL")
	}
	if cfg.Database.DSN == "" {
		return nil, fmt.Errorf("database DSN is required (set database.dsn in config or DATABASE_URL env)")
	}

	if cfg.Storage.Type == "" {
		cfg.Storage.Type = "s3"
	}

	return cfg, nil
}