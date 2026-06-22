package config

import (
	"fmt"
	"strings"

	"github.com/spf13/viper"
)

// Config holds all application configuration values.
type Config struct {
	// DatabaseDSN is the PostgreSQL connection string.
	// Format: postgres://user:password@host:port/dbname?sslmode=disable
	DatabaseDSN string `mapstructure:"database_dsn"`

	// S3Bucket is the name of the S3 bucket to store backups in.
	S3Bucket string `mapstructure:"s3_bucket"`

	// S3Region is the AWS region where the S3 bucket resides.
	S3Region string `mapstructure:"s3_region"`

	// S3Prefix is the optional key prefix (folder path) within the S3 bucket.
	S3Prefix string `mapstructure:"s3_prefix"`

	// Schedule is a cron expression defining the backup frequency.
	// Example: "0 2 * * *" (daily at 2 AM UTC)
	Schedule string `mapstructure:"schedule"`

	// RetentionDays is the number of days to keep backups before automatic deletion.
	RetentionDays int `mapstructure:"retention_days"`

	// LogLevel controls verbosity. Valid values: debug, info, warn, error.
	LogLevel string `mapstructure:"log_level"`
}

// Load reads configuration from the following sources (in order of precedence, highest first):
//  1. Environment variables (prefixed with PG_S3_BACKUP_, e.g. PG_S3_BACKUP_DATABASE_DSN)
//  2. Config file (config.yaml in the current directory, or path set via CONFIG_FILE env var)
//  3. Default values
//
// Returns a fully validated Config or an error describing what is missing/invalid.
func Load() (*Config, error) {
	v := viper.New()

	// --- Defaults ---
	v.SetDefault("s3_prefix", "backups/")
	v.SetDefault("schedule", "0 2 * * *")
	v.SetDefault("retention_days", 30)
	v.SetDefault("log_level", "info")

	// --- Config file ---
	v.SetConfigName("config")
	v.SetConfigType("yaml")
	v.AddConfigPath(".")
	v.AddConfigPath("/etc/pg-s3-backup/")

	if err := v.ReadInConfig(); err != nil {
		// It's okay if no config file is found — env vars can supply everything.
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return nil, fmt.Errorf("error reading config file: %w", err)
		}
	}

	// --- Environment variables ---
	// Env vars take precedence over config file values.
	// They must be prefixed with PG_S3_BACKUP_ and use underscores.
	// Example: PG_S3_BACKUP_DATABASE_DSN, PG_S3_BACKUP_S3_BUCKET
	v.SetEnvPrefix("PG_S3_BACKUP")
	v.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	v.AutomaticEnv()

	// Explicitly bind env vars for each key to ensure mapstructure works correctly
	envBindings := map[string]string{
		"database_dsn":   "PG_S3_BACKUP_DATABASE_DSN",
		"s3_bucket":      "PG_S3_BACKUP_S3_BUCKET",
		"s3_region":      "PG_S3_BACKUP_S3_REGION",
		"s3_prefix":      "PG_S3_BACKUP_S3_PREFIX",
		"schedule":       "PG_S3_BACKUP_SCHEDULE",
		"retention_days": "PG_S3_BACKUP_RETENTION_DAYS",
		"log_level":      "PG_S3_BACKUP_LOG_LEVEL",
	}
	for key, env := range envBindings {
		if err := v.BindEnv(key, env); err != nil {
			return nil, fmt.Errorf("failed to bind env var %s: %w", env, err)
		}
	}

	// --- Unmarshal into struct ---
	var cfg Config
	if err := v.Unmarshal(&cfg); err != nil {
		return nil, fmt.Errorf("failed to unmarshal config: %w", err)
	}

	// --- Validate ---
	if err := validate(&cfg); err != nil {
		return nil, err
	}

	return &cfg, nil
}

// validate checks that all required fields are present and that values are within
// acceptable ranges. Returns a combined error describing all validation failures.
func validate(cfg *Config) error {
	var errs []string

	if strings.TrimSpace(cfg.DatabaseDSN) == "" {
		errs = append(errs, "database_dsn is required (set PG_S3_BACKUP_DATABASE_DSN or database_dsn in config.yaml)")
	}

	if strings.TrimSpace(cfg.S3Bucket) == "" {
		errs = append(errs, "s3_bucket is required (set PG_S3_BACKUP_S3_BUCKET or s3_bucket in config.yaml)")
	}

	if strings.TrimSpace(cfg.S3Region) == "" {
		errs = append(errs, "s3_region is required (set PG_S3_BACKUP_S3_REGION or s3_region in config.yaml)")
	}

	if strings.TrimSpace(cfg.Schedule) == "" {
		errs = append(errs, "schedule must not be empty")
	}

	if cfg.RetentionDays < 1 {
		errs = append(errs, fmt.Sprintf("retention_days must be >= 1, got %d", cfg.RetentionDays))
	}

	validLogLevels := map[string]bool{
		"debug": true,
		"info":  true,
		"warn":  true,
		"error": true,
		"fatal": true,
		"panic": true,
	}
	if !validLogLevels[strings.ToLower(cfg.LogLevel)] {
		errs = append(errs, fmt.Sprintf(
			"log_level must be one of [debug, info, warn, error, fatal, panic], got %q",
			cfg.LogLevel,
		))
	}
	// Normalise to lowercase
	cfg.LogLevel = strings.ToLower(cfg.LogLevel)

	if len(errs) > 0 {
		return fmt.Errorf("configuration validation failed:\n  - %s", strings.Join(errs, "\n  - "))
	}

	return nil
}