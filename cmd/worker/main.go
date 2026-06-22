package main

import (
	"os"
	"time"

	"github.com/org/pg-s3-backup/internal/config"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func main() {
	// Bootstrap a console logger for startup; will be replaced after config load.
	log.Logger = zerolog.New(zerolog.ConsoleWriter{Out: os.Stderr, TimeFormat: time.RFC3339}).
		With().
		Timestamp().
		Str("service", "pg-s3-backup").
		Logger()

	log.Info().Msg("pg-s3-backup starting up")

	cfg, err := config.Load()
	if err != nil {
		log.Fatal().Err(err).Msg("failed to load configuration")
	}

	// Re-initialise logger with the configured log level.
	level, err := zerolog.ParseLevel(cfg.LogLevel)
	if err != nil {
		log.Warn().Str("log_level", cfg.LogLevel).Msg("unknown log level, defaulting to info")
		level = zerolog.InfoLevel
	}

	log.Logger = zerolog.New(zerolog.ConsoleWriter{Out: os.Stderr, TimeFormat: time.RFC3339}).
		Level(level).
		With().
		Timestamp().
		Str("service", "pg-s3-backup").
		Logger()

	printStartupBanner(cfg)

	log.Info().Msg("configuration validated — ready to run")
	os.Exit(0)
}

// printStartupBanner logs a structured summary of the active configuration.
// Sensitive values (DSN) are redacted.
func printStartupBanner(cfg *config.Config) {
	log.Info().
		Str("db_dsn", redact(cfg.DatabaseDSN)).
		Str("s3_bucket", cfg.S3Bucket).
		Str("s3_region", cfg.S3Region).
		Str("s3_prefix", cfg.S3Prefix).
		Str("schedule", cfg.Schedule).
		Int("retention_days", cfg.RetentionDays).
		Str("log_level", cfg.LogLevel).
		Msg("active configuration")
}

// redact replaces all but the scheme of a DSN with asterisks to avoid
// leaking credentials into logs.
func redact(dsn string) string {
	if dsn == "" {
		return "<not set>"
	}
	// Show only that a value is present.
	return "***redacted***"
}