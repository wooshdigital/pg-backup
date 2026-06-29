//go:build integration

package backup_test

import (
	"context"
	"fmt"
	"os"
	"testing"
	"time"

	"github.com/sgorgun/go-backup/internal/backup"
	"github.com/sgorgun/go-backup/internal/compress"
	"github.com/sgorgun/go-backup/internal/dumper"
	"github.com/sgorgun/go-backup/internal/storage"
)

// Integration test that requires:
//   - Postgres accessible at POSTGRES_DSN env var (or default)
//   - LocalStack S3 accessible at S3_ENDPOINT env var (or default)
//
// Run via: make test-integration
// or:      docker-compose -f docker-compose.test.yml up --abort-on-container-exit

func getEnvOrDefault(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func TestBackupJob_FullPipeline_Integration(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
	defer cancel()

	postgresDSN := getEnvOrDefault("POSTGRES_DSN", "postgres://postgres:postgres@localhost:5432/testdb?sslmode=disable")
	s3Endpoint := getEnvOrDefault("S3_ENDPOINT", "http://localhost:4566")
	s3Bucket := getEnvOrDefault("S3_BUCKET", "test-backups")
	s3Region := getEnvOrDefault("S3_REGION", "us-east-1")

	t.Logf("Using Postgres DSN: %s", postgresDSN)
	t.Logf("Using S3 endpoint:  %s", s3Endpoint)

	// Build the dumper.
	d, err := dumper.New(postgresDSN)
	if err != nil {
		t.Fatalf("failed to create dumper: %v", err)
	}

	// Build the compressor (gzip).
	c, err := compress.NewFactory().Create("gzip")
	if err != nil {
		t.Fatalf("failed to create compressor: %v", err)
	}

	// Build the S3 storage backend pointing at LocalStack.
	s3cfg := storage.S3Config{
		Bucket:          s3Bucket,
		Region:          s3Region,
		Endpoint:        s3Endpoint,
		ForcePathStyle:  true,
		AccessKeyID:     "test",
		SecretAccessKey: "test",
	}
	st, err := storage.NewS3(ctx, s3cfg)
	if err != nil {
		t.Fatalf("failed to create S3 storage: %v", err)
	}

	// Ensure the bucket exists in LocalStack.
	if err := st.EnsureBucket(ctx); err != nil {
		t.Fatalf("failed to ensure bucket: %v", err)
	}

	key := fmt.Sprintf("integration-test/%d.sql.gz", time.Now().UnixNano())

	job := &backup.Job{
		Dumper:       d,
		Compressor:   c,
		Storage:      st,
		StreamDirect: false,
		KeyFunc:      func() string { return key },
	}

	result := job.Run(ctx)
	if result.Err != nil {
		t.Fatalf("backup job failed: %v", result.Err)
	}

	t.Logf("Backup key:      %s", result.Key)
	t.Logf("Backup size:     %d bytes", result.Size)
	t.Logf("Backup duration: %s", result.Duration)

	if result.Size == 0 {
		t.Error("expected non-zero backup size")
	}
	if result.Key != key {
		t.Errorf("expected key %q, got %q", key, result.Key)
	}
}

func TestBackupJob_StreamDirect_Integration(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
	defer cancel()

	postgresDSN := getEnvOrDefault("POSTGRES_DSN", "postgres://postgres:postgres@localhost:5432/testdb?sslmode=disable")
	s3Endpoint := getEnvOrDefault("S3_ENDPOINT", "http://localhost:4566")
	s3Bucket := getEnvOrDefault("S3_BUCKET", "test-backups")
	s3Region := getEnvOrDefault("S3_REGION", "us-east-1")

	d, err := dumper.New(postgresDSN)
	if err != nil {
		t.Fatalf("failed to create dumper: %v", err)
	}

	c, err := compress.NewFactory().Create("gzip")
	if err != nil {
		t.Fatalf("failed to create compressor: %v", err)
	}

	s3cfg := storage.S3Config{
		Bucket:          s3Bucket,
		Region:          s3Region,
		Endpoint:        s3Endpoint,
		ForcePathStyle:  true,
		AccessKeyID:     "test",
		SecretAccessKey: "test",
	}
	st, err := storage.NewS3(ctx, s3cfg)
	if err != nil {
		t.Fatalf("failed to create S3 storage: %v", err)
	}

	if err := st.EnsureBucket(ctx); err != nil {
		t.Fatalf("failed to ensure bucket: %v", err)
	}

	key := fmt.Sprintf("integration-test/stream-%d.sql.gz", time.Now().UnixNano())

	job := &backup.Job{
		Dumper:       d,
		Compressor:   c,
		Storage:      st,
		StreamDirect: true,
		KeyFunc:      func() string { return key },
	}

	result := job.Run(ctx)
	if result.Err != nil {
		t.Fatalf("stream-direct backup job failed: %v", result.Err)
	}

	t.Logf("Stream-direct backup key:      %s", result.Key)
	t.Logf("Stream-direct backup size:     %d bytes", result.Size)
	t.Logf("Stream-direct backup duration: %s", result.Duration)

	if result.Size == 0 {
		t.Error("expected non-zero backup size")
	}
}