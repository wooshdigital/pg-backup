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
	TempDir  string         `yaml:"temp_dir"`
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

	// S3 configuration
	S3 S3Config `yaml:"s3"`

	// Local filesystem configuration
	Local LocalConfig `yaml:"local"`
}

// S3Config holds AWS S3 configuration.
type S3Config struct {
	Bucket string `yaml:"bucket"`
	Region string `yaml:"region"`

	// KeyPrefix is a template string supporting placeholders:
	// {db}, {date}, {timestamp}, {hostname}
	// Example: "backups/{hostname}/{db}/{date}/{timestamp}.sql.gz"
	KeyPrefix string `yaml:"key_prefix"`

	// PartSize is the size (in bytes) of each multipart upload part.
	// Defaults to 5 MiB if zero.
	PartSize int64 `yaml:"part_size"`

	// Concurrency is the number of concurrent goroutines for multipart upload.
	// Defaults to 5 if zero.
	Concurrency int `yaml:"concurrency"`

	// Credentials for explicit key/secret auth.
	// If empty, IAM role / environment / shared config credentials are used.
	Credentials S3Credentials `yaml:"credentials"`

	// Endpoint allows overriding the S3 endpoint (e.g. for LocalStack).
	Endpoint string `yaml:"endpoint"`

	// ForcePathStyle forces path-style S3 URLs (required for LocalStack).
	ForcePathStyle bool `yaml:"force_path_style"`

	// MaxRetries is the maximum number of upload attempts (default 3).
	MaxRetries int `yaml:"max_retries"`

	// RetryMaxBackoff is the maximum backoff duration between retries.
	RetryMaxBackoff time.Duration `yaml:"retry_max_backoff"`
}

// S3Credentials holds explicit AWS credentials.
type S3Credentials struct {
	AccessKeyID     string `yaml:"access_key_id"`
	SecretAccessKey string `yaml:"secret_access_key"`
	SessionToken    string `yaml:"session_token"`
}

// LocalConfig holds local filesystem storage configuration.
type LocalConfig struct {
	// Directory is the base directory for stored files.
	Directory string `yaml:"directory"`
}

// CompressConfig holds compression settings.
type CompressConfig struct {
	Algorithm string `yaml:"algorithm"` // "gzip", "zstd", etc.
	Level     int    `yaml:"level"`
}

// Load reads and parses configuration from the given YAML file path.
func Load(path string) (*Config, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("config: reading file %q: %w", path, err)
	}

	cfg := defaultConfig()
	if err := yaml.Unmarshal(data, cfg); err != nil {
		return nil, fmt.Errorf("config: parsing YAML: %w", err)
	}

	if err := cfg.validate(); err != nil {
		return nil, fmt.Errorf("config: validation: %w", err)
	}

	return cfg, nil
}

// defaultConfig returns a Config populated with sensible defaults.
func defaultConfig() *Config {
	return &Config{
		Storage: StorageConfig{
			Backend: "s3",
			S3: S3Config{
				PartSize:        5 * 1024 * 1024, // 5 MiB
				Concurrency:     5,
				MaxRetries:      3,
				RetryMaxBackoff: 30 * time.Second,
			},
		},
		Compress: CompressConfig{
			Algorithm: "gzip",
			Level:     6,
		},
		TempDir: os.TempDir(),
	}
}

// validate checks that required fields are set and values are sane.
func (c *Config) validate() error {
	switch c.Storage.Backend {
	case "s3":
		if c.Storage.S3.Bucket == "" {
			return fmt.Errorf("storage.s3.bucket is required when backend is 's3'")
		}
		if c.Storage.S3.Region == "" {
			return fmt.Errorf("storage.s3.region is required when backend is 's3'")
		}
		if c.Storage.S3.PartSize <= 0 {
			c.Storage.S3.PartSize = 5 * 1024 * 1024
		}
		if c.Storage.S3.Concurrency <= 0 {
			c.Storage.S3.Concurrency = 5
		}
		if c.Storage.S3.MaxRetries <= 0 {
			c.Storage.S3.MaxRetries = 3
		}
	case "local":
		if c.Storage.Local.Directory == "" {
			return fmt.Errorf("storage.local.directory is required when backend is 'local'")
		}
	case "":
		return fmt.Errorf("storage.backend must be set ('s3' or 'local')")
	default:
		return fmt.Errorf("storage.backend %q is not supported (use 's3' or 'local')", c.Storage.Backend)
	}
	return nil
}