package tempfile_test

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/nicholasgasior/gsfmt/internal/tempfile"
)

func TestTempFile_CommitAndRead(t *testing.T) {
	dir := t.TempDir()
	dst := filepath.Join(dir, "final", "output.txt")

	tf, err := tempfile.New(dir, "test-*.tmp")
	if err != nil {
		t.Fatalf("New failed: %v", err)
	}

	content := []byte("hello, world")
	if _, err := tf.File().Write(content); err != nil {
		t.Fatalf("write failed: %v", err)
	}

	if err := tf.Commit(dst); err != nil {
		t.Fatalf("Commit failed: %v", err)
	}

	got, err := os.ReadFile(dst)
	if err != nil {
		t.Fatalf("ReadFile failed: %v", err)
	}
	if string(got) != string(content) {
		t.Errorf("content mismatch: got %q, want %q", got, content)
	}
}

func TestTempFile_Cleanup(t *testing.T) {
	dir := t.TempDir()

	tf, err := tempfile.New(dir, "test-*.tmp")
	if err != nil {
		t.Fatalf("New failed: %v", err)
	}

	tmpPath := tf.Path()
	if _, err := os.Stat(tmpPath); err != nil {
		t.Fatalf("temp file should exist: %v", err)
	}

	if err := tf.Cleanup(); err != nil {
		t.Fatalf("Cleanup failed: %v", err)
	}

	if _, err := os.Stat(tmpPath); !os.IsNotExist(err) {
		t.Errorf("temp file should have been removed")
	}
}