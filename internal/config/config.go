// Package config loads and validates the application configuration from a YAML file.
package config

import (
	"fmt"
	"os"
	"time"

	"gopkg.in/yaml.v3"
)

// Config is the top-level application configuration.
type Config struct {
	// Worker holds settings for the backup worker process.
	Worker WorkerConfig `yaml:"worker"`
	// Database holds connection settings for the source database.
	Database DatabaseConfig `yaml:"database"`
	// Storage holds settings for the upload backend (S3 or local).
	Storage StorageConfig `yaml:"storage"`
	// Compress holds settings for the compression step.
	Compress CompressConfig `yaml:"compress"`
}

// WorkerConfig controls the worker behaviour.
type WorkerConfig struct {
	// Schedule is a cron expression for when to run backups (e.g. "0 2 * * *").
	Schedule string `yaml:"schedule"`
	// Timeout is the maximum duration for a single backup run.
	Timeout time.Duration `yaml:"timeout"`
}

// DatabaseConfig holds connection parameters.
type DatabaseConfig struct {
	// DSN is the full connection string (e.g. "postgres://user:pass@host:5432/db").
	DSN string `yaml:"dsn"`
	// Name is the logical database name used in key templates.
	// If empty, it is inferred from the DSN.
	Name string `yaml:"name"`
}

// StorageConfig selects and configures the storage backend.
type StorageConfig struct {
	// Backend selects the active backend: "s3" (default) or "local".
	Backend string `yaml:"backend"`
	// S3 holds S3-specific settings (used when Backend == "s3").
	S3 S3StorageConfig `yaml:"s3"`
	// Local holds local-filesystem settings (used when Backend == "local").
	Local LocalStorageConfig `yaml:"local"`
}

// S3StorageConfig holds all S3 upload parameters.
type S3StorageConfig struct {
	// Bucket is the target S3 bucket. Required.
	Bucket string `yaml:"bucket"`
	// Region is the AWS region (e.g. "us-east-1"). Required.
	Region string `yaml:"region"`
	// Endpoint is an optional custom endpoint URL (for LocalStack / MinIO).
	Endpoint string `yaml:"endpoint"`
	// UsePathStyle forces path-style addressing. Required for LocalStack.
	UsePathStyle bool `yaml:"use_path_style"`

	// Credentials holds optional static AWS credentials.
	// When omitted the default credential chain (env vars → IAM role) is used.
	Credentials S3CredentialsConfig `yaml:"credentials"`

	// PrefixTemplate is the key template for uploaded objects.
	// Supported placeholders: {db}, {date}, {timestamp}, {hostname}.
	// Default: "backups/{db}/{date}/{timestamp}/dump.sql.gz"
	PrefixTemplate string `yaml:"prefix_template"`

	// PartSizeBytes is the size of each multipart part in bytes.
	// Default: 5242880 (5 MB).
	PartSizeBytes int64 `yaml:"part_size_bytes"`

	// Concurrency is the number of parallel upload goroutines.
	// Default: 5.
	Concurrency int `yaml:"concurrency"`

	// MaxRetries is the maximum number of retry attempts on transient errors.
	// Default: 3.
	MaxRetries int `yaml:"max_retries"`
}

// S3CredentialsConfig holds optional static AWS credentials.
type S3CredentialsConfig struct {
	// AccessKeyID is the AWS access key ID.
	AccessKeyID string `yaml:"access_key_id"`
	// SecretAccessKey is the AWS secret access key.
	SecretAccessKey string `yaml:"secret_access_key"`
	// SessionToken is an optional STS session token.
	SessionToken string `yaml:"session_token"`
}

// LocalStorageConfig holds settings for the local-filesystem backend.
type LocalStorageConfig struct {
	// BaseDir is the root directory for stored artifacts.
	BaseDir string `yaml:"base_dir"`
}

// CompressConfig holds compression settings.
type CompressConfig struct {
	// Algorithm selects the compression algorithm: "gzip" (default), "zstd".
	Algorithm string `yaml:"algorithm"`
	// Level is the compression level (algorithm-specific).
	Level int `yaml:"level"`
}

// DefaultPrefixTemplate is used when no prefix_template is configured.
const DefaultPrefixTemplate = "backups/{db}/{date}/{timestamp}/dump.sql.gz"

// Load reads and parses the YAML configuration file at path.
func Load(path string) (*Config, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, fmt.Errorf("config: failed to open %q: %w", path, err)
	}
	defer f.Close()

	var cfg Config
	dec := yaml.NewDecoder(f)
	dec.KnownFields(true)
	if err := dec.Decode(&cfg); err != nil {
		return nil, fmt.Errorf("config: failed to parse %q: %w", path, err)
	}

	applyDefaults(&cfg)

	if err := validate(&cfg); err != nil {
		return nil, fmt.Errorf("config: validation failed: %w", err)
	}

	return &cfg, nil
}

// applyDefaults fills in zero-value fields with sensible defaults.
func applyDefaults(cfg *Config) {
	if cfg.Storage.Backend == "" {
		cfg.Storage.Backend = "s3"
	}
	if cfg.Storage.S3.PrefixTemplate == "" {
		cfg.Storage.S3.PrefixTemplate = DefaultPrefixTemplate
	}
	if cfg.Storage.S3.PartSizeBytes <= 0 {
		cfg.Storage.S3.PartSizeBytes = 5 * 1024 * 1024
	}
	if cfg.Storage.S3.Concurrency <= 0 {
		cfg.Storage.S3.Concurrency = 5
	}
	if cfg.Storage.S3.MaxRetries <= 0 {
		cfg.Storage.S3.MaxRetries = 3
	}
	if cfg.Compress.Algorithm == "" {
		cfg.Compress.Algorithm = "gzip"
	}
	if cfg.Worker.Timeout == 0 {
		cfg.Worker.Timeout = 2 * time.Hour
	}
}

// validate checks that required fields are present.
func validate(cfg *Config) error {
	switch cfg.Storage.Backend {
	case "s3":
		if cfg.Storage.S3.Bucket == "" {
			return fmt.Errorf("storage.s3.bucket is required when backend is \"s3\"")
		}
		if cfg.Storage.S3.Region == "" {
			return fmt.Errorf("storage.s3.region is required when backend is \"s3\"")
		}
	case "local":
		if cfg.Storage.Local.BaseDir == "" {
			return fmt.Errorf("storage.local.base_dir is required when backend is \"local\"")
		}
	default:
		return fmt.Errorf("unknown storage backend %q (want \"s3\" or \"local\")", cfg.Storage.Backend)
	}
	return nil
}