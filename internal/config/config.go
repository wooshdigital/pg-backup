package config

import (
	"errors"
	"fmt"
	"strings"

	"github.com/spf13/viper"
)

// Config holds all runtime configuration for the pg-s3-backup worker.
type Config struct {
	// DatabaseDSN is the PostgreSQL connection string used by pg_dump.
	// Example: postgres://user:password@localhost:5432/mydb?sslmode=disable
	DatabaseDSN string `mapstructure:"database_dsn"`

	// S3Bucket is the name of the S3 bucket where backups are stored.
	S3Bucket string `mapstructure:"s3_bucket"`

	// S3Region is the AWS region of the target S3 bucket.
	S3Region string `mapstructure:"s3_region"`

	// S3Prefix is an optional key prefix (folder path) within the bucket.
	S3Prefix string `mapstructure:"s3_prefix"`

	// Schedule is a cron expression that controls when backups run.
	// Example: "0 2 * * *" (every day at 02:00 UTC)
	Schedule string `mapstructure:"schedule"`

	// RetentionDays is the number of days to keep backup objects in S3.
	// Backups older than this value will be deleted. 0 means keep forever.
	RetentionDays int `mapstructure:"retention_days"`

	// LogLevel controls zerolog's global log level.
	// Valid values: trace, debug, info, warn, error, fatal, panic
	LogLevel string `mapstructure:"log_level"`
}

// Load reads configuration from (in ascending priority):
//  1. Built-in defaults
//  2. config.yaml (or config.yaml.example) in the working directory
//  3. Environment variables prefixed with BACKUP_ (e.g. BACKUP_DATABASE_DSN)
//
// The returned Config is validated before being returned; an error is returned
// if any required field is missing or invalid.
func Load() (*Config, error) {
	v := viper.New()

	// ── Defaults ─────────────────────────────────────────────────────────────
	v.SetDefault("s3_prefix", "backups/")
	v.SetDefault("schedule", "0 2 * * *")
	v.SetDefault("retention_days", 30)
	v.SetDefault("log_level", "info")

	// ── Config file ──────────────────────────────────────────────────────────
	v.SetConfigName("config")
	v.SetConfigType("yaml")
	v.AddConfigPath(".")
	v.AddConfigPath("/etc/pg-s3-backup/")

	if err := v.ReadInConfig(); err != nil {
		var notFound viper.ConfigFileNotFoundError
		if !errors.As(err, &notFound) {
			return nil, fmt.Errorf("reading config file: %w", err)
		}
		// No config file is fine — environment variables are sufficient.
	}

	// ── Environment variables ─────────────────────────────────────────────────
	// Each config key maps to BACKUP_<KEY> (upper-cased, dots/dashes → '_').
	v.SetEnvPrefix("BACKUP")
	v.SetEnvKeyReplacer(strings.NewReplacer(".", "_", "-", "_"))
	v.AutomaticEnv()

	// Explicitly bind keys so that AutomaticEnv works even when no default or
	// config-file value has been set for a key.
	bindKeys := []string{
		"database_dsn",
		"s3_bucket",
		"s3_region",
		"s3_prefix",
		"schedule",
		"retention_days",
		"log_level",
	}
	for _, key := range bindKeys {
		if err := v.BindEnv(key); err != nil {
			return nil, fmt.Errorf("binding env for %q: %w", key, err)
		}
	}

	// ── Unmarshal ─────────────────────────────────────────────────────────────
	var cfg Config
	if err := v.Unmarshal(&cfg); err != nil {
		return nil, fmt.Errorf("unmarshalling config: %w", err)
	}

	// ── Validation ────────────────────────────────────────────────────────────
	if err := validate(&cfg); err != nil {
		return nil, err
	}

	return &cfg, nil
}

// validate checks that all required fields are present and that values are
// within acceptable ranges.
func validate(cfg *Config) error {
	var errs []string

	if strings.TrimSpace(cfg.DatabaseDSN) == "" {
		errs = append(errs, "database_dsn is required (set BACKUP_DATABASE_DSN or database_dsn in config.yaml)")
	}

	if strings.TrimSpace(cfg.S3Bucket) == "" {
		errs = append(errs, "s3_bucket is required (set BACKUP_S3_BUCKET or s3_bucket in config.yaml)")
	}

	if strings.TrimSpace(cfg.S3Region) == "" {
		errs = append(errs, "s3_region is required (set BACKUP_S3_REGION or s3_region in config.yaml)")
	}

	if strings.TrimSpace(cfg.Schedule) == "" {
		errs = append(errs, "schedule must not be empty")
	}

	if cfg.RetentionDays < 0 {
		errs = append(errs, "retention_days must be >= 0 (0 means keep forever)")
	}

	validLogLevels := map[string]bool{
		"trace": true, "debug": true, "info": true,
		"warn": true, "error": true, "fatal": true, "panic": true,
	}
	if !validLogLevels[strings.ToLower(cfg.LogLevel)] {
		errs = append(errs, fmt.Sprintf(
			"log_level %q is invalid; must be one of: trace, debug, info, warn, error, fatal, panic",
			cfg.LogLevel,
		))
	}

	if len(errs) > 0 {
		return fmt.Errorf("configuration errors:\n  - %s", strings.Join(errs, "\n  - "))
	}
	return nil
}