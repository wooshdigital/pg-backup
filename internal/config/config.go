package config

import (
	"fmt"
	"os"
	"time"

	"gopkg.in/yaml.v3"
)

// CompressionFormat specifies the compression algorithm to use.
type CompressionFormat string

const (
	CompressionGzip CompressionFormat = "gzip"
	CompressionZstd CompressionFormat = "zstd"
	CompressionNone CompressionFormat = "none"
)

// Config holds all application configuration.
type Config struct {
	Database    DatabaseConfig    `yaml:"database"`
	Storage     StorageConfig     `yaml:"storage"`
	Compression CompressionConfig `yaml:"compression"`
	Schedule    ScheduleConfig    `yaml:"schedule"`
}

// DatabaseConfig holds PostgreSQL connection settings.
type DatabaseConfig struct {
	DSN      string `yaml:"dsn"`
	Host     string `yaml:"host"`
	Port     int    `yaml:"port"`
	Name     string `yaml:"name"`
	User     string `yaml:"user"`
	Password string `yaml:"password"`
}

// StorageConfig holds settings for where dumps are stored.
type StorageConfig struct {
	OutputDir string `yaml:"output_dir"`
}

// CompressionConfig holds compression settings.
type CompressionConfig struct {
	// Format is the compression algorithm: "gzip", "zstd", or "none".
	Format CompressionFormat `yaml:"format"`
	// Level is the compression level. Interpretation depends on Format:
	//   gzip: 1 (BestSpeed) to 9 (BestCompression), -1 for default.
	//   zstd: 1 (fastest) to 4 (best compression).
	//   none: ignored.
	Level int `yaml:"level"`
}

// ScheduleConfig holds cron/interval scheduling settings.
type ScheduleConfig struct {
	Cron     string        `yaml:"cron"`
	Interval time.Duration `yaml:"interval"`
}

// DefaultConfig returns a Config populated with sensible defaults.
func DefaultConfig() Config {
	return Config{
		Database: DatabaseConfig{
			Host: "localhost",
			Port: 5432,
		},
		Storage: StorageConfig{
			OutputDir: "/tmp/pgdumps",
		},
		Compression: CompressionConfig{
			Format: CompressionGzip,
			Level:  -1, // gzip.DefaultCompression
		},
	}
}

// Load reads and parses a YAML config file from the given path,
// merging values on top of defaults.
func Load(path string) (*Config, error) {
	cfg := DefaultConfig()

	f, err := os.Open(path)
	if err != nil {
		return nil, fmt.Errorf("opening config file %q: %w", path, err)
	}
	defer f.Close()

	dec := yaml.NewDecoder(f)
	dec.KnownFields(true)
	if err := dec.Decode(&cfg); err != nil {
		return nil, fmt.Errorf("parsing config file %q: %w", path, err)
	}

	if err := cfg.Validate(); err != nil {
		return nil, fmt.Errorf("invalid config: %w", err)
	}

	return &cfg, nil
}

// Validate checks that the configuration is internally consistent.
func (c *Config) Validate() error {
	switch c.Compression.Format {
	case CompressionGzip, CompressionZstd, CompressionNone, "":
		// valid
	default:
		return fmt.Errorf("unsupported compression format %q: must be one of gzip, zstd, none", c.Compression.Format)
	}

	if c.Compression.Format == CompressionGzip {
		level := c.Compression.Level
		// gzip levels: -1 (default), 0 (no compression), 1–9
		if level != -1 && level != 0 && (level < 1 || level > 9) {
			return fmt.Errorf("invalid gzip compression level %d: must be -1 (default) or 0–9", level)
		}
	}

	if c.Compression.Format == CompressionZstd {
		level := c.Compression.Level
		if level < 1 || level > 4 {
			return fmt.Errorf("invalid zstd compression level %d: must be 1–4", level)
		}
	}

	return nil
}