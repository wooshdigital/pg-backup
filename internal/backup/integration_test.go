//go:build integration

package backup_test

import (
	"context"
	"log/slog"
	"os"
	"testing"
	"time"

	"github.com/smnzlnsk/backup-worker/internal/backup"
	"github.com/smnzlnsk/backup-worker/internal/compress"
	"github.com/smnzlnsk/backup-worker/internal/dumper"
	"github.com/smnzlnsk/backup-worker/internal/storage"
)

// TestBackupJob_Integration runs a full backup cycle against a real Postgres
// and LocalStack S3 instance. It expects the services defined in
// docker-compose.test.yml to already be running (started by the Makefile target).
//
// Required environment variables (set by docker-compose or CI):
//
//	POSTGRES_DSN   - e.g. postgres://user:pass@localhost:5432/testdb?sslmode=disable
//	S3_ENDPOINT    - e.g. http://localhost:4566
//	S3_BUCKET      - e.g. test-backups
//	AWS_REGION     - e.g. us-east-1
//	AWS_ACCESS_KEY - e.g. test
//	AWS_SECRET_KEY - e.g. test
func TestBackupJob_Integration(t *testing.T) {
	pgDSN := os.Getenv("POSTGRES_DSN")
	if pgDSN == "" {
		t.Skip("POSTGRES_DSN not set; skipping integration test")
	}

	s3Endpoint := os.Getenv("S3_ENDPOINT")
	if s3Endpoint == "" {
		t.Skip("S3_ENDPOINT not set; skipping integration test")
	}

	bucket := os.Getenv("S3_BUCKET")
	if bucket == "" {
		bucket = "test-backups"
	}

	region := os.Getenv("AWS_REGION")
	if region == "" {
		region = "us-east-1"
	}

	accessKey := os.Getenv("AWS_ACCESS_KEY")
	secretKey := os.Getenv("AWS_SECRET_KEY")
	if accessKey == "" {
		accessKey = "test"
	}
	if secretKey == "" {
		secretKey = "test"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
	defer cancel()

	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelDebug}))

	// Build dumper
	d, err := dumper.New(dumper.Config{DSN: pgDSN})
	if err != nil {
		t.Fatalf("failed to create dumper: %v", err)
	}

	// Build compressor (gzip)
	c, err := compress.NewFactory().Get("gzip")
	if err != nil {
		t.Fatalf("failed to create compressor: %v", err)
	}

	// Build S3 storage backend (pointing at LocalStack)
	s3Cfg := storage.S3Config{
		Bucket:          bucket,
		Region:          region,
		Endpoint:        s3Endpoint,
		AccessKeyID:     accessKey,
		SecretAccessKey: secretKey,
		ForcePathStyle:  true,
	}
	s3Backend, err := storage.NewS3(ctx, s3Cfg)
	if err != nil {
		t.Fatalf("failed to create S3 backend: %v", err)
	}

	// Ensure bucket exists (LocalStack does not pre-create buckets)
	if err := s3Backend.EnsureBucket(ctx); err != nil {
		t.Fatalf("failed to ensure bucket: %v", err)
	}

	job := &backup.Job{
		Dumper:     d,
		Compressor: c,
		Storage:    s3Backend,
		Logger:     logger,
	}

	result := job.Run(ctx)
	if result.Err != nil {
		t.Fatalf("backup job failed: %v", result.Err)
	}

	t.Logf("Backup completed: key=%s size=%d duration=%s", result.Key, result.Size, result.Duration)

	if result.Key == "" {
		t.Error("expected non-empty key")
	}
	if result.Size <= 0 {
		t.Error("expected positive upload size")
	}
	if result.Duration <= 0 {
		t.Error("expected positive duration")
	}
}

// TestBackupJob_Integration_StreamDirect mirrors TestBackupJob_Integration but
// exercises the StreamDirect path.
func TestBackupJob_Integration_StreamDirect(t *testing.T) {
	pgDSN := os.Getenv("POSTGRES_DSN")
	if pgDSN == "" {
		t.Skip("POSTGRES_DSN not set; skipping integration test")
	}

	s3Endpoint := os.Getenv("S3_ENDPOINT")
	if s3Endpoint == "" {
		t.Skip("S3_ENDPOINT not set; skipping integration test")
	}

	bucket := os.Getenv("S3_BUCKET")
	if bucket == "" {
		bucket = "test-backups"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
	defer cancel()

	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelDebug}))

	d, err := dumper.New(dumper.Config{DSN: pgDSN})
	if err != nil {
		t.Fatalf("failed to create dumper: %v", err)
	}

	c, err := compress.NewFactory().Get("gzip")
	if err != nil {
		t.Fatalf("failed to create compressor: %v", err)
	}

	region := getEnvOrDefault("AWS_REGION", "us-east-1")
	accessKey := getEnvOrDefault("AWS_ACCESS_KEY", "test")
	secretKey := getEnvOrDefault("AWS_SECRET_KEY", "test")

	s3Cfg := storage.S3Config{
		Bucket:          bucket,
		Region:          region,
		Endpoint:        s3Endpoint,
		AccessKeyID:     accessKey,
		SecretAccessKey: secretKey,
		ForcePathStyle:  true,
	}
	s3Backend, err := storage.NewS3(ctx, s3Cfg)
	if err != nil {
		t.Fatalf("failed to create S3 backend: %v", err)
	}

	if err := s3Backend.EnsureBucket(ctx); err != nil {
		t.Fatalf("failed to ensure bucket: %v", err)
	}

	job := &backup.Job{
		Dumper:       d,
		Compressor:   c,
		Storage:      s3Backend,
		StreamDirect: true,
		Logger:       logger,
	}

	result := job.Run(ctx)
	if result.Err != nil {
		t.Fatalf("stream-direct backup job failed: %v", result.Err)
	}

	t.Logf("Stream-direct backup completed: key=%s size=%d duration=%s", result.Key, result.Size, result.Duration)

	if result.Key == "" {
		t.Error("expected non-empty key")
	}
	if result.Size <= 0 {
		t.Error("expected positive upload size")
	}
}

func getEnvOrDefault(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}