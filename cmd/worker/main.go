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
	// Bootstrap a console logger for startup; will reconfigure after config is loaded.
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})

	cfg, err := config.Load()
	if err != nil {
		log.Fatal().Err(err).Msg("failed to load configuration")
	}

	// Reconfigure logger based on loaded config.
	level, err := zerolog.ParseLevel(cfg.LogLevel)
	if err != nil {
		log.Warn().Str("log_level", cfg.LogLevel).Msg("unknown log level, defaulting to info")
		level = zerolog.InfoLevel
	}
	zerolog.SetGlobalLevel(level)

	// In production emit JSON; keep pretty console output when a terminal is attached.
	if isTerminal() {
		log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})
	} else {
		log.Logger = zerolog.New(os.Stderr).With().Timestamp().Logger()
	}

	// Print ASCII banner to stderr (non-structured, for human operators).
	_, _ = os.Stderr.WriteString(banner + "\n")

	log.Info().
		Str("db_dsn", maskDSN(cfg.DatabaseDSN)).
		Str("s3_bucket", cfg.S3Bucket).
		Str("s3_region", cfg.S3Region).
		Str("s3_prefix", cfg.S3Prefix).
		Str("schedule", cfg.Schedule).
		Int("retention_days", cfg.RetentionDays).
		Str("log_level", cfg.LogLevel).
		Msg("pg-s3-backup started — configuration loaded successfully")

	os.Exit(0)
}

// isTerminal reports whether stderr is an interactive terminal.
func isTerminal() bool {
	fi, err := os.Stderr.Stat()
	if err != nil {
		return false
	}
	return (fi.Mode() & os.ModeCharDevice) != 0
}

// maskDSN replaces the password portion of a DSN with asterisks so it is safe
// to log.  If the DSN cannot be parsed it returns a fixed placeholder.
func maskDSN(dsn string) string {
	// Very simple masking: hide everything after the last '@' sign is kept,
	// the credentials before it are replaced.
	for i := len(dsn) - 1; i >= 0; i-- {
		if dsn[i] == '@' {
			return "***@" + dsn[i+1:]
		}
	}
	// No '@' found — could be a keyword=value style DSN; return as-is
	// (passwords in keyword DSNs are harder to extract and less common in logs).
	return dsn
}