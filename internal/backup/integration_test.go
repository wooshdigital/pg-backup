//go:build integration

package backup_test

import (
	"context"
	"log/slog"
	"os"
	"testing"

	"github.com/ssoready/conf/internal/backup"
	"github.com/ssoready/conf/internal/compress"
	"github.com/ssoready/conf/internal/config"
	"github.com/ssoready/conf/internal/dumper"
	"github.com/ssoready/conf/internal/storage"
)

// TestJob_Integration runs a complete end-to-end backup against a real
// Postgres (via testcontainers or pre-started via docker-compose) and a real
// LocalStack S3. Set the following env vars or rely on docker-compose.test.yml:
//
//	POSTGRES_DSN  – e.g. postgres://postgres:postgres@localhost:5432/testdb?sslmode=disable
//	S3_ENDPOINT   – e.g. http://localhost:4566
//	S3_BUCKET     – e.g. test-backups
//	AWS_REGION    – e.g. us-east-1
func TestJob_Integration(t *testing.T) {
	pgDSN := envOrSkip(t, "POSTGRES_DSN")
	s3Endpoint := envOrSkip(t, "S3_ENDPOINT")
	s3Bucket := envOrSkip(t, "S3_BUCKET")
	awsRegion := getEnvDefault("AWS_REGION", "us-east-1")

	cfg := &config.Config{
		Database: config.DatabaseConfig{
			DSN: pgDSN,
		},
		Storage: config.StorageConfig{
			Backend:     "s3",
			S3Bucket:    s3Bucket,
			S3Region:    awsRegion,
			S3Endpoint:  s3Endpoint,
			S3PathStyle: true,
		},
		Compression: config.CompressionConfig{
			Algorithm: "gzip",
			Level:     6,
		},
	}

	ctx := context.Background()
	logger := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelDebug}))

	d, err := dumper.New(cfg)
	if err != nil {
		t.Fatalf("dumper.New: %v", err)
	}

	c, err := compress.NewFactory().CreateWithLevel(cfg.Compression.Algorithm, cfg.Compression.Level)
	if err != nil {
		t.Fatalf("compress factory: %v", err)
	}

	s, err := storage.New(ctx, cfg)
	if err != nil {
		t.Fatalf("storage.New: %v", err)
	}

	// Test buffered mode.
	t.Run("buffered", func(t *testing.T) {
		job := &backup.Job{
			Dumper:     d,
			Compressor: c,
			Storage:    s,
			Logger:     logger,
		}
		res := job.Run(ctx)
		if res.Err != nil {
			t.Fatalf("buffered job failed: %v", res.Err)
		}
		if res.Key == "" {
			t.Error("expected non-empty storage key")
		}
		if res.Size <= 0 {
			t.Errorf("expected positive size, got %d", res.Size)
		}
		t.Logf("buffered: key=%s size=%d duration=%v", res.Key, res.Size, res.Duration)
	})

	// Test streamed mode.
	t.Run("streamed", func(t *testing.T) {
		job := &backup.Job{
			Dumper:       d,
			Compressor:   c,
			Storage:      s,
			Logger:       logger,
			StreamDirect: true,
		}
		res := job.Run(ctx)
		if res.Err != nil {
			t.Fatalf("streamed job failed: %v", res.Err)
		}
		if res.Key == "" {
			t.Error("expected non-empty storage key")
		}
		t.Logf("streamed: key=%s size=%d duration=%v", res.Key, res.Size, res.Duration)
	})
}

func envOrSkip(t *testing.T, key string) string {
	t.Helper()
	v := os.Getenv(key)
	if v == "" {
		t.Skipf("skipping integration test: %s not set", key)
	}
	return v
}

func getEnvDefault(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}