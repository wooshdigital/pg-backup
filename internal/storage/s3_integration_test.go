//go:build integration

package storage_test

import (
	"context"
	"strings"
	"testing"

	"github.com/ssoready/conf/internal/config"
	"github.com/ssoready/conf/internal/storage"
)

func TestS3Backend_Put_Integration(t *testing.T) {
	endpoint := os.Getenv("S3_ENDPOINT")
	if endpoint == "" {
		t.Skip("S3_ENDPOINT not set; skipping S3 integration test")
	}

	bucket := os.Getenv("S3_BUCKET")
	if bucket == "" {
		bucket = "test-backups"
	}

	cfg := &config.Config{
		Storage: config.StorageConfig{
			Backend:     "s3",
			S3Bucket:    bucket,
			S3Region:    "us-east-1",
			S3Endpoint:  endpoint,
			S3PathStyle: true,
		},
	}

	ctx := context.Background()
	b, err := storage.New(ctx, cfg)
	if err != nil {
		t.Fatalf("storage.New: %v", err)
	}

	key, err := b.Put(ctx, strings.NewReader("integration test payload"))
	if err != nil {
		t.Fatalf("Put: %v", err)
	}
	if !strings.HasPrefix(key, "backups/") {
		t.Errorf("key %q should start with backups/", key)
	}
	t.Logf("uploaded key: %s", key)
}