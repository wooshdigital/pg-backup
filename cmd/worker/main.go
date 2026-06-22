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
██████╔╝██║  ███╗█████╗███████╗ █████╔╝     ██████╔╝███████║██║     █████╔╝ ██║   ██║██████╔╝
██╔═══╝ ██║   ██║╚════╝╚════██║ ╚═══██╗     ██╔══██╗██╔══██║██║     ██╔═██╗ ██║   ██║██╔═══╝
██║     ╚██████╔╝      ███████║██████╔╝     ██████╔╝██║  ██║╚██████╗██║  ██╗╚██████╔╝██║
╚═╝      ╚═════╝       ╚══════╝╚═════╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝
`

func main() {
	// Bootstrap a console logger for startup before config is loaded
	consoleWriter := zerolog.ConsoleWriter{Out: os.Stderr, TimeFormat: "2006-01-02T15:04:05Z07:00"}
	bootstrapLogger := zerolog.New(consoleWriter).With().Timestamp().Logger()

	bootstrapLogger.Info().Msg("pg-s3-backup starting up...")

	// Load and validate configuration
	cfg, err := config.Load()
	if err != nil {
		bootstrapLogger.Fatal().Err(err).Msg("failed to load configuration")
	}

	// Configure the global logger based on config
	logger := setupLogger(cfg)

	// Print startup banner
	logger.Info().Msg(banner)

	// Log configuration summary
	logConfigSummary(logger, cfg)

	logger.Info().Msg("configuration validated successfully — ready to run")
	os.Exit(0)
}

// setupLogger configures zerolog based on the loaded config.
func setupLogger(cfg *config.Config) zerolog.Logger {
	level, err := zerolog.ParseLevel(cfg.LogLevel)
	if err != nil {
		level = zerolog.InfoLevel
	}

	zerolog.SetGlobalLevel(level)

	if cfg.LogLevel == "debug" || cfg.LogLevel == "trace" {
		// Pretty console output for development
		consoleWriter := zerolog.ConsoleWriter{Out: os.Stderr, TimeFormat: "2006-01-02T15:04:05Z07:00"}
		return zerolog.New(consoleWriter).With().Timestamp().Caller().Logger()
	}

	// Structured JSON for production
	return zerolog.New(os.Stderr).With().Timestamp().Logger()
}

// logConfigSummary logs a human-readable summary of the active configuration.
func logConfigSummary(logger zerolog.Logger, cfg *config.Config) {
	// Mask the DSN to avoid leaking credentials in logs
	maskedDSN := config.MaskDSN(cfg.DatabaseDSN)

	logger.Info().
		Str("database_dsn", maskedDSN).
		Str("s3_bucket", cfg.S3Bucket).
		Str("s3_region", cfg.S3Region).
		Str("s3_prefix", cfg.S3Prefix).
		Str("schedule", cfg.Schedule).
		Int("retention_days", cfg.RetentionDays).
		Str("log_level", cfg.LogLevel).
		Msg("active configuration")

	log.Logger = logger
}