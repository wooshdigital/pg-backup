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
	// Bootstrap a console logger for startup (before config is loaded)
	bootstrapLogger := zerolog.New(zerolog.ConsoleWriter{Out: os.Stderr}).
		With().
		Timestamp().
		Str("component", "bootstrap").
		Logger()

	bootstrapLogger.Info().Msg("Starting pg-s3-backup worker")

	// Load and validate configuration
	cfg, err := config.Load()
	if err != nil {
		bootstrapLogger.Fatal().Err(err).Msg("Failed to load configuration")
	}

	// Set up the real logger based on config
	logger := buildLogger(cfg)

	// Print startup banner and config summary
	logger.Info().Msg(banner)
	logger.Info().
		Str("db_dsn", maskDSN(cfg.DatabaseDSN)).
		Str("s3_bucket", cfg.S3Bucket).
		Str("s3_region", cfg.S3Region).
		Str("s3_prefix", cfg.S3Prefix).
		Str("schedule", cfg.Schedule).
		Int("retention_days", cfg.RetentionDays).
		Str("log_level", cfg.LogLevel).
		Msg("Configuration loaded successfully")

	logger.Info().Msg("Worker initialised — ready to run scheduled backups")
	os.Exit(0)
}

// buildLogger constructs a zerolog.Logger from the loaded config.
func buildLogger(cfg *config.Config) zerolog.Logger {
	level, err := zerolog.ParseLevel(cfg.LogLevel)
	if err != nil {
		level = zerolog.InfoLevel
	}
	zerolog.SetGlobalLevel(level)

	// Use pretty console output for non-production log levels, JSON otherwise
	if level <= zerolog.DebugLevel {
		return zerolog.New(zerolog.ConsoleWriter{Out: os.Stdout}).
			With().
			Timestamp().
			Str("service", "pg-s3-backup").
			Logger()
	}

	return zerolog.New(os.Stdout).
		With().
		Timestamp().
		Str("service", "pg-s3-backup").
		Logger()
}

// maskDSN replaces the password portion of a DSN string with asterisks so it
// is safe to log.
func maskDSN(dsn string) string {
	if dsn == "" {
		return ""
	}
	// Simple heuristic: show only the host/db portion after '@', or mask entirely
	for i, ch := range dsn {
		if ch == '@' {
			// Find scheme prefix up to "://"
			schemeEnd := 0
			for j := 0; j < i; j++ {
				if dsn[j] == ':' && j+2 < len(dsn) && dsn[j+1] == '/' && dsn[j+2] == '/' {
					schemeEnd = j + 3
					break
				}
			}
			return dsn[:schemeEnd] + "****:****" + dsn[i:]
		}
	}
	return "****"
}