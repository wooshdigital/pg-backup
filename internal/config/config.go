package config

import (
	"fmt"
	"os"

	"gopkg.in/yaml.v3"
)

// Config is the top-level application configuration.
type Config struct {
	Database     DatabaseConfig `yaml:"database"`
	Storage      StorageConfig  `yaml:"storage"`
	Compress     CompressConfig `yaml:"compress"`
	StreamDirect bool           `yaml:"stream_direct"`
}

// DatabaseConfig holds Postgres connection settings.
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
	KeyPrefix       string `yaml:"key_prefix"`
	ForcePathStyle  bool   `yaml:"force_path_style"`
}

// CompressConfig selects the compression algorithm and level.
type CompressConfig struct {
	Algorithm string `yaml:"algorithm"`
	Level     int    `yaml:"level"`
}

// Load reads the configuration file at the path given by the CONFIG_FILE
// environment variable (defaults to "config.yaml").
func Load() (*Config, error) {
	path := os.Getenv("CONFIG_FILE")
	if path == "" {
		path = "config.yaml"
	}

	f, err := os.Open(path)
	if err != nil {
		return nil, fmt.Errorf("open config file %q: %w", path, err)
	}
	defer f.Close()

	var cfg Config
	dec := yaml.NewDecoder(f)
	dec.KnownFields(true)
	if err := dec.Decode(&cfg); err != nil {
		return nil, fmt.Errorf("decode config: %w", err)
	}

	return &cfg, nil
}