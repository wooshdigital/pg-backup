package main

import (
	"os"

	"github.com/org/pg-s3-backup/internal/config"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func main() {
	// Bootstrap a console logger for startup; will be replaced after config loads.
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr, TimeFormat: "15:04:05"})

	log.Info().Msg("pg-s3-backup starting up…")

	cfg, err := config.Load()
	if err != nil {
		log.Fatal().Err(err).Msg("failed to load configuration")
	}

	// Re-initialise logger using the configured log level.
	level, err := zerolog.ParseLevel(cfg.LogLevel)
	if err != nil {
		log.Warn().Str("log_level", cfg.LogLevel).Msg("unknown log level; defaulting to info")
		level = zerolog.InfoLevel
	}
	zerolog.SetGlobalLevel(level)

	log.Info().
		Str("db_dsn_masked", maskDSN(cfg.DatabaseDSN)).
		Str("s3_bucket", cfg.S3Bucket).
		Str("s3_region", cfg.S3Region).
		Str("s3_prefix", cfg.S3Prefix).
		Str("schedule", cfg.Schedule).
		Int("retention_days", cfg.RetentionDays).
		Str("log_level", cfg.LogLevel).
		Msg("configuration loaded successfully")

	log.Info().Msg("startup complete — ready to schedule backups")
	os.Exit(0)
}

// maskDSN replaces the password portion of a DSN with ***
// to avoid leaking credentials in logs.
func maskDSN(dsn string) string {
	if dsn == "" {
		return "<not set>"
	}
	// Simple heuristic: return a fixed mask so the DSN is never logged verbatim.
	return "postgres://***@***/***"
}