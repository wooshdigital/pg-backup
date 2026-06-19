package config

import (
	"errors"
	"fmt"
	"strings"

	"github.com/spf13/viper"
)

// Config holds all runtime configuration for pg-s3-backup.
type Config struct {
	// DBDSN is the PostgreSQL connection string, e.g.
	// "postgres://user:password@localhost:5432/mydb?sslmode=disable"
	DBDSN string `mapstructure:"db_dsn"`

	// S3Bucket is the name of the S3 bucket where backups are stored.
	S3Bucket string `mapstructure:"s3_bucket"`

	// S3Region is the AWS region of the S3 bucket.
	S3Region string `mapstructure:"s3_region"`

	// S3Prefix is an optional key prefix (folder) within the bucket.
	S3Prefix string `mapstructure:"s3_prefix"`

	// Schedule is a cron expression that controls when backups run.
	// Example: "0 2 * * *" (daily at 02:00 UTC)
	Schedule string `mapstructure:"schedule"`

	// RetentionDays is the number of days to keep old backups before deletion.
	RetentionDays int `mapstructure:"retention_days"`

	// LogLevel controls zerolog verbosity: trace, debug, info, warn, error, fatal, panic.
	LogLevel string `mapstructure:"log_level"`
}

// Load reads configuration from (in increasing priority order):
//  1. Built-in defaults
//  2. config.yaml (if present in the working directory)
//  3. Environment variables prefixed with BACKUP_ (e.g. BACKUP_DB_DSN)
//
// It returns a validated *Config or an error describing what is missing/invalid.
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
	v.AddConfigPath(".")          // working directory
	v.AddConfigPath("/etc/pg-s3-backup/") // system-wide location

	if err := v.ReadInConfig(); err != nil {
		// It is acceptable for the config file to be absent; all required
		// values can be supplied via environment variables.
		var notFound viper.ConfigFileNotFoundError
		if !errors.As(err, &notFound) {
			return nil, fmt.Errorf("reading config file: %w", err)
		}
	}

	// ── Environment variables ─────────────────────────────────────────────────
	// Variables must be prefixed with BACKUP_, e.g. BACKUP_DB_DSN maps to db_dsn.
	v.SetEnvPrefix("BACKUP")
	v.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	v.AutomaticEnv()

	// Explicit bindings ensure env vars work even when no config file is present.
	_ = v.BindEnv("db_dsn", "BACKUP_DB_DSN")
	_ = v.BindEnv("s3_bucket", "BACKUP_S3_BUCKET")
	_ = v.BindEnv("s3_region", "BACKUP_S3_REGION")
	_ = v.BindEnv("s3_prefix", "BACKUP_S3_PREFIX")
	_ = v.BindEnv("schedule", "BACKUP_SCHEDULE")
	_ = v.BindEnv("retention_days", "BACKUP_RETENTION_DAYS")
	_ = v.BindEnv("log_level", "BACKUP_LOG_LEVEL")

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

// validate checks that all required fields are present and values are sensible.
func validate(cfg *Config) error {
	var errs []string

	if strings.TrimSpace(cfg.DBDSN) == "" {
		errs = append(errs, "db_dsn is required (set BACKUP_DB_DSN or config key db_dsn)")
	}

	if strings.TrimSpace(cfg.S3Bucket) == "" {
		errs = append(errs, "s3_bucket is required (set BACKUP_S3_BUCKET or config key s3_bucket)")
	}

	if strings.TrimSpace(cfg.S3Region) == "" {
		errs = append(errs, "s3_region is required (set BACKUP_S3_REGION or config key s3_region)")
	}

	if strings.TrimSpace(cfg.Schedule) == "" {
		errs = append(errs, "schedule must not be empty")
	}

	if cfg.RetentionDays <= 0 {
		errs = append(errs, fmt.Sprintf("retention_days must be > 0, got %d", cfg.RetentionDays))
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
		return fmt.Errorf("configuration validation failed:\n  - %s", strings.Join(errs, "\n  - "))
	}

	return nil
}