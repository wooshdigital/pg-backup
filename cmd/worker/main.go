package main

import (
	"context"
	"log/slog"
	"os"

	"github.com/ssoready/conf/internal/backup"
	"github.com/ssoready/conf/internal/compress"
	"github.com/ssoready/conf/internal/config"
	"github.com/ssoready/conf/internal/dumper"
	"github.com/ssoready/conf/internal/storage"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
	slog.SetDefault(logger)

	ctx := context.Background()

	// Load configuration from file / env.
	cfg, err := config.Load()
	if err != nil {
		logger.ErrorContext(ctx, "config.load_failed", slog.String("error", err.Error()))
		os.Exit(1)
	}

	// Build dumper.
	d, err := dumper.New(cfg)
	if err != nil {
		logger.ErrorContext(ctx, "dumper.init_failed", slog.String("error", err.Error()))
		os.Exit(1)
	}

	// Build compressor.
	algo := cfg.Compression.Algorithm
	if algo == "" {
		algo = "gzip"
	}
	level := cfg.Compression.Level

	var c compress.Compressor
	if level > 0 {
		c, err = compress.NewFactory().CreateWithLevel(algo, level)
	} else {
		c, err = compress.NewFactory().Create(algo)
	}
	if err != nil {
		logger.ErrorContext(ctx, "compressor.init_failed", slog.String("error", err.Error()))
		os.Exit(1)
	}

	// Build storage backend.
	s, err := storage.New(ctx, cfg)
	if err != nil {
		logger.ErrorContext(ctx, "storage.init_failed", slog.String("error", err.Error()))
		os.Exit(1)
	}

	// Construct and run the backup job.
	job := &backup.Job{
		Dumper:       d,
		Compressor:   c,
		Storage:      s,
		Logger:       logger,
		StreamDirect: cfg.StreamDirect,
	}

	result := job.Run(ctx)
	if result.Err != nil {
		logger.ErrorContext(ctx, "backup.run_failed",
			slog.String("error", result.Err.Error()),
		)
		os.Exit(1)
	}

	logger.InfoContext(ctx, "backup.run_succeeded",
		slog.String("key", result.Key),
		slog.Int64("size_bytes", result.Size),
		slog.Duration("duration", result.Duration),
	)
}