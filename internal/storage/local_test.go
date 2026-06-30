package storage_test

import (
	"context"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/ssoready/conf/internal/config"
	"github.com/ssoready/conf/internal/storage"
)

func TestLocalBackend_Put(t *testing.T) {
	dir := t.TempDir()

	cfg := &config.Config{
		Storage: config.StorageConfig{
			Backend:   "local",
			LocalPath: dir,
		},
	}

	b, err := storage.New(context.Background(), cfg)
	if err != nil {
		t.Fatalf("storage.New: %v", err)
	}

	const content = "backup content"
	key, err := b.Put(context.Background(), strings.NewReader(content))
	if err != nil {
		t.Fatalf("Put: %v", err)
	}
	if key == "" {
		t.Error("expected non-empty key")
	}

	// Verify file exists.
	dst := filepath.Join(dir, filepath.Base(key))
	data, err := os.ReadFile(dst)
	if err != nil {
		t.Fatalf("read back file: %v", err)
	}
	if string(data) != content {
		t.Errorf("content = %q, want %q", data, content)
	}
}