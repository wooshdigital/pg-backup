package config

import (
	"errors"
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

	// S3Prefix is an optional prefix (folder path) within the bucket.
	S3Prefix string `mapstructure:"s3_prefix"`

	// Schedule is a cron expression defining when backups run.
	// Example: "0 2 * * *" (every day at 2am UTC)
	Schedule string `mapstructure:"schedule"`

	// RetentionDays is the number of days to keep backups before pruning.
	RetentionDays int `mapstructure:"retention_days"`

	// LogLevel controls zerolog verbosity: trace, debug, info, warn, error, fatal, panic.
	LogLevel string `mapstructure:"log_level"`
}

// Load reads configuration from (in order of increasing precedence):
//  1. Built-in defaults
//  2. config.yaml in the current directory (if present)
//  3. Environment variables prefixed with BACKUP_ (e.g. BACKUP_DATABASE_DSN)
//
// After loading, it validates the resulting config and returns an error if
// required fields are missing or values are out of range.
func Load() (*Config, error) {
	v := viper.New()
	return LoadWithViper(v)
}

// LoadWithViper allows injecting a pre-configured Viper instance (useful for testing).
func LoadWithViper(v *viper.Viper) (*Config, error) {
	setDefaults(v)
	configureEnvVars(v)
	readConfigFile(v)

	var cfg Config
	if err := v.Unmarshal(&cfg); err != nil {
		return nil, fmt.Errorf("unmarshal config: %w", err)
	}

	if err := validate(&cfg); err != nil {
		return nil, fmt.Errorf("config validation: %w", err)
	}

	return &cfg, nil
}

// setDefaults populates sensible defaults for optional config keys.
func setDefaults(v *viper.Viper) {
	v.SetDefault("s3_prefix", "backups/")
	v.SetDefault("schedule", "0 2 * * *")
	v.SetDefault("retention_days", 30)
	v.SetDefault("log_level", "info")
	v.SetDefault("s3_region", "us-east-1")
}

// configureEnvVars sets up automatic environment variable binding.
// All env vars must be prefixed with BACKUP_ and use underscores.
// Examples:
//
//	BACKUP_DATABASE_DSN   → database_dsn
//	BACKUP_S3_BUCKET      → s3_bucket
//	BACKUP_S3_REGION      → s3_region
//	BACKUP_S3_PREFIX      → s3_prefix
//	BACKUP_SCHEDULE       → schedule
//	BACKUP_RETENTION_DAYS → retention_days
//	BACKUP_LOG_LEVEL      → log_level
func configureEnvVars(v *viper.Viper) {
	v.SetEnvPrefix("BACKUP")
	v.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	v.AutomaticEnv()

	// Explicitly bind each key so that Viper picks them up even when no
	// default or config-file value exists for that key.
	_ = v.BindEnv("database_dsn", "BACKUP_DATABASE_DSN")
	_ = v.BindEnv("s3_bucket", "BACKUP_S3_BUCKET")
	_ = v.BindEnv("s3_region", "BACKUP_S3_REGION")
	_ = v.BindEnv("s3_prefix", "BACKUP_S3_PREFIX")
	_ = v.BindEnv("schedule", "BACKUP_SCHEDULE")
	_ = v.BindEnv("retention_days", "BACKUP_RETENTION_DAYS")
	_ = v.BindEnv("log_level", "BACKUP_LOG_LEVEL")
}

// readConfigFile attempts to read config.yaml from the current directory.
// Failure to find the file is silently ignored; other read errors are logged
// but do not abort startup (env vars alone are sufficient).
func readConfigFile(v *viper.Viper) {
	v.SetConfigName("config")
	v.SetConfigType("yaml")
	v.AddConfigPath(".")
	v.AddConfigPath("/etc/pg-s3-backup/")

	// Intentionally ignore "config file not found" errors — the file is optional.
	if err := v.ReadInConfig(); err != nil {
		var notFound viper.ConfigFileNotFoundError
		if !errors.As(err, &notFound) {
			// Log to stderr; we don't have a logger yet at this stage.
			fmt.Printf("warning: could not read config file: %v\n", err)
		}
	}
}

// validate checks that all required fields are present and values are sane.
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
		errs = append(errs, fmt.Sprintf("retention_days must be >= 1, got %d", cfg.RetentionDays))
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
		return fmt.Errorf("found %d configuration error(s):\n  - %s", len(errs), strings.Join(errs, "\n  - "))
	}

	return nil
}