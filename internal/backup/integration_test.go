//go:build integration

package backup_test

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"testing"
	"time"

	"github.com/sdreger/cmd-worker/internal/backup"
	"github.com/sdreger/cmd-worker/internal/compress"
	"github.com/sdreger/cmd-worker/internal/config"
	"github.com/sdreger/cmd-worker/internal/dumper"
	"github.com/sdreger/cmd-worker/internal/storage"
)

// TestBackupJob_Integration runs a complete backup cycle against real
// Postgres and LocalStack S3 containers.
//
// It expects the following environment variables (set by docker-compose or the
// CI environment):
//
//	POSTGRES_DSN   – e.g. postgres://user:pass@localhost:5432/testdb?sslmode=disable
//	S3_ENDPOINT    – e.g. http://localhost:4566
//	S3_BUCKET      – e.g. backup-test
//	AWS_REGION     – e.g. us-east-1
//	AWS_ACCESS_KEY_ID
//	AWS_SECRET_ACCESS_KEY
func TestBackupJob_Integration(t *testing.T) {
	t.Helper()

	pgDSN := requireEnv(t, "POSTGRES_DSN")
	s3Endpoint := requireEnv(t, "S3_ENDPOINT")
	s3Bucket := requireEnv(t, "S3_BUCKET")
	awsRegion := requireEnvWithDefault("AWS_REGION", "us-east-1")

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
	defer cancel()

	logger := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelDebug}))

	// Build config
	cfg := &config.Config{
		Database: config.DatabaseConfig{
			DSN: pgDSN,
		},
		Storage: config.StorageConfig{
			Bucket:   s3Bucket,
			Endpoint: s3Endpoint,
			Region:   awsRegion,
		},
		Compress: config.CompressConfig{
			Algorithm: "gzip",
		},
	}

	// Build dumper
	d, err := dumper.New(cfg.Database.DSN)
	if err != nil {
		t.Fatalf("create dumper: %v", err)
	}

	// Build compressor
	c, err := compress.New(cfg.Compress.Algorithm)
	if err != nil {
		t.Fatalf("create compressor: %v", err)
	}

	// Build storage backend
	s3Backend, err := storage.NewS3Backend(ctx, cfg.Storage.Bucket, cfg.Storage.Region, cfg.Storage.Endpoint)
	if err != nil {
		t.Fatalf("create s3 backend: %v", err)
	}

	// Ensure bucket exists (LocalStack creates it automatically with the right
	// env vars, but we create it explicitly to be safe).
	if err = s3Backend.EnsureBucket(ctx); err != nil {
		t.Logf("EnsureBucket: %v (may already exist)", err)
	}

	// --- Test 1: via temp file ---
	t.Run("ViaTemp", func(t *testing.T) {
		job := &backup.Job{
			Dumper:       d,
			Compressor:   c,
			Storage:      s3Backend,
			StreamDirect: false,
			Logger:       logger,
		}

		result := job.Run(ctx)
		if result.Err != nil {
			t.Fatalf("backup via temp file failed: %v", result.Err)
		}
		assertResult(t, result)
	})

	// --- Test 2: streaming pipeline ---
	t.Run("StreamDirect", func(t *testing.T) {
		job := &backup.Job{
			Dumper:       d,
			Compressor:   c,
			Storage:      s3Backend,
			StreamDirect: true,
			Logger:       logger,
		}

		result := job.Run(ctx)
		if result.Err != nil {
			t.Fatalf("backup via streaming pipeline failed: %v", result.Err)
		}
		assertResult(t, result)
	})
}

func assertResult(t *testing.T, r backup.BackupResult) {
	t.Helper()
	if r.Key == "" {
		t.Error("result key is empty")
	}
	if r.Size <= 0 {
		t.Errorf("expected size > 0, got %d", r.Size)
	}
	if r.Duration <= 0 {
		t.Errorf("expected positive duration, got %v", r.Duration)
	}
	t.Logf("backup result: key=%s size=%d duration=%v", r.Key, r.Size, r.Duration)
}

func requireEnv(t *testing.T, key string) string {
	t.Helper()
	v := os.Getenv(key)
	if v == "" {
		t.Skipf("integration test skipped: env var %q not set", key)
	}
	return v
}

func requireEnvWithDefault(key, def string) string {
	v := os.Getenv(key)
	if v == "" {
		return def
	}
	return v
}

// Compile-time check so the fmt import is used even when helper functions are
// expanded away by the compiler.
var _ = fmt.Sprintf