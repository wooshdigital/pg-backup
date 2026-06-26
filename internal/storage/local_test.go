package storage_test

import (
	"bytes"
	"context"
	"os"
	"path/filepath"
	"testing"

	"github.com/yourusername/dbbackup/internal/storage"
)

func TestLocalStorage_Upload(t *testing.T) {
	t.Parallel()

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
		tc := tc
		t.Run(tc.key, func(t *testing.T) {
			t.Parallel()

			if err := ls.Upload(context.Background(), tc.key, bytes.NewReader(tc.content), int64(len(tc.content))); err != nil {
				t.Fatalf("Upload(%q): %v", tc.key, err)
			}

			dest := filepath.Join(dir, filepath.FromSlash(tc.key))
			got, err := os.ReadFile(dest)
			if err != nil {
				t.Fatalf("ReadFile(%q): %v", dest, err)
			}

			if !bytes.Equal(got, tc.content) {
				t.Errorf("content mismatch for key %q: got %d bytes, want %d bytes", tc.key, len(got), len(tc.content))
			}
		})
	}
}

func TestLocalStorage_OverwriteExistingFile(t *testing.T) {
	t.Parallel()

	dir := t.TempDir()
	ls, err := storage.NewLocalStorage(dir)
	if err != nil {
		t.Fatalf("NewLocalStorage: %v", err)
	}
	defer ls.Close()

	key := "overwrite.txt"
	first := []byte("first version")
	second := []byte("second version which is longer")

	if err := ls.Upload(context.Background(), key, bytes.NewReader(first), int64(len(first))); err != nil {
		t.Fatalf("first Upload: %v", err)
	}
	if err := ls.Upload(context.Background(), key, bytes.NewReader(second), int64(len(second))); err != nil {
		t.Fatalf("second Upload: %v", err)
	}

	dest := filepath.Join(dir, key)
	got, err := os.ReadFile(dest)
	if err != nil {
		t.Fatalf("ReadFile: %v", err)
	}
	if !bytes.Equal(got, second) {
		t.Errorf("expected second version after overwrite, got %q", got)
	}
}

func TestLocalStorage_StorageBackendInterface(t *testing.T) {
	dir := t.TempDir()

	ls, err := storage.NewLocalStorage(dir)
	if err != nil {
		t.Fatalf("NewLocalStorage: %v", err)
	}

	// Assign to interface to verify compile-time satisfaction.
	var backend storage.StorageBackend = ls

	content := []byte("interface check")
	if err := backend.Upload(context.Background(), "check.txt", bytes.NewReader(content), int64(len(content))); err != nil {
		t.Fatalf("Upload via interface: %v", err)
	}
	if err := backend.Close(); err != nil {
		t.Fatalf("Close via interface: %v", err)
	}
}

func TestNewLocalStorage_CreatesDirectory(t *testing.T) {
	t.Parallel()

	base := t.TempDir()
	newDir := filepath.Join(base, "does", "not", "exist")

	ls, err := storage.NewLocalStorage(newDir)
	if err != nil {
		t.Fatalf("NewLocalStorage: %v", err)
	}
	defer ls.Close()

	if _, err := os.Stat(newDir); os.IsNotExist(err) {
		t.Errorf("expected directory %q to be created", newDir)
	}
}