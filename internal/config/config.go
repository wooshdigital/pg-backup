// Package config provides configuration loading and validation for pg-s3-backup.
// It uses Viper so that values can come from (in ascending priority order):
//  1. Built-in defaults
//  2. A YAML config file (config.yaml in the working directory, or the path
//     given in the CONFIG_FILE env var)
//  3. Environment variables prefixed with BACKUP_
package config

import (
	"errors"
	"fmt"
	"strings"

	"github.com/spf13/viper"
)

// Config holds the complete, validated runtime configuration.
type Config struct {
	// DatabaseDSN is the libpq-compatible connection string for the source
	// PostgreSQL database, e.g.
	//   postgres://user:pass@host:5432/dbname?sslmode=require
	DatabaseDSN string `mapstructure:"database_dsn"`

	// S3Bucket is the name of the target S3 bucket.
	S3Bucket string `mapstructure:"s3_bucket"`

	// S3Region is the AWS region that hosts the bucket.
	S3Region string `mapstructure:"s3_region"`

	// S3Prefix is an optional key prefix (folder path) inside the bucket.
	// Defaults to "backups/".
	S3Prefix string `mapstructure:"s3_prefix"`

	// Schedule is a standard 5-field cron expression that controls when
	// backups run, e.g. "0 2 * * *" (daily at 02:00 UTC).
	Schedule string `mapstructure:"schedule"`

	// RetentionDays is how many days of backups to keep in S3.
	// Backups older than this will be deleted after a successful run.
	RetentionDays int `mapstructure:"retention_days"`

	// LogLevel controls zerolog's global log level.
	// Accepted values: trace, debug, info, warn, error, fatal, panic.
	LogLevel string `mapstructure:"log_level"`
}

// Load reads configuration from the config file and environment variables,
// merges them (env vars take precedence), validates the result, and returns
// a populated Config struct.
func Load() (*Config, error) {
	v := viper.New()

	// ── Defaults ──────────────────────────────────────────────────────────────
	v.SetDefault("s3_prefix", "backups/")
	v.SetDefault("schedule", "0 2 * * *")
	v.SetDefault("retention_days", 30)
	v.SetDefault("log_level", "info")

	// ── Config file ───────────────────────────────────────────────────────────
	// Allow the operator to point at a custom path via CONFIG_FILE.
	v.SetConfigName("config")
	v.SetConfigType("yaml")
	v.AddConfigPath(".")
	v.AddConfigPath("/etc/pg-s3-backup")

	// Optional: explicit config file path via env var.
	if cfgFile := v.GetString("CONFIG_FILE"); cfgFile != "" {
		v.SetConfigFile(cfgFile)
	}

	if err := v.ReadInConfig(); err != nil {
		// A missing config file is not fatal; env vars alone are sufficient.
		var notFound viper.ConfigFileNotFoundError
		if !errors.As(err, &notFound) {
			return nil, fmt.Errorf("reading config file: %w", err)
		}
	}

	// ── Environment variables ─────────────────────────────────────────────────
	// All env vars must be prefixed with BACKUP_, e.g. BACKUP_DATABASE_DSN.
	v.SetEnvPrefix("BACKUP")
	v.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	v.AutomaticEnv()

	// Explicitly bind each key so that env vars are picked up even when no
	// config file key with the same name has been set yet.
	keys := []string{
		"database_dsn",
		"s3_bucket",
		"s3_region",
		"s3_prefix",
		"schedule",
		"retention_days",
		"log_level",
	}
	for _, k := range keys {
		if err := v.BindEnv(k); err != nil {
			return nil, fmt.Errorf("binding env var for %q: %w", k, err)
		}
	}

	// ── Unmarshal ─────────────────────────────────────────────────────────────
	var cfg Config
	if err := v.Unmarshal(&cfg); err != nil {
		return nil, fmt.Errorf("unmarshalling config: %w", err)
	}

	// ── Validate ──────────────────────────────────────────────────────────────
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
	if cfg.RetentionDays < 1 {
		errs = append(errs, "retention_days must be >= 1")
	}

	validLevels := map[string]bool{
		"trace": true, "debug": true, "info": true,
		"warn": true, "error": true, "fatal": true, "panic": true,
	}
	if !validLevels[strings.ToLower(cfg.LogLevel)] {
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