package config

import (
	"fmt"
	"os"

	"gopkg.in/yaml.v3"
)

// Config is the top-level application configuration.
type Config struct {
	Database     DatabaseConfig  `yaml:"database"`
	Storage      StorageConfig   `yaml:"storage"`
	Compress     CompressConfig  `yaml:"compress"`
	StreamDirect bool            `yaml:"stream_direct"`
}

// DatabaseConfig holds connection settings for the source database.
type DatabaseConfig struct {
	DSN string `yaml:"dsn"`
}

// StorageConfig holds S3-compatible storage settings.
type StorageConfig struct {
	Endpoint        string `yaml:"endpoint"`
	Bucket          string `yaml:"bucket"`
	Region          string `yaml:"region"`
	AccessKeyID     string `yaml:"access_key_id"`
	SecretAccessKey string `yaml:"secret_access_key"`
	ForcePathStyle  bool   `yaml:"force_path_style"`
	KeyPrefix       string `yaml:"key_prefix"`
}

// CompressConfig holds compression settings.
type CompressConfig struct {
	Level int `yaml:"level"`
}

// Load reads configuration from the path given by the CONFIG_PATH environment
// variable (default: config.yaml).
func Load() (*Config, error) {
	path := os.Getenv("CONFIG_PATH")
	if path == "" {
		path = "config.yaml"
	}

	f, err := os.Open(path)
	if err != nil {
		return nil, fmt.Errorf("open config %q: %w", path, err)
	}
	defer f.Close()

	var cfg Config
	dec := yaml.NewDecoder(f)
	dec.KnownFields(true)
	if err = dec.Decode(&cfg); err != nil {
		return nil, fmt.Errorf("decode config: %w", err)
	}

	if err = cfg.validate(); err != nil {
		return nil, fmt.Errorf("invalid config: %w", err)
	}

	return &cfg, nil
}

func (c *Config) validate() error {
	if c.Database.DSN == "" {
		return fmt.Errorf("database.dsn is required")
	}
	if c.Storage.Bucket == "" {
		return fmt.Errorf("storage.bucket is required")
	}
	if c.Compress.Level == 0 {
		c.Compress.Level = 6 // gzip default
	}
	return nil
}