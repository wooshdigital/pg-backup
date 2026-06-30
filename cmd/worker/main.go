package main

import (
	"context"
	"log/slog"
	"os"

	"github.com/sdreger/cmd-worker/internal/backup"
	"github.com/sdreger/cmd-worker/internal/compress"
	"github.com/sdreger/cmd-worker/internal/config"
	"github.com/sdreger/cmd-worker/internal/dumper"
	"github.com/sdreger/cmd-worker/internal/storage"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
	slog.SetDefault(logger)

	ctx := context.Background()

	// Load configuration
	cfg, err := config.Load("config.yaml")
	if err != nil {
		logger.ErrorContext(ctx, "failed to load config", slog.String("error", err.Error()))
		os.Exit(1)
	}

	// Build dumper
	d, err := dumper.New(cfg.Database.DSN)
	if err != nil {
		logger.ErrorContext(ctx, "failed to create dumper", slog.String("error", err.Error()))
		os.Exit(1)
	}

	// Build compressor
	c, err := compress.New(cfg.Compress.Algorithm)
	if err != nil {
		logger.ErrorContext(ctx, "failed to create compressor", slog.String("error", err.Error()))
		os.Exit(1)
	}

	// Build storage backend
	s3Backend, err := storage.NewS3Backend(ctx, cfg.Storage.Bucket, cfg.Storage.Region, cfg.Storage.Endpoint)
	if err != nil {
		logger.ErrorContext(ctx, "failed to create storage backend", slog.String("error", err.Error()))
		os.Exit(1)
	}

	// Ensure the destination bucket exists
	if err = s3Backend.EnsureBucket(ctx); err != nil {
		logger.ErrorContext(ctx, "failed to ensure bucket exists", slog.String("error", err.Error()))
		os.Exit(1)
	}

	// Build and run the backup job
	job := &backup.Job{
		Dumper:       d,
		Compressor:   c,
		Storage:      s3Backend,
		StreamDirect: cfg.Backup.StreamDirect,
		Logger:       logger,
	}

	result := job.Run(ctx)
	if result.Err != nil {
		logger.ErrorContext(ctx, "backup failed",
			slog.String("error", result.Err.Error()),
		)
		os.Exit(1)
	}

	logger.InfoContext(ctx, "backup succeeded",
		slog.String("key", result.Key),
		slog.Int64("size_bytes", result.Size),
		slog.Duration("duration", result.Duration),
	)
}