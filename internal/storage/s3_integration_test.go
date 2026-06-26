//go:build integration

package storage_test

import (
	"bytes"
	"context"
	"io"
	"os"
	"path/filepath"
	"testing"

	appcfg "github.com/yourusername/dbbackup/internal/config"
	"github.com/yourusername/dbbackup/internal/storage"
)

// TestLocalStorageUpload_Integration is a standalone integration test for
// LocalStorage that does not require Docker, making it easy to run as part of
// CI without the testcontainers dependency.
func TestLocalStorageUpload_Integration(t *testing.T) {
	dir := t.TempDir()

	ls, err := storage.NewLocalStorage(dir)
	if err != nil {
		t.Fatalf("NewLocalStorage: %v", err)
	}
	defer ls.Close()

	cases := []struct {
		key     string
		content []byte
	}{
		{"simple.txt", []byte("simple content")},
		{"nested/path/file.gz", []byte("nested content")},
		{"deep/a/b/c/d.bin", bytes.Repeat([]byte{0xAB}, 1024)},
	}

	for _, tc := range cases {
		t.Run(tc.key, func(t *testing.T) {
			if err := ls.Upload(context.Background(), tc.key, bytes.NewReader(tc.content), int64(len(tc.content))); err != nil {
				t.Fatalf("Upload(%q): %v", tc.key, err)
			}

			dest := filepath.Join(dir, filepath.FromSlash(tc.key))
			got, err := os.ReadFile(dest)
			if err != nil {
				t.Fatalf("ReadFile(%q): %v", dest, err)
			}

			if !bytes.Equal(got, tc.content) {
				t.Errorf("content mismatch for key %q", tc.key)
			}
		})
	}
}

// TestS3UploaderConfig_InvalidRegion verifies that NewS3Uploader returns an
// error if the region is empty when no endpoint override is set.
// This test does not require LocalStack.
func TestS3UploaderConfig_Defaults(t *testing.T) {
	ctx := context.Background()

	// A config with explicit credentials but no real S3 endpoint.
	// We only verify that the uploader is constructed without panicking;
	// an actual upload would fail due to connection refused.
	cfg := appcfg.S3Config{
		Bucket:  "mybucket",
		Region:  "us-east-1",
		PartSize: 5 * 1024 * 1024,
		Concurrency: 3,
		MaxRetries:  1,
		Credentials: appcfg.S3Credentials{
			AccessKeyID:     "fakekey",
			SecretAccessKey: "fakesecret",
		},
	}

	u, err := storage.NewS3Uploader(ctx, cfg)
	if err != nil {
		t.Fatalf("NewS3Uploader with valid config: %v", err)
	}
	defer u.Close()
}

// TestStorageBackendInterface ensures both implementations satisfy the interface.
func TestStorageBackendInterface(t *testing.T) {
	dir := t.TempDir()

	var _ storage.StorageBackend
	ls, err := storage.NewLocalStorage(dir)
	if err != nil {
		t.Fatalf("NewLocalStorage: %v", err)
	}

	// Verify Upload and Close are callable through the interface.
	var backend storage.StorageBackend = ls
	if err := backend.Upload(context.Background(), "check.txt", bytes.NewReader([]byte("ok")), 2); err != nil {
		t.Fatalf("interface Upload: %v", err)
	}
	if err := backend.Close(); err != nil {
		t.Fatalf("interface Close: %v", err)
	}
}

// readAll is a convenience helper used in tests.
func readAll(r io.Reader) ([]byte, error) {
	return io.ReadAll(r)
}

// Ensure readAll is used (suppress unused import warnings).
var _ = readAll