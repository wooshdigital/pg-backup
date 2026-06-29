package main

import (
	"context"
	"log/slog"
	"os"
	"os/signal"
	"syscall"

	"github.com/smnzlnsk/backup-worker/internal/backup"
	"github.com/smnzlnsk/backup-worker/internal/compress"
	"github.com/smnzlnsk/backup-worker/internal/config"
	"github.com/smnzlnsk/backup-worker/internal/dumper"
	"github.com/smnzlnsk/backup-worker/internal/storage"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
	slog.SetDefault(logger)

	cfg, err := config.Load()
	if err != nil {
		logger.Error("failed to load config", "error", err)
		os.Exit(1)
	}

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	// Build dumper
	d, err := dumper.New(dumper.Config{DSN: cfg.Database.DSN})
	if err != nil {
		logger.Error("failed to create dumper", "error", err)
		os.Exit(1)
	}

	// Build compressor
	factory := compress.NewFactory()
	c, err := factory.Get(cfg.Compress.Algorithm)
	if err != nil {
		logger.Error("failed to create compressor", "error", err)
		os.Exit(1)
	}

	// Build storage backend
	s3Cfg := storage.S3Config{
		Bucket:          cfg.Storage.Bucket,
		Region:          cfg.Storage.Region,
		Endpoint:        cfg.Storage.Endpoint,
		AccessKeyID:     cfg.Storage.AccessKeyID,
		SecretAccessKey: cfg.Storage.SecretAccessKey,
		ForcePathStyle:  cfg.Storage.ForcePathStyle,
	}
	s3Backend, err := storage.NewS3(ctx, s3Cfg)
	if err != nil {
		logger.Error("failed to create S3 backend", "error", err)
		os.Exit(1)
	}

	// Ensure bucket exists
	if err := s3Backend.EnsureBucket(ctx); err != nil {
		logger.Error("failed to ensure S3 bucket", "error", err)
		os.Exit(1)
	}

	// Build and run backup job
	job := &backup.Job{
		Dumper:       d,
		Compressor:   c,
		Storage:      s3Backend,
		StreamDirect: cfg.Backup.StreamDirect,
		Logger:       logger,
	}

	logger.Info("starting backup job", "stream_direct", cfg.Backup.StreamDirect)

	result := job.Run(ctx)
	if result.Err != nil {
		logger.Error("backup job failed",
			"error", result.Err,
			"duration", result.Duration,
		)
		os.Exit(1)
	}

	logger.Info("backup job succeeded",
		"key", result.Key,
		"size_bytes", result.Size,
		"duration", result.Duration,
	)
}