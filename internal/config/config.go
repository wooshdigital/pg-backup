package config

import (
	"fmt"
	"os"
	"time"

	"gopkg.in/yaml.v3"
)

// Config holds the full application configuration.
type Config struct {
	Database DatabaseConfig `yaml:"database"`
	Storage  StorageConfig  `yaml:"storage"`
	Compress CompressConfig `yaml:"compress"`
	Worker   WorkerConfig   `yaml:"worker"`
}

// DatabaseConfig holds database connection settings.
type DatabaseConfig struct {
	DSN      string `yaml:"dsn"`
	Host     string `yaml:"host"`
	Port     int    `yaml:"port"`
	Name     string `yaml:"name"`
	User     string `yaml:"user"`
	Password string `yaml:"password"`
}

// StorageConfig holds all storage-related configuration.
type StorageConfig struct {
	// Backend selects the storage backend: "s3" or "local"
	Backend string `yaml:"backend"`

	// Local filesystem backend settings
	Local LocalStorageConfig `yaml:"local"`

	// S3 backend settings
	S3 S3Config `yaml:"s3"`
}

// LocalStorageConfig holds settings for the local filesystem backend.
type LocalStorageConfig struct {
	// Directory is the local directory to store backup files.
	Directory string `yaml:"directory"`
}

// S3Config holds settings for the S3 storage backend.
type S3Config struct {
	// Bucket is the S3 bucket name.
	Bucket string `yaml:"bucket"`

	// Region is the AWS region (e.g. "us-east-1").
	Region string `yaml:"region"`

	// Endpoint overrides the S3 endpoint URL (useful for LocalStack / MinIO).
	Endpoint string `yaml:"endpoint"`

	// ForcePathStyle forces path-style S3 URLs (required for LocalStack).
	ForcePathStyle bool `yaml:"force_path_style"`

	// KeyTemplate is the S3 key naming template. Supported placeholders:
	//   {db}        - database name
	//   {date}      - date in YYYY-MM-DD format
	//   {timestamp} - Unix timestamp (seconds)
	//   {hostname}  - machine hostname
	// Example: "backups/{db}/{date}/{db}-{timestamp}.sql.gz"
	KeyTemplate string `yaml:"key_template"`

	// PartSizeMB is the multipart upload part size in megabytes (default 5).
	PartSizeMB int64 `yaml:"part_size_mb"`

	// Concurrency is the number of concurrent upload goroutines (default 5).
	Concurrency int `yaml:"concurrency"`

	// MaxRetries is the maximum number of upload retry attempts (default 3).
	MaxRetries int `yaml:"max_retries"`

	// Credentials holds explicit AWS credentials. If empty, the default
	// credential chain (IAM role, env vars, shared config) is used.
	Credentials AWSCredentials `yaml:"credentials"`

	// ServerSideEncryption specifies the SSE algorithm (e.g. "AES256").
	ServerSideEncryption string `yaml:"server_side_encryption"`

	// StorageClass sets the S3 storage class (e.g. "STANDARD_IA", "GLACIER").
	StorageClass string `yaml:"storage_class"`
}

// AWSCredentials holds explicit AWS access key credentials.
type AWSCredentials struct {
	AccessKeyID     string `yaml:"access_key_id"`
	SecretAccessKey string `yaml:"secret_access_key"`
	SessionToken    string `yaml:"session_token"`
}

// CompressConfig holds compression settings.
type CompressConfig struct {
	// Algorithm: "gzip", "zstd", "none"
	Algorithm string `yaml:"algorithm"`
	// Level is the compression level (algorithm-specific).
	Level int `yaml:"level"`
}

// WorkerConfig holds worker scheduling settings.
type WorkerConfig struct {
	// Schedule is a cron expression for when to run backups.
	Schedule string `yaml:"schedule"`
	// Timeout is the maximum duration for a single backup run.
	Timeout time.Duration `yaml:"timeout"`
}

// Load reads and parses a YAML config file from the given path.
func Load(path string) (*Config, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("reading config file %q: %w", path, err)
	}
	return parse(data)
}

// parse unmarshals YAML data into a Config, applying defaults.
func parse(data []byte) (*Config, error) {
	cfg := &Config{}
	if err := yaml.Unmarshal(data, cfg); err != nil {
		return nil, fmt.Errorf("parsing config: %w", err)
	}
	applyDefaults(cfg)
	if err := validate(cfg); err != nil {
		return nil, fmt.Errorf("invalid config: %w", err)
	}
	return cfg, nil
}

// applyDefaults sets sensible default values for unset fields.
func applyDefaults(cfg *Config) {
	if cfg.Storage.Backend == "" {
		cfg.Storage.Backend = "s3"
	}
	if cfg.Storage.S3.KeyTemplate == "" {
		cfg.Storage.S3.KeyTemplate = "backups/{db}/{date}/{db}-{timestamp}.sql.gz"
	}
	if cfg.Storage.S3.PartSizeMB <= 0 {
		cfg.Storage.S3.PartSizeMB = 5
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
	if cfg.Storage.Local.Directory == "" {
		cfg.Storage.Local.Directory = "/tmp/dbbackups"
	}
}

// validate checks required fields based on the selected backend.
func validate(cfg *Config) error {
	switch cfg.Storage.Backend {
	case "s3":
		if cfg.Storage.S3.Bucket == "" {
			return fmt.Errorf("storage.s3.bucket is required when backend is s3")
		}
		if cfg.Storage.S3.Region == "" {
			return fmt.Errorf("storage.s3.region is required when backend is s3")
		}
	case "local":
		if cfg.Storage.Local.Directory == "" {
			return fmt.Errorf("storage.local.directory is required when backend is local")
		}
	default:
		return fmt.Errorf("unknown storage backend %q (must be s3 or local)", cfg.Storage.Backend)
	}
	return nil
}