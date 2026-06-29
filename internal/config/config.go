package config

import (
	"fmt"
	"os"

	"gopkg.in/yaml.v3"
)

// Config is the top-level configuration structure for the backup worker.
type Config struct {
	Database DatabaseConfig `yaml:"database"`
	Storage  StorageConfig  `yaml:"storage"`
	Compress CompressConfig `yaml:"compress"`
	Backup   BackupConfig   `yaml:"backup"`
}

type DatabaseConfig struct {
	DSN string `yaml:"dsn"`
}

type StorageConfig struct {
	Bucket          string `yaml:"bucket"`
	Region          string `yaml:"region"`
	Endpoint        string `yaml:"endpoint"`
	AccessKeyID     string `yaml:"access_key_id"`
	SecretAccessKey string `yaml:"secret_access_key"`
	ForcePathStyle  bool   `yaml:"force_path_style"`
}

type CompressConfig struct {
	Algorithm string `yaml:"algorithm"`
}

type BackupConfig struct {
	StreamDirect bool `yaml:"stream_direct"`
}

// Load reads the configuration from the path specified by the CONFIG_PATH
// environment variable (default: config.yaml).
func Load() (*Config, error) {
	path := os.Getenv("CONFIG_PATH")
	if path == "" {
		path = "config.yaml"
	}

	f, err := os.Open(path)
	if err != nil {
		return nil, fmt.Errorf("open config file %q: %w", path, err)
	}
	defer f.Close()

	var cfg Config
	decoder := yaml.NewDecoder(f)
	decoder.KnownFields(true)
	if err := decoder.Decode(&cfg); err != nil {
		return nil, fmt.Errorf("decode config: %w", err)
	}

	// Apply defaults
	if cfg.Compress.Algorithm == "" {
		cfg.Compress.Algorithm = "gzip"
	}

	return &cfg, nil
}