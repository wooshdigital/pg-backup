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
	// Bootstrap a console logger for startup (before config is loaded).
	bootstrapLogger := log.Output(zerolog.ConsoleWriter{Out: os.Stderr})
	bootstrapLogger.Info().Msg("pg-s3-backup starting up")

	// Load and validate configuration.
	cfg, err := config.Load()
	if err != nil {
		bootstrapLogger.Fatal().Err(err).Msg("failed to load configuration")
	}

	// Configure the global logger based on the loaded config.
	logger := setupLogger(cfg)

	// Print startup banner and config summary.
	logger.Info().Msg(banner)
	logger.Info().
		Str("db_dsn_masked", maskDSN(cfg.DBDSN)).
		Str("s3_bucket", cfg.S3Bucket).
		Str("s3_region", cfg.S3Region).
		Str("s3_prefix", cfg.S3Prefix).
		Str("schedule", cfg.Schedule).
		Int("retention_days", cfg.RetentionDays).
		Str("log_level", cfg.LogLevel).
		Msg("configuration loaded successfully")

	logger.Info().Msg("initialization complete — ready to run backup jobs")
	os.Exit(0)
}

// setupLogger creates a zerolog logger configured according to cfg.
func setupLogger(cfg *config.Config) zerolog.Logger {
	level, err := zerolog.ParseLevel(cfg.LogLevel)
	if err != nil {
		level = zerolog.InfoLevel
	}
	zerolog.SetGlobalLevel(level)

	return zerolog.New(os.Stdout).With().Timestamp().Logger()
}

// maskDSN returns the DSN with the password replaced by "***" for safe logging.
func maskDSN(dsn string) string {
	if dsn == "" {
		return ""
	}
	// Simple masking: replace everything between :// and @ with masked credentials.
	// For a production system you'd use url.Parse; this is intentionally simple.
	masked := dsn
	// Find password segment between : and @ in user:pass@host form.
	for i := 0; i < len(masked); i++ {
		if masked[i] == ':' && i+1 < len(masked) {
			// Look for the @ after this colon.
			for j := i + 1; j < len(masked); j++ {
				if masked[j] == '@' {
					masked = masked[:i+1] + "***" + masked[j:]
					return masked
				}
			}
		}
	}
	return masked
}