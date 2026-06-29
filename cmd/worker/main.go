package main

import (
	"context"
	"log/slog"
	"os"

	"github.com/soapboxsys/ombudslib/internal/backup"
	"github.com/soapboxsys/ombudslib/internal/compress"
	"github.com/soapboxsys/ombudslib/internal/config"
	"github.com/soapboxsys/ombudslib/internal/dumper"
	"github.com/soapboxsys/ombudslib/internal/storage"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))

	cfg, err := config.Load()
	if err != nil {
		logger.Error("failed to load config", slog.String("error", err.Error()))
		os.Exit(1)
	}

	ctx := context.Background()

	// Build dumper from DSN
	pgDumper, err := dumper.New(cfg.Database.DSN)
	if err != nil {
		logger.Error("failed to create dumper", slog.String("error", err.Error()))
		os.Exit(1)
	}

	// Build compressor
	compressor, err := compress.NewFromConfig(cfg.Compression)
	if err != nil {
		logger.Error("failed to create compressor", slog.String("error", err.Error()))
		os.Exit(1)
	}

	// Build storage backend
	var storageBackend storage.Backend
	switch cfg.Storage.Type {
	case "s3":
		storageBackend, err = storage.NewS3(ctx, storage.S3Config{
			Bucket:          cfg.Storage.S3.Bucket,
			Endpoint:        cfg.Storage.S3.Endpoint,
			Region:          cfg.Storage.S3.Region,
			AccessKeyID:     cfg.Storage.S3.AccessKeyID,
			SecretAccessKey: cfg.Storage.S3.SecretAccessKey,
			ForcePathStyle:  cfg.Storage.S3.ForcePathStyle,
		})
		if err != nil {
			logger.Error("failed to create S3 backend", slog.String("error", err.Error()))
			os.Exit(1)
		}
	case "local":
		storageBackend, err = storage.NewLocal(cfg.Storage.Local.Path)
		if err != nil {
			logger.Error("failed to create local backend", slog.String("error", err.Error()))
			os.Exit(1)
		}
	default:
		logger.Error("unknown storage type", slog.String("type", cfg.Storage.Type))
		os.Exit(1)
	}

	// Construct and run backup job
	job := backup.NewJob(pgDumper, compressor, storageBackend, cfg.StreamDirect, logger)

	logger.Info("starting backup job")
	result := job.Run(ctx)
	if result.Error != nil {
		logger.Error("backup job failed",
			slog.String("error", result.Error.Error()),
			slog.Duration("duration", result.Duration),
		)
		os.Exit(1)
	}

	logger.Info("backup job succeeded",
		slog.String("key", result.Key),
		slog.Int64("size_bytes", result.Size),
		slog.Duration("duration", result.Duration),
	)
}