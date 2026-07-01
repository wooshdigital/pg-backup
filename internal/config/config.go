package config

import (
	"fmt"
	"os"

	"gopkg.in/yaml.v3"
)

// Config holds all application configuration loaded from config.yaml.
type Config struct {
	// Schedule is a standard 5-field cron expression (or robfig @every / @daily etc.)
	// Example: "0 2 * * *" runs at 02:00 AM daily.
	Schedule string `yaml:"schedule"`

	Database DatabaseConfig `yaml:"database"`
	Storage  StorageConfig  `yaml:"storage"`
	Compress CompressConfig `yaml:"compress"`
}

// DatabaseConfig contains the database connection parameters.
type DatabaseConfig struct {
	Driver   string `yaml:"driver"`
	Host     string `yaml:"host"`
	Port     int    `yaml:"port"`
	Name     string `yaml:"name"`
	User     string `yaml:"user"`
	Password string `yaml:"password"`
}

// StorageConfig defines where backups are stored.
type StorageConfig struct {
	Type   string `yaml:"type"` // "local" or "s3"
	Path   string `yaml:"path"` // local directory or S3 bucket
	Region string `yaml:"region"`
}

// CompressConfig defines compression settings.
type CompressConfig struct {
	Algorithm string `yaml:"algorithm"` // "gzip", "zstd", etc.
	Level     int    `yaml:"level"`
}

// Load reads and parses the YAML configuration file at the given path.
func Load(path string) (*Config, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, fmt.Errorf("opening config file %q: %w", path, err)
	}
	defer f.Close()

	var cfg Config
	if err := yaml.NewDecoder(f).Decode(&cfg); err != nil {
		return nil, fmt.Errorf("decoding config file %q: %w", path, err)
	}

	if err := cfg.validate(); err != nil {
		return nil, fmt.Errorf("invalid config: %w", err)
	}

	return &cfg, nil
}

// validate performs basic sanity checks on the loaded configuration.
func (c *Config) validate() error {
	if c.Schedule == "" {
		return fmt.Errorf("schedule must not be empty")
	}
	if c.Database.Driver == "" {
		return fmt.Errorf("database.driver must not be empty")
	}
	if c.Database.Name == "" {
		return fmt.Errorf("database.name must not be empty")
	}
	if c.Storage.Type == "" {
		return fmt.Errorf("storage.type must not be empty")
	}
	return nil
}