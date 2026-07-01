package config

import (
	"fmt"
	"os"

	"gopkg.in/yaml.v3"
)

// Config holds all runtime configuration for the backup worker.
type Config struct {
	Database Database `yaml:"database"`
	Schedule Schedule `yaml:"schedule"`
	Compress Compress `yaml:"compress"`
	Storage  Storage  `yaml:"storage"`
	Local    Local    `yaml:"local"`
	TempDir  string   `yaml:"temp_dir"`
}

// Database contains the PostgreSQL connection parameters.
type Database struct {
	Host     string `yaml:"host"`
	Port     int    `yaml:"port"`
	Name     string `yaml:"name"`
	User     string `yaml:"user"`
	Password string `yaml:"password"`
}

// Schedule contains the cron scheduling configuration.
type Schedule struct {
	CronExpression string `yaml:"cron_expression"`
}

// Compress configures the compression algorithm.
type Compress struct {
	Algorithm string `yaml:"algorithm"`
}

// Storage configures the storage backend.
type Storage struct {
	Backend  string `yaml:"backend"`
	Bucket   string `yaml:"bucket"`
	Prefix   string `yaml:"prefix"`
	Region   string `yaml:"region"`
	Endpoint string `yaml:"endpoint"`
}

// Local configures the local filesystem storage backend.
type Local struct {
	Path string `yaml:"path"`
}

// Load reads and parses a YAML configuration file.
func Load(path string) (*Config, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("read config file %q: %w", path, err)
	}

	cfg := &Config{
		Database: Database{
			Port: 5432,
		},
		Schedule: Schedule{
			CronExpression: "0 2 * * *",
		},
		Compress: Compress{
			Algorithm: "gzip",
		},
		Storage: Storage{
			Backend: "local",
		},
		TempDir: os.TempDir(),
	}

	if err := yaml.Unmarshal(data, cfg); err != nil {
		return nil, fmt.Errorf("parse config file %q: %w", path, err)
	}

	if err := cfg.validate(); err != nil {
		return nil, fmt.Errorf("invalid config: %w", err)
	}

	return cfg, nil
}

func (c *Config) validate() error {
	if c.Database.Host == "" {
		return fmt.Errorf("database.host is required")
	}
	if c.Database.Name == "" {
		return fmt.Errorf("database.name is required")
	}
	if c.Schedule.CronExpression == "" {
		return fmt.Errorf("schedule.cron_expression is required")
	}
	return nil
}