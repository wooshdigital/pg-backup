//go:build integration

package backup_test

import (
	"context"
	"fmt"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/example/dbbackup/internal/backup"
	"github.com/example/dbbackup/internal/compress"
	"github.com/example/dbbackup/internal/dumper"
	"github.com/example/dbbackup/internal/storage"
)

// TestJob_Integration runs a full backup cycle against real Postgres (via
// TEST_POSTGRES_DSN) and real LocalStack S3 (via TEST_S3_* env vars).
//
// Set the build tag `integration` to run:
//
//	go test -tags integration ./internal/backup/...
func TestJob_Integration(t *testing.T) {
	pgDSN := requireEnv(t, "TEST_POSTGRES_DSN")
	s3Endpoint := requireEnv(t, "TEST_S3_ENDPOINT")
	s3Bucket := requireEnv(t, "TEST_S3_BUCKET")
	s3Region := getEnvOrDefault("TEST_S3_REGION", "us-east-1")
	s3AccessKey := getEnvOrDefault("TEST_S3_ACCESS_KEY", "test")
	s3SecretKey := getEnvOrDefault("TEST_S3_SECRET_KEY", "test")

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
	defer cancel()

	// Build components.
	d, err := dumper.New(pgDSN)
	if err != nil {
		t.Fatalf("create dumper: %v", err)
	}

	c := compress.NewGzip(compress.DefaultGzipLevel)

	s3cfg := storage.S3Config{
		Endpoint:        s3Endpoint,
		Bucket:          s3Bucket,
		Region:          s3Region,
		AccessKeyID:     s3AccessKey,
		SecretAccessKey: s3SecretKey,
		ForcePathStyle:  true,
	}
	s, err := storage.NewS3(ctx, s3cfg)
	if err != nil {
		t.Fatalf("create s3 storage: %v", err)
	}

	key := fmt.Sprintf("integration-test/%d.sql.gz", time.Now().UnixNano())

	t.Run("via_temp_file", func(t *testing.T) {
		job := &backup.Job{
			Dumper:       d,
			Compressor:   c,
			Storage:      s,
			StorageKey:   key + ".tmp",
			StreamDirect: false,
		}

		result := job.Run(ctx)
		if result.Err != nil {
			t.Fatalf("backup via temp file failed: %v", result.Err)
		}
		t.Logf("via_temp_file: key=%s size=%d duration=%s", result.Key, result.Size, result.Duration)

		if result.Size == 0 {
			t.Error("expected non-zero backup size")
		}
		if result.Duration <= 0 {
			t.Error("expected positive duration")
		}
	})

	t.Run("stream_direct", func(t *testing.T) {
		job := &backup.Job{
			Dumper:       d,
			Compressor:   c,
			Storage:      s,
			StorageKey:   key + ".stream",
			StreamDirect: true,
		}

		result := job.Run(ctx)
		if result.Err != nil {
			t.Fatalf("backup stream direct failed: %v", result.Err)
		}
		t.Logf("stream_direct: key=%s size=%d duration=%s", result.Key, result.Size, result.Duration)
	})
}

func requireEnv(t *testing.T, key string) string {
	t.Helper()
	v := os.Getenv(key)
	if strings.TrimSpace(v) == "" {
		t.Skipf("skipping integration test: %s not set", key)
	}
	return v
}

func getEnvOrDefault(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}