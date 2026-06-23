// Command worker is the main entry point for the pgdumper worker process.
// It reads a configuration file and runs pg_dump, streaming the output to a
// local file.
package main

import (
	"context"
	"flag"
	"fmt"
	"log/slog"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	"github.com/yourorg/pgdumper/internal/config"
	"github.com/yourorg/pgdumper/internal/dumper"
	"github.com/yourorg/pgdumper/internal/tempfile"
)

func main() {
	cfgPath := flag.String("config", "config.yaml", "path to configuration file")
	flag.Parse()

	logger := slog.New(slog.NewTextHandler(os.Stderr, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))

	if err := run(*cfgPath, logger); err != nil {
		logger.Error("fatal error", "error", err)
		os.Exit(1)
	}
}

func run(cfgPath string, logger *slog.Logger) error {
	cfg, err := config.Load(cfgPath)
	if err != nil {
		return fmt.Errorf("loading config: %w", err)
	}

	// Ensure output directory exists.
	if err := os.MkdirAll(cfg.OutputDir, 0o750); err != nil {
		return fmt.Errorf("creating output dir %q: %w", cfg.OutputDir, err)
	}

	// Handle graceful shutdown.
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	return doDump(ctx, cfg, logger)
}

func doDump(ctx context.Context, cfg *config.Config, logger *slog.Logger) error {
	// Create a temp file in the output directory. We'll rename it on success
	// to ensure we never leave a partial dump with the final name.
	tf, err := tempfile.NewInDir(cfg.OutputDir, "pgdump-inprogress-*.tmp")
	if err != nil {
		return fmt.Errorf("creating temp file: %w", err)
	}
	// Clean up temp file if we don't make it to the rename step.
	success := false
	defer func() {
		if !success {
			tf.CleanupWithLog(func(msg string) { logger.Warn(msg) })
		}
	}()

	opts := []dumper.Option{
		dumper.WithExtraArgs(cfg.PgDump.ExtraArgs...),
	}
	if cfg.PgDump.BinaryPath != "" {
		opts = append(opts, dumper.WithPgDumpPath(cfg.PgDump.BinaryPath))
	}
	if cfg.PgDump.Format != "" {
		opts = append(opts, dumper.WithExtraArgs("--format="+cfg.PgDump.Format))
	}

	d := dumper.NewPgDumper(opts...)

	logger.Info("starting dump", "dsn_host", dsnHost(cfg.DSN))

	result, err := d.Dump(ctx, cfg.DSN, tf.File())
	if err != nil {
		return fmt.Errorf("dump failed: %w", err)
	}

	if err := tf.File().Sync(); err != nil {
		return fmt.Errorf("syncing dump file: %w", err)
	}

	finalName := filepath.Join(cfg.OutputDir, dumpFileName())
	if err := os.Rename(tf.Name(), finalName); err != nil {
		return fmt.Errorf("renaming dump file to %q: %w", finalName, err)
	}
	success = true

	logger.Info("dump complete",
		"file", finalName,
		"bytes", result.BytesWritten,
		"duration", result.Duration,
	)
	return nil
}

// dumpFileName returns a timestamped file name for the dump.
func dumpFileName() string {
	return fmt.Sprintf("pgdump-%s.dump", time.Now().UTC().Format("2006-01-02T15-04-05Z"))
}

// dsnHost extracts a safe-to-log host identifier from a DSN string.
// This avoids logging credentials.
func dsnHost(dsn string) string {
	p, err := dumper.ParseDSN(dsn)
	if err != nil {
		return "(unknown)"
	}
	return fmt.Sprintf("%s:%d", p.Host, p.Port)
}