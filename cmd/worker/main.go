package main

import (
	"context"
	"log/slog"
	"os"
	"time"

	"github.com/sgorgun/go-backup/internal/backup"
	"github.com/sgorgun/go-backup/internal/compress"
	"github.com/sgorgun/go-backup/internal/config"
	"github.com/sgorgun/go-backup/internal/dumper"
	"github.com/sgorgun/go-backup/internal/storage"
)

func main() {
	// Structured JSON logging.
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelDebug,
	}))
	slog.SetDefault(logger)

	slog.Info("backup worker starting")

	// Load configuration.
	cfg, err := config.Load()
	if err != nil {
		slog.Error("failed to load config", "error", err)
		os.Exit(1)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Minute)
	defer cancel()

	// Build the dumper.
	d, err := dumper.New(cfg.Database.DSN)
	if err != nil {
		slog.Error("failed to create dumper", "error", err)
		os.Exit(1)
	}

	// Build the compressor.
	factory := compress.NewFactory()
	c, err := factory.Create(cfg.Compression.Algorithm)
	if err != nil {
		slog.Error("failed to create compressor", "error", err, "algorithm", cfg.Compression.Algorithm)
		os.Exit(1)
	}

	// Build the storage backend.
	s3cfg := storage.S3Config{
		Bucket:          cfg.Storage.Bucket,
		Region:          cfg.Storage.Region,
		Endpoint:        cfg.Storage.Endpoint,
		ForcePathStyle:  cfg.Storage.ForcePathStyle,
		AccessKeyID:     cfg.Storage.AccessKeyID,
		SecretAccessKey: cfg.Storage.SecretAccessKey,
	}
	st, err := storage.NewS3(ctx, s3cfg)
	if err != nil {
		slog.Error("failed to create storage backend", "error", err)
		os.Exit(1)
	}

	// Ensure the bucket exists.
	if err := st.EnsureBucket(ctx); err != nil {
		slog.Warn("could not ensure bucket exists", "error", err)
	}

	// Construct and run the backup job.
	job := &backup.Job{
		Dumper:       d,
		Compressor:   c,
		Storage:      st,
		StreamDirect: cfg.Backup.StreamDirect,
	}

	slog.Info("running backup job", "stream_direct", cfg.Backup.StreamDirect)
	result := job.Run(ctx)

	if result.Err != nil {
		slog.Error("backup job failed",
			"error", result.Err,
			"duration_ms", result.Duration.Milliseconds(),
		)
		os.Exit(1)
	}

	slog.Info("backup job succeeded",
		"key", result.Key,
		"size_bytes", result.Size,
		"duration_ms", result.Duration.Milliseconds(),
	)
}