package storage_test

import (
	"context"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestLocalStorage_Upload(t *testing.T) {
	dir := t.TempDir()

	ls, err := NewLocalStorageForTest(dir)
	if err != nil {
		t.Fatalf("NewLocalStorage: %v", err)
	}
	defer ls.Close()

	content := "test content"
	key := "subdir/file.txt"

	err = ls.Upload(context.Background(), key, strings.NewReader(content), int64(len(content)))
	if err != nil {
		t.Fatalf("Upload: %v", err)
	}

	dest := filepath.Join(dir, "subdir", "file.txt")
	data, err := os.ReadFile(dest)
	if err != nil {
		t.Fatalf("reading uploaded file: %v", err)
	}
	if string(data) != content {
		t.Errorf("file content = %q; want %q", string(data), content)
	}
}

func TestLocalStorage_Upload_CreatesIntermediateDirs(t *testing.T) {
	dir := t.TempDir()

	ls, err := NewLocalStorageForTest(dir)
	if err != nil {
		t.Fatalf("NewLocalStorage: %v", err)
	}
	defer ls.Close()

	key := "a/b/c/d/file.bin"
	err = ls.Upload(context.Background(), key, strings.NewReader("data"), 4)
	if err != nil {
		t.Fatalf("Upload: %v", err)
	}

	if _, err := os.Stat(filepath.Join(dir, "a", "b", "c", "d", "file.bin")); err != nil {
		t.Errorf("expected file to exist: %v", err)
	}
}

func TestLocalStorage_Upload_CancelledContext(t *testing.T) {
	dir := t.TempDir()

	ls, err := NewLocalStorageForTest(dir)
	if err != nil {
		t.Fatalf("NewLocalStorage: %v", err)
	}
	defer ls.Close()

	ctx, cancel := context.WithCancel(context.Background())
	cancel()

	err = ls.Upload(ctx, "file.txt", strings.NewReader("hello"), 5)
	if err == nil {
		t.Error("expected error due to cancelled context, got nil")
	}
}

func TestLocalStorage_EmptyBaseDir(t *testing.T) {
	_, err := NewLocalStorageForTest("")
	if err == nil {
		t.Error("expected error for empty baseDir, got nil")
	}
}