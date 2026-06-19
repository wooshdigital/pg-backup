package config

import (
	"fmt"
	"strings"

	"github.com/spf13/viper"
)

// Config holds all application configuration values.
type Config struct {
	// DatabaseDSN is the PostgreSQL connection string.
	// Example: postgres://user:password@localhost:5432/mydb?sslmode=disable
	DatabaseDSN string `mapstructure:"database_dsn"`

	// S3Bucket is the name of the S3 bucket where backups will be stored.
	S3Bucket string `mapstructure:"s3_bucket"`

	// S3Region is the AWS region where the S3 bucket resides.
	S3Region string `mapstructure:"s3_region"`

	// S3Prefix is the optional key prefix (folder path) inside the S3 bucket.
	S3Prefix string `mapstructure:"s3_prefix"`

	// Schedule is a cron expression defining when backups run.
	// Example: "0 2 * * *" (daily at 2 AM)
	Schedule string `mapstructure:"schedule"`

	// RetentionDays is the number of days to keep old backups.
	// Backups older than this will be deleted automatically.
	RetentionDays int `mapstructure:"retention_days"`

	// LogLevel controls the verbosity of log output.
	// Valid values: debug, info, warn, error
	LogLevel string `mapstructure:"log_level"`
}

// Load reads configuration from (in order of increasing priority):
//  1. Built-in defaults
//  2. config.yaml (if present in the working directory)
//  3. Environment variables (prefixed with PG_S3_BACKUP_)
//
// It returns a validated Config or an error describing what is missing/invalid.
func Load() (*Config, error) {
	v := viper.New()

	// ── Defaults ────────────────────────────────────────────────────────────────
	v.SetDefault("s3_prefix", "backups/")
	v.SetDefault("schedule", "0 2 * * *")
	v.SetDefault("retention_days", 30)
	v.SetDefault("log_level", "info")

	// ── Config file ─────────────────────────────────────────────────────────────
	v.SetConfigName("config")
	v.SetConfigType("yaml")
	v.AddConfigPath(".")
	v.AddConfigPath("/etc/pg-s3-backup/")

	// It's okay if the config file doesn't exist; env vars alone are sufficient.
	if err := v.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return nil, fmt.Errorf("error reading config file: %w", err)
		}
	}

	// ── Environment variables ────────────────────────────────────────────────────
	v.SetEnvPrefix("PG_S3_BACKUP")
	v.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	v.AutomaticEnv()

	// Explicitly bind each key so that env vars are resolved even when the
	// key has not been set via config file or SetDefault.
	envBindings := []string{
		"database_dsn",
		"s3_bucket",
		"s3_region",
		"s3_prefix",
		"schedule",
		"retention_days",
		"log_level",
	}
	for _, key := range envBindings {
		if err := v.BindEnv(key); err != nil {
			return nil, fmt.Errorf("failed to bind env var for %q: %w", key, err)
		}
	}

	// ── Unmarshal ────────────────────────────────────────────────────────────────
	var cfg Config
	if err := v.Unmarshal(&cfg); err != nil {
		return nil, fmt.Errorf("failed to unmarshal config: %w", err)
	}

	// ── Validation ───────────────────────────────────────────────────────────────
	if err := validate(&cfg); err != nil {
		return nil, err
	}

	return &cfg, nil
}

// validate checks that all required fields are present and values are within
// acceptable ranges.
func validate(cfg *Config) error {
	var errs []string

	if strings.TrimSpace(cfg.DatabaseDSN) == "" {
		errs = append(errs, "database_dsn (PG_S3_BACKUP_DATABASE_DSN) is required")
	}

	if strings.TrimSpace(cfg.S3Bucket) == "" {
		errs = append(errs, "s3_bucket (PG_S3_BACKUP_S3_BUCKET) is required")
	}

	if strings.TrimSpace(cfg.S3Region) == "" {
		errs = append(errs, "s3_region (PG_S3_BACKUP_S3_REGION) is required")
	}

	if strings.TrimSpace(cfg.Schedule) == "" {
		errs = append(errs, "schedule (PG_S3_BACKUP_SCHEDULE) must not be empty")
	}

	if cfg.RetentionDays < 1 {
		errs = append(errs, fmt.Sprintf(
			"retention_days (PG_S3_BACKUP_RETENTION_DAYS) must be >= 1, got %d",
			cfg.RetentionDays,
		))
	}

	validLevels := map[string]bool{
		"debug": true, "info": true, "warn": true, "error": true,
	}
	if !validLevels[strings.ToLower(cfg.LogLevel)] {
		errs = append(errs, fmt.Sprintf(
			"log_level (PG_S3_BACKUP_LOG_LEVEL) must be one of [debug, info, warn, error], got %q",
			cfg.LogLevel,
		))
	}

	if len(errs) > 0 {
		return fmt.Errorf("configuration validation failed:\n  - %s", strings.Join(errs, "\n  - "))
	}

	return nil
}