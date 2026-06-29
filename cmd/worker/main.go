package main

import (
	"context"
	"log/slog"
	"os"
	"time"

	"github.com/example/dbbackup/internal/backup"
	"github.com/example/dbbackup/internal/compress"
	"github.com/example/dbbackup/internal/config"
	"github.com/example/dbbackup/internal/dumper"
	"github.com/example/dbbackup/internal/storage"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelDebug,
	}))
	slog.SetDefault(logger)

	cfg, err := config.Load()
	if err != nil {
		logger.Error("failed to load config", "error", err)
		os.Exit(1)
	}

	ctx := context.Background()

	// Build dumper.
	d, err := dumper.New(cfg.Database.DSN)
	if err != nil {
		logger.Error("failed to create dumper", "error", err)
		os.Exit(1)
	}

	// Build compressor.
	c := compress.NewGzip(cfg.Compress.Level)

	// Build storage backend.
	s3cfg := storage.S3Config{
		Endpoint:        cfg.Storage.Endpoint,
		Bucket:          cfg.Storage.Bucket,
		Region:          cfg.Storage.Region,
		AccessKeyID:     cfg.Storage.AccessKeyID,
		SecretAccessKey: cfg.Storage.SecretAccessKey,
		ForcePathStyle:  cfg.Storage.ForcePathStyle,
	}
	s, err := storage.NewS3(ctx, s3cfg)
	if err != nil {
		logger.Error("failed to create storage backend", "error", err)
		os.Exit(1)
	}

	// Derive a storage key from the current timestamp.
	key := storageKey(cfg.Storage.KeyPrefix, c.Extension())

	job := &backup.Job{
		Dumper:       d,
		Compressor:   c,
		Storage:      s,
		StorageKey:   key,
		StreamDirect: cfg.StreamDirect,
		Logger:       logger,
	}

	logger.Info("starting backup", "key", key)
	result := job.Run(ctx)
	if result.Err != nil {
		logger.Error("backup failed",
			"key", result.Key,
			"duration", result.Duration,
			"error", result.Err,
		)
		os.Exit(1)
	}

	logger.Info("backup succeeded",
		"key", result.Key,
		"size_bytes", result.Size,
		"duration", result.Duration,
	)
}

// storageKey builds an S3 object key like "prefix/2026-06-29T15-04-05Z.sql.gz".
func storageKey(prefix, ext string) string {
	ts := time.Now().UTC().Format("2006-01-02T15-04-05Z")
	key := ts + ".sql" + ext
	if prefix != "" {
		key = prefix + "/" + key
	}
	return key
}