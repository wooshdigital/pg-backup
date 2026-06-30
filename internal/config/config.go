package config

import (
	"fmt"
	"os"

	"gopkg.in/yaml.v3"
)

// Config holds all application configuration.
type Config struct {
	Database    DatabaseConfig    `yaml:"database"`
	Storage     StorageConfig     `yaml:"storage"`
	Compression CompressionConfig `yaml:"compression"`
	StreamDirect bool             `yaml:"stream_direct"`
}

// DatabaseConfig contains Postgres connection settings.
type DatabaseConfig struct {
	DSN string `yaml:"dsn"`
}

// StorageConfig contains storage backend settings.
type StorageConfig struct {
	Backend     string `yaml:"backend"`      // "s3" or "local"
	LocalPath   string `yaml:"local_path"`
	S3Bucket    string `yaml:"s3_bucket"`
	S3Region    string `yaml:"s3_region"`
	S3Endpoint  string `yaml:"s3_endpoint"`
	S3PathStyle bool   `yaml:"s3_path_style"`
}

// CompressionConfig controls which compression algorithm and level to use.
type CompressionConfig struct {
	Algorithm string `yaml:"algorithm"` // "gzip", "zstd", "none"
	Level     int    `yaml:"level"`
}

// Load reads configuration from the path specified by CONFIG_FILE env var
// (default: config.yaml), then overrides with individual env vars.
func Load() (*Config, error) {
	path := os.Getenv("CONFIG_FILE")
	if path == "" {
		path = "config.yaml"
	}

	cfg := defaultConfig()

	data, err := os.ReadFile(path)
	if err != nil && !os.IsNotExist(err) {
		return nil, fmt.Errorf("read config file %q: %w", path, err)
	}
	if err == nil {
		if err = yaml.Unmarshal(data, cfg); err != nil {
			return nil, fmt.Errorf("parse config file: %w", err)
		}
	}

	// Allow individual environment variable overrides.
	applyEnvOverrides(cfg)

	return cfg, nil
}

func defaultConfig() *Config {
	return &Config{
		Storage: StorageConfig{
			Backend:  "s3",
			S3Region: "us-east-1",
		},
		Compression: CompressionConfig{
			Algorithm: "gzip",
			Level:     6,
		},
	}
}

func applyEnvOverrides(cfg *Config) {
	if v := os.Getenv("POSTGRES_DSN"); v != "" {
		cfg.Database.DSN = v
	}
	if v := os.Getenv("S3_BUCKET"); v != "" {
		cfg.Storage.S3Bucket = v
	}
	if v := os.Getenv("S3_REGION"); v != "" {
		cfg.Storage.S3Region = v
	}
	if v := os.Getenv("S3_ENDPOINT"); v != "" {
		cfg.Storage.S3Endpoint = v
	}
	if v := os.Getenv("STORAGE_BACKEND"); v != "" {
		cfg.Storage.Backend = v
	}
	if v := os.Getenv("LOCAL_PATH"); v != "" {
		cfg.Storage.LocalPath = v
	}
	if v := os.Getenv("COMPRESSION_ALGORITHM"); v != "" {
		cfg.Compression.Algorithm = v
	}
}