//go:build integration

package backup_test

import (
	"context"
	"fmt"
	"os"
	"testing"
	"time"

	"github.com/smlgh/smarti/internal/backup"
	"github.com/smlgh/smarti/internal/compress"
	"github.com/smlgh/smarti/internal/dumper"
	"github.com/smlgh/smarti/internal/storage"
)

// Integration test prerequisites (provided by docker-compose.test.yml):
//
//   - POSTGRES_DSN   – e.g. postgres://postgres:postgres@localhost:5432/testdb?sslmode=disable
//   - S3_ENDPOINT    – e.g. http://localhost:4566
//   - S3_BUCKET      – e.g. test-bucket
//   - AWS_ACCESS_KEY – e.g. test
//   - AWS_SECRET_KEY – e.g. test
//   - AWS_REGION     – e.g. us-east-1

func TestBackupJob_Integration_TempFile(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
	defer cancel()

	pgDSN := requireEnv(t, "POSTGRES_DSN")
	endpoint := requireEnv(t, "S3_ENDPOINT")
	bucket := requireEnv(t, "S3_BUCKET")
	accessKey := requireEnv(t, "AWS_ACCESS_KEY")
	secretKey := requireEnv(t, "AWS_SECRET_KEY")
	region := requireEnvWithDefault("AWS_REGION", "us-east-1")

	d, err := dumper.New(pgDSN)
	if err != nil {
		t.Fatalf("dumper.New: %v", err)
	}

	comp := compress.NewGzip(compress.DefaultGzipLevel)

	s3, err := storage.NewS3(ctx, storage.S3Config{
		Endpoint:        endpoint,
		Bucket:          bucket,
		AccessKeyID:     accessKey,
		SecretAccessKey: secretKey,
		Region:          region,
		ForcePathStyle:  true,
	})
	if err != nil {
		t.Fatalf("storage.NewS3: %v", err)
	}

	key := fmt.Sprintf("integration-test/%d.sql.gz", time.Now().UnixNano())

	job := &backup.Job{
		Dumper:       d,
		Compressor:   comp,
		Storage:      s3,
		StorageKey:   key,
		StreamDirect: false,
	}

	result := job.Run(ctx)
	if result.Err != nil {
		t.Fatalf("backup job failed: %v", result.Err)
	}
	if result.Size == 0 {
		t.Error("expected non-zero uploaded size")
	}
	t.Logf("integration backup OK: key=%s size=%d duration=%s", result.Key, result.Size, result.Duration)
}

func TestBackupJob_Integration_StreamDirect(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
	defer cancel()

	pgDSN := requireEnv(t, "POSTGRES_DSN")
	endpoint := requireEnv(t, "S3_ENDPOINT")
	bucket := requireEnv(t, "S3_BUCKET")
	accessKey := requireEnv(t, "AWS_ACCESS_KEY")
	secretKey := requireEnv(t, "AWS_SECRET_KEY")
	region := requireEnvWithDefault("AWS_REGION", "us-east-1")

	d, err := dumper.New(pgDSN)
	if err != nil {
		t.Fatalf("dumper.New: %v", err)
	}

	comp := compress.NewGzip(compress.DefaultGzipLevel)

	s3, err := storage.NewS3(ctx, storage.S3Config{
		Endpoint:        endpoint,
		Bucket:          bucket,
		AccessKeyID:     accessKey,
		SecretAccessKey: secretKey,
		Region:          region,
		ForcePathStyle:  true,
	})
	if err != nil {
		t.Fatalf("storage.NewS3: %v", err)
	}

	key := fmt.Sprintf("integration-test/direct-%d.sql.gz", time.Now().UnixNano())

	job := &backup.Job{
		Dumper:       d,
		Compressor:   comp,
		Storage:      s3,
		StorageKey:   key,
		StreamDirect: true,
	}

	result := job.Run(ctx)
	if result.Err != nil {
		t.Fatalf("backup job (stream-direct) failed: %v", result.Err)
	}
	if result.Size == 0 {
		t.Error("expected non-zero uploaded size")
	}
	t.Logf("integration stream-direct backup OK: key=%s size=%d duration=%s", result.Key, result.Size, result.Duration)
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

func requireEnv(t *testing.T, key string) string {
	t.Helper()
	v := os.Getenv(key)
	if v == "" {
		t.Skipf("environment variable %s not set – skipping integration test", key)
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