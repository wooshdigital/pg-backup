package config

import (
	"fmt"
	"os"
	"time"

	"gopkg.in/yaml.v3"
)

// Config is the top-level application configuration.
type Config struct {
	// Database holds connection parameters for the source database.
	Database DatabaseConfig `yaml:"database"`

	// Storage holds configuration for the backup storage backend.
	Storage StorageConfig `yaml:"storage"`

	// Compress holds configuration for the compression stage.
	Compress CompressConfig `yaml:"compress"`

	// Worker holds general worker / scheduling configuration.
	Worker WorkerConfig `yaml:"worker"`
}

// DatabaseConfig holds database connection parameters.
type DatabaseConfig struct {
	Host     string `yaml:"host"`
	Port     int    `yaml:"port"`
	Name     string `yaml:"name"`
	User     string `yaml:"user"`
	Password string `yaml:"password"`
	SSLMode  string `yaml:"ssl_mode"`
}

// StorageConfig holds all storage-backend configuration.
type StorageConfig struct {
	// Backend selects the storage backend: "s3" (default) or "local".
	Backend string `yaml:"backend"`

	// S3 holds S3-specific configuration (used when Backend == "s3").
	S3 S3StorageConfig `yaml:"s3"`

	// Local holds local-filesystem configuration (used when Backend == "local").
	Local LocalStorageConfig `yaml:"local"`
}

// S3StorageConfig holds configuration specific to the S3 storage backend.
type S3StorageConfig struct {
	// Bucket is the target S3 bucket name (required).
	Bucket string `yaml:"bucket"`

	// Region is the AWS region, e.g. "us-east-1" (required).
	Region string `yaml:"region"`

	// Endpoint overrides the S3 endpoint URL.
	// Useful for LocalStack / MinIO in development and testing.
	Endpoint string `yaml:"endpoint"`

	// ForcePathStyle forces path-style S3 addressing.
	// Required for LocalStack and some MinIO setups.
	ForcePathStyle bool `yaml:"force_path_style"`

	// KeyPrefix is a Go template for the S3 object key.
	// Supported placeholders: {db}, {date}, {timestamp}, {hostname}.
	// Example: "backups/{db}/{date}/{timestamp}.sql.gz"
	KeyPrefix string `yaml:"key_prefix"`

	// PartSize is the multipart upload part size in bytes.
	// Defaults to 5 MiB (5 * 1024 * 1024) when zero or unset.
	PartSize int64 `yaml:"part_size"`

	// Concurrency is the number of parallel goroutines used during multipart
	// upload.  Defaults to 5 when zero or unset.
	Concurrency int `yaml:"concurrency"`

	// MaxRetries is the maximum number of retry attempts on transient errors.
	// Defaults to 3 when zero or unset.
	MaxRetries int `yaml:"max_retries"`

	// Credentials holds optional explicit AWS credentials.
	// When omitted the SDK uses its default credential chain
	// (IAM role → env vars → ~/.aws/credentials).
	Credentials S3Credentials `yaml:"credentials"`
}

// S3Credentials holds optional explicit AWS access credentials.
type S3Credentials struct {
	// AccessKeyID is the AWS access key ID.
	AccessKeyID string `yaml:"access_key_id"`
	// SecretAccessKey is the AWS secret access key.
	SecretAccessKey string `yaml:"secret_access_key"`
}

// LocalStorageConfig holds configuration for the local-filesystem backend.
type LocalStorageConfig struct {
	// BaseDir is the directory under which backup files are written.
	BaseDir string `yaml:"base_dir"`
}

// CompressConfig holds compression configuration.
type CompressConfig struct {
	// Algorithm selects the compression algorithm: "gzip" (default), "zstd", or "none".
	Algorithm string `yaml:"algorithm"`
	// Level is the compression level (algorithm-specific).
	Level int `yaml:"level"`
}

// WorkerConfig holds general worker configuration.
type WorkerConfig struct {
	// Schedule is a cron expression for the backup schedule.
	Schedule string `yaml:"schedule"`
	// Timeout is the maximum duration allowed for a single backup run.
	Timeout time.Duration `yaml:"timeout"`
	// TempDir is the directory used for temporary files during backup.
	TempDir string `yaml:"temp_dir"`
}

// Load reads and parses a YAML configuration file from path.
func Load(path string) (*Config, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, fmt.Errorf("config: opening %q: %w", path, err)
	}
	defer f.Close()

	var cfg Config
	dec := yaml.NewDecoder(f)
	dec.KnownFields(true)
	if err := dec.Decode(&cfg); err != nil {
		return nil, fmt.Errorf("config: parsing %q: %w", path, err)
	}

	if err := cfg.validate(); err != nil {
		return nil, fmt.Errorf("config: validation failed: %w", err)
	}

	return &cfg, nil
}

// validate performs semantic validation of the configuration.
func (c *Config) validate() error {
	switch c.Storage.Backend {
	case "", "s3":
		if c.Storage.S3.Bucket == "" {
			return fmt.Errorf("storage.s3.bucket is required when backend is 's3'")
		}
		if c.Storage.S3.Region == "" {
			return fmt.Errorf("storage.s3.region is required when backend is 's3'")
		}
	case "local":
		if c.Storage.Local.BaseDir == "" {
			return fmt.Errorf("storage.local.base_dir is required when backend is 'local'")
		}
	default:
		return fmt.Errorf("storage.backend %q is not supported (use 's3' or 'local')", c.Storage.Backend)
	}

	return nil
}