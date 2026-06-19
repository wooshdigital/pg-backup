package config

import (
	"errors"
	"fmt"
	"strings"

	"github.com/spf13/viper"
)

// Config holds all runtime configuration for pg-s3-backup.
type Config struct {
	// DatabaseDSN is the PostgreSQL connection string.
	// Example: postgres://user:password@localhost:5432/mydb?sslmode=disable
	DatabaseDSN string `mapstructure:"database_dsn"`

	// S3Bucket is the target S3 bucket name.
	S3Bucket string `mapstructure:"s3_bucket"`

	// S3Region is the AWS region where the bucket lives.
	S3Region string `mapstructure:"s3_region"`

	// S3Prefix is an optional path prefix inside the bucket.
	S3Prefix string `mapstructure:"s3_prefix"`

	// Schedule is a standard 5-field cron expression controlling backup frequency.
	// Example: "0 2 * * *" (run at 02:00 every day)
	Schedule string `mapstructure:"schedule"`

	// RetentionDays is how many days to keep old backups before deleting them.
	RetentionDays int `mapstructure:"retention_days"`

	// LogLevel controls the zerolog global log level (trace/debug/info/warn/error/fatal).
	LogLevel string `mapstructure:"log_level"`
}

// Load reads configuration from (in increasing priority):
//  1. Built-in defaults
//  2. config.yaml (if present in the working directory)
//  3. Environment variables prefixed with BACKUP_ (e.g. BACKUP_S3_BUCKET)
//
// It returns a validated Config or an error describing what is missing / invalid.
func Load() (*Config, error) {
	v := viper.New()

	// -------------------------------------------------------------------------
	// Defaults
	// -------------------------------------------------------------------------
	v.SetDefault("s3_prefix", "backups/")
	v.SetDefault("schedule", "0 2 * * *")
	v.SetDefault("retention_days", 30)
	v.SetDefault("log_level", "info")

	// -------------------------------------------------------------------------
	// Config file (optional)
	// -------------------------------------------------------------------------
	v.SetConfigName("config")
	v.SetConfigType("yaml")
	v.AddConfigPath(".")
	v.AddConfigPath("/etc/pg-s3-backup/")

	if err := v.ReadInConfig(); err != nil {
		var notFound viper.ConfigFileNotFoundError
		if !errors.As(err, &notFound) {
			return nil, fmt.Errorf("reading config file: %w", err)
		}
		// No config file is fine — env vars / defaults will be used.
	}

	// -------------------------------------------------------------------------
	// Environment variables  (BACKUP_DATABASE_DSN, BACKUP_S3_BUCKET, …)
	// -------------------------------------------------------------------------
	v.SetEnvPrefix("BACKUP")
	v.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	v.AutomaticEnv()

	// -------------------------------------------------------------------------
	// Unmarshal into struct
	// -------------------------------------------------------------------------
	var cfg Config
	if err := v.Unmarshal(&cfg); err != nil {
		return nil, fmt.Errorf("unmarshalling config: %w", err)
	}

	// -------------------------------------------------------------------------
	// Validation
	// -------------------------------------------------------------------------
	if err := validate(&cfg); err != nil {
		return nil, err
	}

	return &cfg, nil
}

// validate checks that all required fields are present and that values are sane.
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

	if cfg.RetentionDays < 1 {
		errs = append(errs, "retention_days must be >= 1")
	}

	validLevels := map[string]bool{
		"trace": true, "debug": true, "info": true,
		"warn": true, "error": true, "fatal": true, "panic": true,
	}
	if !validLevels[strings.ToLower(cfg.LogLevel)] {
		errs = append(errs, fmt.Sprintf("log_level %q is not valid; choose one of: trace, debug, info, warn, error, fatal", cfg.LogLevel))
	}

	if len(errs) > 0 {
		return fmt.Errorf("configuration errors:\n  - %s", strings.Join(errs, "\n  - "))
	}

	return nil
}