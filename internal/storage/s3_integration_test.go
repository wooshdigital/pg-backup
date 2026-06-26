//go:build integration
// +build integration

// s3_integration_test.go contains additional integration tests that require
// a running LocalStack instance. They are gated behind the "integration" build
// tag so that `go test ./...` does not run them by default.
//
// Run with: go test -tags integration ./internal/storage/...

package storage_test

import (
	"bytes"
	"context"
	"fmt"
	"testing"
	"time"

	storage "github.com/yourusername/dbbackup/internal/storage"
)

// TestS3Uploader_IntegrationKeyTemplate verifies that RenderKey output can be
// used as an S3 key in a full upload round-trip.
func TestS3Uploader_IntegrationKeyTemplate(t *testing.T) {
	ctx := context.Background()
	endpoint, teardown := startLocalStack(ctx, t)
	defer teardown()
	createBucket(ctx, t, endpoint, testBucket)

	up := newTestUploader(ctx, t, endpoint)

	ref := time.Date(2024, 3, 15, 10, 30, 0, 0, time.UTC)
	key, err := storage.RenderKey("backups/{db}/{date}/{db}-{timestamp}.sql.gz", storage.KeyParams{
		DB:       "orders",
		T:        ref,
		Hostname: "prod-db-1",
	})
	if err != nil {
		t.Fatalf("RenderKey: %v", err)
	}

	payload := []byte("integration test payload")
	if err := up.Upload(ctx, key, bytes.NewReader(payload), int64(len(payload))); err != nil {
		t.Fatalf("Upload: %v", err)
	}

	ok, err := up.Exists(ctx, key)
	if err != nil {
		t.Fatalf("Exists: %v", err)
	}
	if !ok {
		t.Errorf("expected key %q to exist", key)
	}
}

// TestS3Uploader_MultipleUploads verifies that multiple sequential uploads work correctly.
func TestS3Uploader_MultipleUploads(t *testing.T) {
	ctx := context.Background()
	endpoint, teardown := startLocalStack(ctx, t)
	defer teardown()
	createBucket(ctx, t, endpoint, testBucket)

	up := newTestUploader(ctx, t, endpoint)

	for i := 0; i < 5; i++ {
		key := fmt.Sprintf("backups/db/2024-03-15/dump-%d.sql.gz", i)
		payload := []byte(fmt.Sprintf("dump number %d", i))
		if err := up.Upload(ctx, key, bytes.NewReader(payload), int64(len(payload))); err != nil {
			t.Fatalf("Upload #%d: %v", i, err)
		}
	}

	// Verify all five objects exist.
	for i := 0; i < 5; i++ {
		key := fmt.Sprintf("backups/db/2024-03-15/dump-%d.sql.gz", i)
		ok, err := up.Exists(ctx, key)
		if err != nil {
			t.Fatalf("Exists #%d: %v", i, err)
		}
		if !ok {
			t.Errorf("key %q should exist", key)
		}
	}
}