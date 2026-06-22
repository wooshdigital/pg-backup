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

	// S3Prefix is an optional key prefix (folder) inside the bucket.
	S3Prefix string `mapstructure:"s3_prefix"`

	// Schedule is a standard cron expression (5 or 6 field) controlling
	// how often backups run.
	// Example: "0 2 * * *"  (every day at 02:00)
	Schedule string `mapstructure:"schedule"`

	// RetentionDays is the number of days to keep old backups.
	// Backups older than this will be deleted from S3.
	RetentionDays int `mapstructure:"retention_days"`

	// LogLevel controls zerolog verbosity: trace, debug, info, warn, error, fatal, panic.
	LogLevel string `mapstructure:"log_level"`
}

// Load reads configuration from (in increasing priority order):
//  1. Built-in defaults
//  2. config.yaml (or the path in the CONFIG_FILE env var)
//  3. Environment variables prefixed with BACKUP_
//
// After loading, the configuration is validated and a non-nil error is
// returned if any required field is missing or invalid.
func Load() (*Config, error) {
	v := viper.New()

	setDefaults(v)
	bindEnvVars(v)

	// Allow an explicit config file path via environment variable.
	if cfgFile := v.GetString("config_file"); cfgFile != "" {
		v.SetConfigFile(cfgFile)
	} else {
		v.SetConfigName("config")
		v.SetConfigType("yaml")
		v.AddConfigPath(".")
		v.AddConfigPath("/etc/pg-s3-backup")
	}

	if err := v.ReadInConfig(); err != nil {
		var notFound viper.ConfigFileNotFoundError
		if !errors.As(err, &notFound) {
			return nil, fmt.Errorf("reading config file: %w", err)
		}
		// Missing config file is acceptable; env vars / defaults are used.
	}

	var cfg Config
	if err := v.Unmarshal(&cfg); err != nil {
		return nil, fmt.Errorf("unmarshalling config: %w", err)
	}

	if err := validate(&cfg); err != nil {
		return nil, err
	}

	return &cfg, nil
}

// setDefaults registers sensible default values.
func setDefaults(v *viper.Viper) {
	v.SetDefault("s3_prefix", "backups/")
	v.SetDefault("schedule", "0 2 * * *")
	v.SetDefault("retention_days", 30)
	v.SetDefault("log_level", "info")
}

// bindEnvVars maps BACKUP_* environment variables to viper keys.
func bindEnvVars(v *viper.Viper) {
	v.SetEnvPrefix("BACKUP")
	v.AutomaticEnv()
	// Replace dots and hyphens with underscores when looking up env vars.
	v.SetEnvKeyReplacer(strings.NewReplacer(".", "_", "-", "_"))

	// Explicitly bind each key so that AutomaticEnv works even when viper
	// has not seen the key via a config file yet.
	keys := []string{
		"database_dsn",
		"s3_bucket",
		"s3_region",
		"s3_prefix",
		"schedule",
		"retention_days",
		"log_level",
		"config_file",
	}
	for _, k := range keys {
		_ = v.BindEnv(k)
	}
}

// validate checks that all required fields are set and values are sane.
func validate(cfg *Config) error {
	var errs []string

	if strings.TrimSpace(cfg.DatabaseDSN) == "" {
		errs = append(errs, "database_dsn is required (env: BACKUP_DATABASE_DSN)")
	}

	if strings.TrimSpace(cfg.S3Bucket) == "" {
		errs = append(errs, "s3_bucket is required (env: BACKUP_S3_BUCKET)")
	}

	if strings.TrimSpace(cfg.S3Region) == "" {
		errs = append(errs, "s3_region is required (env: BACKUP_S3_REGION)")
	}

	if strings.TrimSpace(cfg.Schedule) == "" {
		errs = append(errs, "schedule must not be empty")
	}

	if cfg.RetentionDays <= 0 {
		errs = append(errs, fmt.Sprintf("retention_days must be a positive integer, got %d", cfg.RetentionDays))
	}

	validLevels := map[string]bool{
		"trace": true, "debug": true, "info": true,
		"warn": true, "error": true, "fatal": true, "panic": true,
	}
	if !validLevels[strings.ToLower(cfg.LogLevel)] {
		errs = append(errs, fmt.Sprintf("log_level %q is not valid; choose one of: trace, debug, info, warn, error, fatal, panic", cfg.LogLevel))
	}

	if len(errs) > 0 {
		return fmt.Errorf("configuration errors:\n  - %s", strings.Join(errs, "\n  - "))
	}

	return nil
}