package main

import (
	"os"

	"github.com/org/pg-s3-backup/internal/config"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

const banner = `
██████╗  ██████╗       ███████╗██████╗      ██████╗  █████╗  ██████╗██╗  ██╗██╗   ██╗██████╗
██╔══██╗██╔════╝       ██╔════╝╚════██╗     ██╔══██╗██╔══██╗██╔════╝██║ ██╔╝██║   ██║██╔══██╗
██████╔╝██║  ███╗      ███████╗ █████╔╝     ██████╔╝███████║██║     █████╔╝ ██║   ██║██████╔╝
██╔═══╝ ██║   ██║      ╚════██║ ╚═══██╗     ██╔══██╗██╔══██║██║     ██╔═██╗ ██║   ██║██╔═══╝
██║     ╚██████╔╝      ███████║██████╔╝     ██████╔╝██║  ██║╚██████╗██║  ██╗╚██████╔╝██║
╚═╝      ╚═════╝       ╚══════╝╚═════╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝
`

func main() {
	// Bootstrap a temporary console logger for startup
	bootstrapLogger := zerolog.New(zerolog.ConsoleWriter{Out: os.Stderr}).
		With().
		Timestamp().
		Logger()

	bootstrapLogger.Info().Msg("pg-s3-backup starting up...")

	// Load and validate configuration
	cfg, err := config.Load()
	if err != nil {
		bootstrapLogger.Fatal().Err(err).Msg("Failed to load configuration")
	}

	// Set up the real logger based on configured log level
	logger := setupLogger(cfg)

	// Print ASCII banner (only at debug or info level)
	if cfg.LogLevel != "warn" && cfg.LogLevel != "error" {
		log.Logger = logger
		logger.Info().Msg(banner)
	}

	// Log startup summary
	logger.Info().
		Str("db_dsn_masked", maskDSN(cfg.DatabaseDSN)).
		Str("s3_bucket", cfg.S3Bucket).
		Str("s3_region", cfg.S3Region).
		Str("s3_prefix", cfg.S3Prefix).
		Str("schedule", cfg.Schedule).
		Int("retention_days", cfg.RetentionDays).
		Str("log_level", cfg.LogLevel).
		Msg("Configuration loaded successfully")

	logger.Info().Msg("pg-s3-backup initialized — ready to run scheduled backups")
	os.Exit(0)
}

// setupLogger creates a zerolog logger based on the configured log level.
func setupLogger(cfg *config.Config) zerolog.Logger {
	// Parse log level
	level, err := zerolog.ParseLevel(cfg.LogLevel)
	if err != nil {
		level = zerolog.InfoLevel
	}
	zerolog.SetGlobalLevel(level)

	// Use JSON output for production, pretty console for development
	if cfg.LogLevel == "debug" {
		return zerolog.New(zerolog.ConsoleWriter{Out: os.Stderr}).
			With().
			Timestamp().
			Caller().
			Logger()
	}

	return zerolog.New(os.Stderr).
		With().
		Timestamp().
		Str("service", "pg-s3-backup").
		Logger()
}

// maskDSN masks the password portion of a DSN for safe logging.
func maskDSN(dsn string) string {
	if len(dsn) == 0 {
		return "<empty>"
	}
	// Return a fixed mask — do not log actual credentials
	return "postgres://****:****@<host>/<db>"
}