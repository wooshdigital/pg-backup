package storage_test

import (
	"bytes"
	"context"
	"os"
	"path/filepath"
	"testing"

	"github.com/sdreger/cmd-worker/internal/storage"
)

func TestLocalBackend_Upload(t *testing.T) {
	t.Parallel()

	dir := t.TempDir()
	b, err := storage.NewLocalBackend(dir)
	if err != nil {
		t.Fatalf("NewLocalBackend: %v", err)
	}

	const key = "backups/2025/06/15/backup-20250615-103045.dump.gz"
	data := []byte("fake compressed backup data")

	n, err := b.Upload(context.Background(), key, bytes.NewReader(data))
	if err != nil {
		t.Fatalf("Upload: %v", err)
	}
	if n != int64(len(data)) {
		t.Errorf("Upload returned %d bytes, want %d", n, len(data))
	}

	got, err := os.ReadFile(filepath.Join(dir, filepath.FromSlash(key)))
	if err != nil {
		t.Fatalf("ReadFile: %v", err)
	}
	if !bytes.Equal(got, data) {
		t.Errorf("file content = %q, want %q", got, data)
	}
}