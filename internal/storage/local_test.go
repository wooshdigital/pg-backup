package storage

import (
	"bytes"
	"context"
	"os"
	"path/filepath"
	"testing"
)

func TestLocalStorage_Upload(t *testing.T) {
	dir := t.TempDir()

	ls, err := NewLocalStorage(dir)
	if err != nil {
		t.Fatalf("NewLocalStorage: %v", err)
	}

	content := []byte("hello local storage")
	key := "backups/2024-03-15/dump.sql.gz"

	if err := ls.Upload(context.Background(), key, bytes.NewReader(content), int64(len(content))); err != nil {
		t.Fatalf("Upload: %v", err)
	}

	dest := filepath.Join(dir, filepath.FromSlash(key))
	got, err := os.ReadFile(dest)
	if err != nil {
		t.Fatalf("ReadFile: %v", err)
	}
	if !bytes.Equal(got, content) {
		t.Errorf("file content = %q, want %q", got, content)
	}
}

func TestLocalStorage_Upload_CreatesIntermediateDirs(t *testing.T) {
	dir := t.TempDir()

	ls, err := NewLocalStorage(dir)
	if err != nil {
		t.Fatalf("NewLocalStorage: %v", err)
	}

	key := "a/b/c/d/dump.gz"
	if err := ls.Upload(context.Background(), key, bytes.NewReader([]byte("data")), 4); err != nil {
		t.Fatalf("Upload: %v", err)
	}

	if _, err := os.Stat(filepath.Join(dir, filepath.FromSlash(key))); err != nil {
		t.Errorf("expected file to exist: %v", err)
	}
}

func TestLocalStorage_EmptyBaseDir(t *testing.T) {
	_, err := NewLocalStorage("")
	if err == nil {
		t.Error("expected error for empty base dir")
	}
}

func TestLocalStorage_ImplementsStorageBackend(t *testing.T) {
	// Compile-time check that *LocalStorage satisfies StorageBackend.
	var _ StorageBackend = (*LocalStorage)(nil)
}