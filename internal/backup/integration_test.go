//go:build integration

package backup_test

import (
	"context"
	"io"
	"log/slog"
	"os"
	"testing"
	"time"

	"github.com/soapboxsys/ombudslib/internal/backup"
	"github.com/soapboxsys/ombudslib/internal/compress"
	"github.com/soapboxsys/ombudslib/internal/dumper"
	"github.com/soapboxsys/ombudslib/internal/storage"
)

// TestBackupJob_Integration runs a full backup cycle using real Postgres
// and LocalStack containers. It requires the following environment variables
// to be set (typically provided by docker-compose.test.yml):
//
//	POSTGRES_DSN   - e.g. postgres://postgres:postgres@localhost:5432/testdb?sslmode=disable
//	S3_BUCKET      - e.g. test-bucket
//	S3_ENDPOINT    - e.g. http://localhost:4566
//	AWS_REGION     - e.g. us-east-1
//	AWS_ACCESS_KEY - e.g. test
//	AWS_SECRET_KEY - e.g. test
func TestBackupJob_Integration(t *testing.T) {
	pgDSN := requireEnv(t, "POSTGRES_DSN")
	s3Bucket := requireEnv(t, "S3_BUCKET")
	s3Endpoint := requireEnv(t, "S3_ENDPOINT")
	awsRegion := requireEnv(t, "AWS_REGION")
	awsAccess := requireEnv(t, "AWS_ACCESS_KEY")
	awsSecret := requireEnv(t, "AWS_SECRET_KEY")

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
	defer cancel()

	logger := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelDebug}))

	// Build dumper
	pgDumper, err := dumper.New(pgDSN)
	if err != nil {
		t.Fatalf("failed to create dumper: %v", err)
	}

	// Build compressor (gzip)
	gzipCompressor, err := compress.NewGzip(compress.DefaultLevel)
	if err != nil {
		t.Fatalf("failed to create compressor: %v", err)
	}

	// Build S3 storage backend
	s3Backend, err := storage.NewS3(ctx, storage.S3Config{
		Bucket:          s3Bucket,
		Endpoint:        s3Endpoint,
		Region:          awsRegion,
		AccessKeyID:     awsAccess,
		SecretAccessKey: awsSecret,
		ForcePathStyle:  true,
	})
	if err != nil {
		t.Fatalf("failed to create S3 backend: %v", err)
	}

	// Run via temp file
	t.Run("via_temp_file", func(t *testing.T) {
		job := backup.NewJob(pgDumper, gzipCompressor, s3Backend, false, logger)
		result := job.Run(ctx)
		if result.Error != nil {
			t.Fatalf("backup job failed: %v", result.Error)
		}
		t.Logf("backup complete: key=%s size=%d duration=%s", result.Key, result.Size, result.Duration)
		if result.Key == "" {
			t.Error("expected non-empty key")
		}
		if result.Size == 0 {
			t.Error("expected non-zero size")
		}
	})

	// Run via direct stream
	t.Run("stream_direct", func(t *testing.T) {
		job := backup.NewJob(pgDumper, gzipCompressor, s3Backend, true, logger)
		result := job.Run(ctx)
		if result.Error != nil {
			t.Fatalf("backup job (stream direct) failed: %v", result.Error)
		}
		t.Logf("backup complete (stream): key=%s size=%d duration=%s", result.Key, result.Size, result.Duration)
		if result.Key == "" {
			t.Error("expected non-empty key")
		}
		if result.Size == 0 {
			t.Error("expected non-zero size")
		}
	})
}

func requireEnv(t *testing.T, key string) string {
	t.Helper()
	val := os.Getenv(key)
	if val == "" {
		t.Skipf("skipping integration test: %s not set", key)
	}
	return val
}

// TestPipeline_Integration tests the three-stage streaming pipeline.
func TestPipeline_Integration(t *testing.T) {
	pgDSN := requireEnv(t, "POSTGRES_DSN")
	s3Bucket := requireEnv(t, "S3_BUCKET")
	s3Endpoint := requireEnv(t, "S3_ENDPOINT")
	awsRegion := requireEnv(t, "AWS_REGION")
	awsAccess := requireEnv(t, "AWS_ACCESS_KEY")
	awsSecret := requireEnv(t, "AWS_SECRET_KEY")

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
	defer cancel()

	logger := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelDebug}))

	pgDumper, err := dumper.New(pgDSN)
	if err != nil {
		t.Fatalf("failed to create dumper: %v", err)
	}

	gzipCompressor, err := compress.NewGzip(compress.DefaultLevel)
	if err != nil {
		t.Fatalf("failed to create compressor: %v", err)
	}

	s3Backend, err := storage.NewS3(ctx, storage.S3Config{
		Bucket:          s3Bucket,
		Endpoint:        s3Endpoint,
		Region:          awsRegion,
		AccessKeyID:     awsAccess,
		SecretAccessKey: awsSecret,
		ForcePathStyle:  true,
	})
	if err != nil {
		t.Fatalf("failed to create S3 backend: %v", err)
	}

	pipeline := backup.NewPipeline(pgDumper, gzipCompressor, s3Backend, logger)
	result, err := pipeline.Run(ctx)
	if err != nil {
		t.Fatalf("pipeline failed: %v", err)
	}
	t.Logf("pipeline complete: key=%s size=%d", result.Key, result.Size)
	if result.Key == "" {
		t.Error("expected non-empty key")
	}
	if result.Size == 0 {
		t.Error("expected non-zero size")
	}
}

// Ensure discarded output doesn't cause issues in non-integration mode.
var _ io.Writer = io.Discard