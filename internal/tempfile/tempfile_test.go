package tempfile_test

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/example/pgdumpworker/internal/tempfile"
)

func TestNew_CreatesFile(t *testing.T) {
	dir := t.TempDir()
	tf, err := tempfile.New(dir, "test-*.tmp")
	if err != nil {
		t.Fatalf("New: %v", err)
	}
	defer tf.Cleanup()

	if _, err := os.Stat(tf.Name()); err != nil {
		t.Errorf("temp file does not exist: %v", err)
	}
}

func TestCommit_RenamesFile(t *testing.T) {
	dir := t.TempDir()
	tf, err := tempfile.New(dir, "test-*.tmp")
	if err != nil {
		t.Fatalf("New: %v", err)
	}

	if _, err := tf.WriteString("hello"); err != nil {
		t.Fatalf("Write: %v", err)
	}

	dst := filepath.Join(dir, "final.txt")
	if err := tf.Commit(dst); err != nil {
		t.Fatalf("Commit: %v", err)
	}

	data, err := os.ReadFile(dst)
	if err != nil {
		t.Fatalf("ReadFile: %v", err)
	}
	if string(data) != "hello" {
		t.Errorf("got %q, want %q", string(data), "hello")
	}
}

func TestCleanup_RemovesTempFile(t *testing.T) {
	dir := t.TempDir()
	tf, err := tempfile.New(dir, "test-*.tmp")
	if err != nil {
		t.Fatalf("New: %v", err)
	}

	name := tf.Name()
	tf.Cleanup()

	if _, err := os.Stat(name); !os.IsNotExist(err) {
		t.Errorf("temp file still exists after Cleanup")
	}
}

func TestCleanup_AfterCommit_IsNoop(t *testing.T) {
	dir := t.TempDir()
	tf, err := tempfile.New(dir, "test-*.tmp")
	if err != nil {
		t.Fatalf("New: %v", err)
	}

	dst := filepath.Join(dir, "final.txt")
	if err := tf.Commit(dst); err != nil {
		t.Fatalf("Commit: %v", err)
	}

	// Should not panic or error.
	tf.Cleanup()

	// final file should still be present.
	if _, err := os.Stat(dst); err != nil {
		t.Errorf("final file missing after Cleanup-after-Commit: %v", err)
	}
}