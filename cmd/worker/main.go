package main

import (
	"context"
	"log/slog"
	"os"

	"github.com/smlgh/smarti/internal/backup"
	"github.com/smlgh/smarti/internal/compress"
	"github.com/smlgh/smarti/internal/config"
	"github.com/smlgh/smarti/internal/dumper"
	"github.com/smlgh/smarti/internal/storage"
)

func main() {
	log := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
	slog.SetDefault(log)

	cfg, err := config.Load()
	if err != nil {
		log.Error("failed to load config", "error", err)
		os.Exit(1)
	}

	ctx := context.Background()

	// Build dumper.
	d, err := dumper.New(cfg.Database.DSN)
	if err != nil {
		log.Error("failed to create dumper", "error", err)
		os.Exit(1)
	}

	// Build compressor.
	comp, err := compress.FromConfig(cfg.Compress)
	if err != nil {
		log.Error("failed to create compressor", "error", err)
		os.Exit(1)
	}

	// Build storage backend.
	s3, err := storage.NewS3(ctx, storage.S3Config{
		Endpoint:        cfg.Storage.Endpoint,
		Bucket:          cfg.Storage.Bucket,
		AccessKeyID:     cfg.Storage.AccessKeyID,
		SecretAccessKey: cfg.Storage.SecretAccessKey,
		Region:          cfg.Storage.Region,
		ForcePathStyle:  cfg.Storage.ForcePathStyle,
	})
	if err != nil {
		log.Error("failed to create S3 storage", "error", err)
		os.Exit(1)
	}

	// Determine the object key.
	key := storage.GenerateKey(cfg.Storage.KeyPrefix)

	// Construct and run the backup job (single run, no scheduling yet).
	job := &backup.Job{
		Dumper:       d,
		Compressor:   comp,
		Storage:      s3,
		StorageKey:   key,
		StreamDirect: cfg.StreamDirect,
		Logger:       log,
	}

	result := job.Run(ctx)
	if result.Err != nil {
		log.Error("backup failed", "error", result.Err)
		os.Exit(1)
	}

	log.Info("backup succeeded",
		"key", result.Key,
		"size_bytes", result.Size,
		"duration", result.Duration.String(),
	)
}