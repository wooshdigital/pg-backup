// Package config loads and validates application configuration.
package config

import (
	"fmt"
	"os"
	"time"

	"gopkg.in/yaml.v3"
)

// Config is the top-level application configuration.
type Config struct {
	// DSN is the PostgreSQL connection string for the database to dump.
	DSN string `yaml:"dsn"`

	// OutputDir is the directory where dump files will be written.
	OutputDir string `yaml:"output_dir"`

	// Schedule is a cron expression controlling when dumps run (optional).
	Schedule string `yaml:"schedule"`

	// PgDump contains pg_dump-specific configuration.
	PgDump PgDumpConfig `yaml:"pg_dump"`

	// Retention controls how long dump files are kept.
	Retention RetentionConfig `yaml:"retention"`
}

// PgDumpConfig holds configuration forwarded to the pg_dump invocation.
type PgDumpConfig struct {
	// BinaryPath is the path to the pg_dump binary.
	// Defaults to "pg_dump" (resolved via PATH) if empty.
	BinaryPath string `yaml:"binary_path"`

	// Format is the pg_dump output format: plain, custom, directory, or tar.
	Format string `yaml:"format"`

	// ExtraArgs are appended verbatim to the pg_dump command line.
	ExtraArgs []string `yaml:"extra_args"`
}

// RetentionConfig controls automatic cleanup of old dump files.
type RetentionConfig struct {
	// MaxAge is the maximum age of a dump file before it is deleted.
	MaxAge time.Duration `yaml:"max_age"`

	// MaxCount is the maximum number of dump files to keep (0 = unlimited).
	MaxCount int `yaml:"max_count"`
}

// Load reads a YAML config file from path and returns a validated Config.
func Load(path string) (*Config, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("config: reading %q: %w", path, err)
	}
	return parse(data)
}

func parse(data []byte) (*Config, error) {
	var cfg Config
	if err := yaml.Unmarshal(data, &cfg); err != nil {
		return nil, fmt.Errorf("config: parsing YAML: %w", err)
	}
	if err := validate(&cfg); err != nil {
		return nil, err
	}
	return &cfg, nil
}

func validate(cfg *Config) error {
	if cfg.DSN == "" {
		return fmt.Errorf("config: dsn is required")
	}
	if cfg.OutputDir == "" {
		return fmt.Errorf("config: output_dir is required")
	}
	if cfg.PgDump.Format != "" {
		switch cfg.PgDump.Format {
		case "plain", "custom", "directory", "tar":
			// valid
		default:
			return fmt.Errorf("config: pg_dump.format %q is not one of plain/custom/directory/tar",
				cfg.PgDump.Format)
		}
	}
	return nil
}