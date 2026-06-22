package config

import (
	"fmt"
	"net/url"
	"strings"

	"github.com/spf13/viper"
)

// Config holds all application configuration values.
type Config struct {
	// DatabaseDSN is the PostgreSQL connection string.
	// Example: postgres://user:password@localhost:5432/mydb?sslmode=disable
	DatabaseDSN string `mapstructure:"database_dsn"`

	// S3Bucket is the target S3 bucket name for storing backups.
	S3Bucket string `mapstructure:"s3_bucket"`

	// S3Region is the AWS region where the S3 bucket resides.
	S3Region string `mapstructure:"s3_region"`

	// S3Prefix is an optional key prefix (folder path) within the bucket.
	S3Prefix string `mapstructure:"s3_prefix"`

	// Schedule is a cron expression defining backup frequency.
	// Example: "0 2 * * *" (daily at 02:00 UTC)
	Schedule string `mapstructure:"schedule"`

	// RetentionDays is the number of days to keep old backups before deletion.
	RetentionDays int `mapstructure:"retention_days"`

	// LogLevel controls zerolog verbosity: trace, debug, info, warn, error, fatal, panic.
	LogLevel string `mapstructure:"log_level"`
}

// Load reads configuration from (in ascending priority order):
//  1. Built-in defaults
//  2. config.yaml (if present in the working directory)
//  3. Environment variables (prefixed with BACKUP_)
//
// It returns a validated *Config or an error describing what is missing/invalid.
func Load() (*Config, error) {
	v := viper.New()

	// ── Defaults ──────────────────────────────────────────────────────────────
	v.SetDefault("s3_prefix", "backups/")
	v.SetDefault("schedule", "0 2 * * *")
	v.SetDefault("retention_days", 30)
	v.SetDefault("log_level", "info")

	// ── Config file ───────────────────────────────────────────────────────────
	v.SetConfigName("config")
	v.SetConfigType("yaml")
	v.AddConfigPath(".")
	v.AddConfigPath("/etc/pg-s3-backup/")

	if err := v.ReadInConfig(); err != nil {
		// It is acceptable for the config file to be absent; env vars are enough.
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return nil, fmt.Errorf("error reading config file: %w", err)
		}
	}

	// ── Environment variables ─────────────────────────────────────────────────
	// Each env var is prefixed with BACKUP_ and maps to the corresponding key.
	// e.g. BACKUP_DATABASE_DSN → database_dsn
	v.SetEnvPrefix("BACKUP")
	v.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	v.AutomaticEnv()

	// Explicit bindings ensure env vars are picked up even when no default exists.
	_ = v.BindEnv("database_dsn", "BACKUP_DATABASE_DSN")
	_ = v.BindEnv("s3_bucket", "BACKUP_S3_BUCKET")
	_ = v.BindEnv("s3_region", "BACKUP_S3_REGION")
	_ = v.BindEnv("s3_prefix", "BACKUP_S3_PREFIX")
	_ = v.BindEnv("schedule", "BACKUP_SCHEDULE")
	_ = v.BindEnv("retention_days", "BACKUP_RETENTION_DAYS")
	_ = v.BindEnv("log_level", "BACKUP_LOG_LEVEL")

	// ── Unmarshal ─────────────────────────────────────────────────────────────
	var cfg Config
	if err := v.Unmarshal(&cfg); err != nil {
		return nil, fmt.Errorf("failed to unmarshal config: %w", err)
	}

	// ── Validation ────────────────────────────────────────────────────────────
	if err := validate(&cfg); err != nil {
		return nil, err
	}

	return &cfg, nil
}

// validate checks that all required fields are present and values are sane.
func validate(cfg *Config) error {
	var errs []string

	if strings.TrimSpace(cfg.DatabaseDSN) == "" {
		errs = append(errs, "database_dsn (BACKUP_DATABASE_DSN) is required")
	}

	if strings.TrimSpace(cfg.S3Bucket) == "" {
		errs = append(errs, "s3_bucket (BACKUP_S3_BUCKET) is required")
	}

	if strings.TrimSpace(cfg.S3Region) == "" {
		errs = append(errs, "s3_region (BACKUP_S3_REGION) is required")
	}

	if strings.TrimSpace(cfg.Schedule) == "" {
		errs = append(errs, "schedule must not be empty")
	}

	if cfg.RetentionDays <= 0 {
		errs = append(errs, "retention_days must be a positive integer")
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

	// Normalise log level to lower case
	cfg.LogLevel = strings.ToLower(cfg.LogLevel)

	if len(errs) > 0 {
		return fmt.Errorf("configuration errors:\n  - %s", strings.Join(errs, "\n  - "))
	}

	return nil
}

// MaskDSN replaces the password component of a DSN with "***" so that it can
// be safely written to logs.
func MaskDSN(dsn string) string {
	if dsn == "" {
		return ""
	}

	u, err := url.Parse(dsn)
	if err != nil {
		// Not a URL-style DSN — redact the whole thing to be safe.
		return "***"
	}

	if u.User != nil {
		if _, hasPassword := u.User.Password(); hasPassword {
			u.User = url.UserPassword(u.User.Username(), "***")
		}
	}

	return u.String()
}