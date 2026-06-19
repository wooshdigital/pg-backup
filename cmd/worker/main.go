package main

import (
	"os"
	"time"

	"github.com/org/pg-s3-backup/internal/config"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

const banner = `
██████╗  ██████╗       ███████╗██████╗      ██████╗  █████╗  ██████╗██╗  ██╗██╗   ██╗██████╗
██╔══██╗██╔════╝       ██╔════╝╚════██╗     ██╔══██╗██╔══██╗██╔════╝██║ ██╔╝██║   ██║██╔══██╗
██████╔╝██║  ███╗█████╗███████╗ █████╔╝     ██████╔╝███████║██║     █████╔╝ ██║   ██║██████╔╝
██╔═══╝ ██║   ██║╚════╝╚════██║ ╚═══██╗     ██╔══██╗██╔══██║██║     ██╔═██╗ ██║   ██║██╔═══╝
██║     ╚██████╔╝      ███████║██████╔╝     ██████╔╝██║  ██║╚██████╗██║  ██╗╚██████╔╝██║
╚═╝      ╚═════╝       ╚══════╝╚═════╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝
`

func main() {
	// Bootstrap a temporary console logger for startup
	consoleWriter := zerolog.ConsoleWriter{Out: os.Stderr, TimeFormat: time.RFC3339}
	bootstrapLog := zerolog.New(consoleWriter).With().Timestamp().Str("component", "startup").Logger()

	bootstrapLog.Info().Msg("Loading configuration...")

	cfg, err := config.Load()
	if err != nil {
		bootstrapLog.Fatal().Err(err).Msg("Failed to load configuration")
	}

	// Configure the global logger based on loaded config
	level, err := zerolog.ParseLevel(cfg.LogLevel)
	if err != nil {
		bootstrapLog.Warn().
			Str("provided_level", cfg.LogLevel).
			Msg("Invalid log level, defaulting to 'info'")
		level = zerolog.InfoLevel
	}

	zerolog.SetGlobalLevel(level)

	var logger zerolog.Logger
	if cfg.LogLevel == "debug" {
		// Pretty console output in debug mode
		logger = zerolog.New(consoleWriter).With().Timestamp().Logger()
	} else {
		// Structured JSON logging in production
		logger = zerolog.New(os.Stdout).With().Timestamp().Logger()
	}

	log.Logger = logger

	// Print startup banner
	logger.Info().Msg(banner)
	logger.Info().Msg("pg-s3-backup worker starting up")

	// Log configuration summary (masking sensitive values)
	logger.Info().
		Str("db_dsn", maskDSN(cfg.DatabaseDSN)).
		Str("s3_bucket", cfg.S3Bucket).
		Str("s3_region", cfg.S3Region).
		Str("s3_prefix", cfg.S3Prefix).
		Str("schedule", cfg.Schedule).
		Int("retention_days", cfg.RetentionDays).
		Str("log_level", cfg.LogLevel).
		Msg("Configuration loaded successfully")

	logger.Info().Msg("Startup complete — worker is ready (no scheduler wired yet, exiting cleanly)")
	os.Exit(0)
}

// maskDSN replaces the password portion of a DSN with asterisks for safe logging.
func maskDSN(dsn string) string {
	if dsn == "" {
		return "<not set>"
	}
	// Simple masking: show only the first 8 chars if DSN is long enough
	if len(dsn) <= 8 {
		return "***"
	}
	return dsn[:8] + "***"
}