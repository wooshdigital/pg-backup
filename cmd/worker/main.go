package main

import (
	"os"

	"github.com/org/pg-s3-backup/internal/config"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

const banner = `
██████╗  ██████╗      ███████╗██████╗      ██████╗  █████╗  ██████╗██╗  ██╗██╗   ██╗██████╗
██╔══██╗██╔════╝      ██╔════╝╚════██╗     ██╔══██╗██╔══██╗██╔════╝██║ ██╔╝██║   ██║██╔══██╗
██████╔╝██║  ███╗     ███████╗ █████╔╝     ██████╔╝███████║██║     █████╔╝ ██║   ██║██████╔╝
██╔═══╝ ██║   ██║     ╚════██║ ╚═══██╗     ██╔══██╗██╔══██║██║     ██╔═██╗ ██║   ██║██╔═══╝
██║     ╚██████╔╝     ███████║██████╔╝     ██████╔╝██║  ██║╚██████╗██║  ██╗╚██████╔╝██║
╚═╝      ╚═════╝      ╚══════╝╚═════╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝
`

func main() {
	// Bootstrap a console logger for startup (before config is loaded)
	consoleWriter := zerolog.ConsoleWriter{Out: os.Stderr}
	bootstrapLog := zerolog.New(consoleWriter).With().Timestamp().Logger()

	bootstrapLog.Info().Msg("pg-s3-backup starting up...")

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		bootstrapLog.Fatal().Err(err).Msg("failed to load configuration")
	}

	// Configure the global logger based on the loaded config
	level, err := zerolog.ParseLevel(cfg.LogLevel)
	if err != nil {
		bootstrapLog.Warn().Str("log_level", cfg.LogLevel).Msg("invalid log level, defaulting to info")
		level = zerolog.InfoLevel
	}

	var logger zerolog.Logger
	if cfg.LogLevel == "debug" {
		// Pretty console output in debug mode
		logger = zerolog.New(zerolog.ConsoleWriter{Out: os.Stderr}).
			Level(level).
			With().
			Timestamp().
			Str("service", "pg-s3-backup").
			Logger()
	} else {
		// Structured JSON output for production
		logger = zerolog.New(os.Stderr).
			Level(level).
			With().
			Timestamp().
			Str("service", "pg-s3-backup").
			Logger()
	}

	// Replace the global logger
	log.Logger = logger

	// Print startup banner
	log.Info().Msg(banner)

	// Log configuration summary (masking sensitive fields)
	log.Info().
		Str("db_dsn", maskDSN(cfg.DatabaseDSN)).
		Str("s3_bucket", cfg.S3Bucket).
		Str("s3_region", cfg.S3Region).
		Str("s3_prefix", cfg.S3Prefix).
		Str("schedule", cfg.Schedule).
		Int("retention_days", cfg.RetentionDays).
		Str("log_level", cfg.LogLevel).
		Msg("configuration loaded successfully")

	log.Info().Msg("startup validation complete — ready to run")
	os.Exit(0)
}

// maskDSN masks the password in a PostgreSQL DSN for safe logging.
// It handles both URI (postgres://user:pass@host/db) and keyword formats.
func maskDSN(dsn string) string {
	if len(dsn) == 0 {
		return "<empty>"
	}
	// Simple masking: show only first 10 chars and mask the rest
	const maxVisible = 10
	if len(dsn) <= maxVisible {
		return "***"
	}
	return dsn[:maxVisible] + "***"
}