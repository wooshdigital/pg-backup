package config

import (
	"fmt"
	"os"
	"time"

	"gopkg.in/yaml.v3"
)

// Config is the top-level application configuration.
type Config struct {
	Database DatabaseConfig `yaml:"database"`
	Storage  StorageConfig  `yaml:"storage"`
	Dump     DumpConfig     `yaml:"dump"`
}

// DatabaseConfig holds connection parameters for the source database.
type DatabaseConfig struct {
	DSN      string `yaml:"dsn"`
	Host     string `yaml:"host"`
	Port     int    `yaml:"port"`
	Name     string `yaml:"name"`
	User     string `yaml:"user"`
	Password string `yaml:"password"`
}

// StorageConfig holds configuration for the storage backend.
type StorageConfig struct {
	// Backend selects the storage backend: "s3" or "local".
	Backend string `yaml:"backend"`

	// S3 contains settings used when Backend == "s3".
	S3 S3Config `yaml:"s3"`

	// Local contains settings used when Backend == "local".
	Local LocalConfig `yaml:"local"`
}

// S3Config holds Amazon S3 (or S3-compatible service) configuration.
type S3Config struct {
	// Bucket is the name of the S3 bucket.
	Bucket string `yaml:"bucket"`

	// Region is the AWS region (e.g. "us-east-1").
	Region string `yaml:"region"`

	// Endpoint overrides the default S3 endpoint URL.
	// Useful for LocalStack or MinIO. Leave empty for real AWS.
	Endpoint string `yaml:"endpoint"`

	// ForcePathStyle forces path-style S3 URLs.
	// Required for LocalStack and some MinIO deployments.
	ForcePathStyle bool `yaml:"force_path_style"`

	// KeyTemplate is the S3 key naming template.
	// Supported placeholders: {db}, {date}, {timestamp}, {hostname}.
	// Example: "backups/{db}/{date}/{timestamp}-dump.sql.gz"
	KeyTemplate string `yaml:"key_template"`

	// PartSize is the size in bytes of each multipart upload part.
	// Defaults to 5 MB when zero or omitted.
	PartSize int64 `yaml:"part_size"`

	// Concurrency is the number of goroutines used for parallel multipart upload.
	// Defaults to 5 when zero or omitted.
	Concurrency int `yaml:"concurrency"`

	// MaxRetries is the maximum number of retry attempts for transient errors.
	// Defaults to 3 when zero or omitted.
	MaxRetries int `yaml:"max_retries"`

	// Credentials contains explicit AWS credentials.
	// If omitted, the default AWS credential chain is used (recommended for production).
	Credentials S3Credentials `yaml:"credentials"`
}

// S3Credentials holds optional explicit AWS credentials.
type S3Credentials struct {
	// AccessKeyID is the AWS access key ID.
	AccessKeyID string `yaml:"access_key_id"`
	// SecretAccessKey is the AWS secret access key.
	SecretAccessKey string `yaml:"secret_access_key"`
}

// LocalConfig holds configuration for the local filesystem storage backend.
type LocalConfig struct {
	// BaseDir is the root directory under which dump files are stored.
	BaseDir string `yaml:"base_dir"`
}

// DumpConfig holds settings that control how database dumps are performed.
type DumpConfig struct {
	// Compress selects the compression algorithm: "gzip", "zstd", or "none".
	Compress string `yaml:"compress"`

	// Schedule is a cron expression controlling dump frequency.
	Schedule string `yaml:"schedule"`

	// Timeout is the maximum allowed duration for a single dump operation.
	Timeout time.Duration `yaml:"timeout"`
}

// Load reads and parses a YAML configuration file at path.
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

	if err := cfg.Validate(); err != nil {
		return nil, err
	}

	return &cfg, nil
}

// Validate checks that the configuration is self-consistent and returns an
// error describing the first problem found, if any.
func (c *Config) Validate() error {
	switch c.Storage.Backend {
	case "s3":
		if c.Storage.S3.Bucket == "" {
			return fmt.Errorf("config: storage.s3.bucket is required when backend is \"s3\"")
		}
		if c.Storage.S3.Region == "" {
			return fmt.Errorf("config: storage.s3.region is required when backend is \"s3\"")
		}
		if c.Storage.S3.KeyTemplate == "" {
			return fmt.Errorf("config: storage.s3.key_template is required when backend is \"s3\"")
		}
	case "local":
		if c.Storage.Local.BaseDir == "" {
			return fmt.Errorf("config: storage.local.base_dir is required when backend is \"local\"")
		}
	case "":
		return fmt.Errorf("config: storage.backend must be set to \"s3\" or \"local\"")
	default:
		return fmt.Errorf("config: unknown storage backend %q; must be \"s3\" or \"local\"", c.Storage.Backend)
	}
	return nil
}