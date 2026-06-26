package storage_test

import (
	"context"
	"os"
	"path/filepath"
	"strings"
	"testing"

	storage "github.com/yourusername/dbbackup/internal/storage"
)

func TestLocalStorage_Upload(t *testing.T) {
	dir := t.TempDir()
	ls, err := storage.NewLocalStorage(dir)
	if err != nil {
		t.Fatalf("NewLocalStorage: %v", err)
	}

	ctx := context.Background()
	const key = "backups/mydb/2024-03-15/dump.sql.gz"
	const content = "compressed dump data"

	if err := ls.Upload(ctx, key, strings.NewReader(content), int64(len(content))); err != nil {
		t.Fatalf("Upload: %v", err)
	}

	// Verify file exists on disk.
	dest := filepath.Join(dir, filepath.FromSlash(key))
	data, err := os.ReadFile(dest)
	if err != nil {
		t.Fatalf("reading uploaded file: %v", err)
	}
	if string(data) != content {
		t.Errorf("file content = %q, want %q", string(data), content)
	}
}

func TestLocalStorage_Exists(t *testing.T) {
	dir := t.TempDir()
	ls, _ := storage.NewLocalStorage(dir)
	ctx := context.Background()

	ok, err := ls.Exists(ctx, "does/not/exist.sql.gz")
	if err != nil {
		t.Fatalf("Exists: %v", err)
	}
	if ok {
		t.Error("expected false for non-existent key")
	}

	// Upload something, then check.
	const key = "mydb/dump.sql.gz"
	if err := ls.Upload(ctx, key, strings.NewReader("data"), -1); err != nil {
		t.Fatalf("Upload: %v", err)
	}
	ok, err = ls.Exists(ctx, key)
	if err != nil {
		t.Fatalf("Exists after upload: %v", err)
	}
	if !ok {
		t.Errorf("expected true for key %q after upload", key)
	}
}

func TestLocalStorage_Delete(t *testing.T) {
	dir := t.TempDir()
	ls, _ := storage.NewLocalStorage(dir)
	ctx := context.Background()

	const key = "backups/todelete.sql.gz"
	if err := ls.Upload(ctx, key, strings.NewReader("data"), -1); err != nil {
		t.Fatalf("Upload: %v", err)
	}

	if err := ls.Delete(ctx, key); err != nil {
		t.Fatalf("Delete: %v", err)
	}

	ok, err := ls.Exists(ctx, key)
	if err != nil {
		t.Fatalf("Exists after delete: %v", err)
	}
	if ok {
		t.Errorf("key %q should not exist after deletion", key)
	}
}

func TestLocalStorage_Delete_NonExistent(t *testing.T) {
	dir := t.TempDir()
	ls, _ := storage.NewLocalStorage(dir)
	ctx := context.Background()

	// Deleting a non-existent key should be a no-op (idempotent).
	if err := ls.Delete(ctx, "ghost/key.sql.gz"); err != nil {
		t.Errorf("Delete of non-existent key returned error: %v", err)
	}
}

func TestLocalStorage_Upload_CreatesIntermediaryDirs(t *testing.T) {
	dir := t.TempDir()
	ls, _ := storage.NewLocalStorage(dir)
	ctx := context.Background()

	const key = "a/b/c/d/dump.sql.gz"
	if err := ls.Upload(ctx, key, strings.NewReader("data"), -1); err != nil {
		t.Fatalf("Upload with deep path: %v", err)
	}

	dest := filepath.Join(dir, filepath.FromSlash(key))
	if _, err := os.Stat(dest); err != nil {
		t.Errorf("file not created at %q: %v", dest, err)
	}
}

func TestLocalStorage_EmptyKey_ReturnsError(t *testing.T) {
	dir := t.TempDir()
	ls, _ := storage.NewLocalStorage(dir)
	ctx := context.Background()

	if err := ls.Upload(ctx, "", strings.NewReader("x"), -1); err == nil {
		t.Error("Upload with empty key should return error")
	}
	if _, err := ls.Exists(ctx, ""); err == nil {
		t.Error("Exists with empty key should return error")
	}
	if err := ls.Delete(ctx, ""); err == nil {
		t.Error("Delete with empty key should return error")
	}
}

func TestLocalStorage_ImplementsStorageBackend(t *testing.T) {
	// Compile-time check: LocalStorage must implement StorageBackend.
	dir := t.TempDir()
	ls, _ := storage.NewLocalStorage(dir)
	var _ storage.StorageBackend = ls
}

func TestNewLocalStorage_EmptyDir_ReturnsError(t *testing.T) {
	_, err := storage.NewLocalStorage("")
	if err == nil {
		t.Error("expected error for empty baseDir")
	}
}