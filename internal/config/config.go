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
	Backup      BackupConfig      `yaml:"backup"`
}

// DatabaseConfig holds Postgres connection settings.
type DatabaseConfig struct {
	DSN string `yaml:"dsn"`
}

// StorageConfig holds S3 (or compatible) settings.
type StorageConfig struct {
	Bucket          string `yaml:"bucket"`
	Region          string `yaml:"region"`
	Endpoint        string `yaml:"endpoint"`
	ForcePathStyle  bool   `yaml:"force_path_style"`
	AccessKeyID     string `yaml:"access_key_id"`
	SecretAccessKey string `yaml:"secret_access_key"`
}

// CompressionConfig holds compressor settings.
type CompressionConfig struct {
	Algorithm string `yaml:"algorithm"` // e.g. "gzip", "zstd"
}

// BackupConfig holds backup-specific settings.
type BackupConfig struct {
	// StreamDirect, when true, streams compressed data directly to storage
	// without writing to a temp file first.
	StreamDirect bool `yaml:"stream_direct"`
}

// Load reads configuration from config.yaml, with environment variable overrides.
func Load() (*Config, error) {
	cfg := defaults()

	// Attempt to read config file.
	configPath := envOrDefault("CONFIG_PATH", "config.yaml")
	if data, err := os.ReadFile(configPath); err == nil {
		if err := yaml.Unmarshal(data, cfg); err != nil {
			return nil, fmt.Errorf("parse config file: %w", err)
		}
	}

	// Environment variable overrides (highest priority).
	applyEnvOverrides(cfg)

	if err := validate(cfg); err != nil {
		return nil, fmt.Errorf("invalid config: %w", err)
	}

	return cfg, nil
}

func defaults() *Config {
	return &Config{
		Compression: CompressionConfig{
			Algorithm: "gzip",
		},
		Storage: StorageConfig{
			Region: "us-east-1",
		},
	}
}

func applyEnvOverrides(cfg *Config) {
	if v := os.Getenv("POSTGRES_DSN"); v != "" {
		cfg.Database.DSN = v
	}
	if v := os.Getenv("S3_BUCKET"); v != "" {
		cfg.Storage.Bucket = v
	}
	if v := os.Getenv("S3_REGION"); v != "" {
		cfg.Storage.Region = v
	}
	if v := os.Getenv("S3_ENDPOINT"); v != "" {
		cfg.Storage.Endpoint = v
	}
	if v := os.Getenv("AWS_ACCESS_KEY_ID"); v != "" {
		cfg.Storage.AccessKeyID = v
	}
	if v := os.Getenv("AWS_SECRET_ACCESS_KEY"); v != "" {
		cfg.Storage.SecretAccessKey = v
	}
	if v := os.Getenv("COMPRESSION_ALGORITHM"); v != "" {
		cfg.Compression.Algorithm = v
	}
}

func validate(cfg *Config) error {
	if cfg.Database.DSN == "" {
		return fmt.Errorf("database.dsn is required (set POSTGRES_DSN env var or config file)")
	}
	if cfg.Storage.Bucket == "" {
		return fmt.Errorf("storage.bucket is required (set S3_BUCKET env var or config file)")
	}
	return nil
}

func envOrDefault(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}