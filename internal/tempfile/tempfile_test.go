package tempfile

import (
	"bytes"
	"io"
	"os"
	"path/filepath"
	"testing"
)

func TestNew_CreatesFile(t *testing.T) {
	t.Parallel()

	tf, err := New("", "test-", ".dump")
	if err != nil {
		t.Fatalf("New() error: %v", err)
	}
	defer tf.Cleanup()

	if tf.Path() == "" {
		t.Error("Path() should not be empty")
	}

	if _, err := os.Stat(tf.Path()); err != nil {
		t.Errorf("temp file should exist on disk: %v", err)
	}
}

func TestNew_CustomDir(t *testing.T) {
	t.Parallel()

	dir := t.TempDir()
	tf, err := New(dir, "custom-", ".tmp")
	if err != nil {
		t.Fatalf("New() error: %v", err)
	}
	defer tf.Cleanup()

	if filepath.Dir(tf.Path()) != dir {
		t.Errorf("expected file in %q, got %q", dir, tf.Path())
	}
}

func TestTempFile_WriteAndSize(t *testing.T) {
	t.Parallel()

	tf, err := New("", "write-test-", ".tmp")
	if err != nil {
		t.Fatalf("New() error: %v", err)
	}
	defer tf.Cleanup()

	data := []byte("hello, world!")
	n, err := tf.Write(data)
	if err != nil {
		t.Fatalf("Write() error: %v", err)
	}
	if n != len(data) {
		t.Errorf("Write() = %d bytes, want %d", n, len(data))
	}

	size, err := tf.Size()
	if err != nil {
		t.Fatalf("Size() error: %v", err)
	}
	if size != int64(len(data)) {
		t.Errorf("Size() = %d, want %d", size, len(data))
	}
}

func TestTempFile_Cleanup(t *testing.T) {
	t.Parallel()

	tf, err := New("", "cleanup-", ".tmp")
	if err != nil {
		t.Fatalf("New() error: %v", err)
	}

	path := tf.Path()
	if err := tf.Cleanup(); err != nil {
		t.Fatalf("Cleanup() error: %v", err)
	}

	if _, err := os.Stat(path); !os.IsNotExist(err) {
		t.Errorf("file should have been removed after Cleanup()")
	}

	// Second call should be a no-op.
	if err := tf.Cleanup(); err != nil {
		t.Errorf("second Cleanup() should not error, got: %v", err)
	}
}

func TestTempFile_Persist(t *testing.T) {
	t.Parallel()

	tf, err := New("", "persist-", ".dump")
	if err != nil {
		t.Fatalf("New() error: %v", err)
	}

	content := []byte("pg dump content")
	if _, err := tf.Write(content); err != nil {
		t.Fatalf("Write() error: %v", err)
	}

	dst := filepath.Join(t.TempDir(), "subdir", "final.dump")
	if err := tf.Persist(dst); err != nil {
		t.Fatalf("Persist() error: %v", err)
	}

	// Destination file should exist with correct content.
	got, err := os.ReadFile(dst)
	if err != nil {
		t.Fatalf("ReadFile(%q) error: %v", dst, err)
	}
	if !bytes.Equal(got, content) {
		t.Errorf("persisted content = %q, want %q", got, content)
	}

	// Cleanup after Persist should not remove the destination.
	_ = tf.Cleanup()
	if _, err := os.Stat(dst); err != nil {
		t.Errorf("destination should still exist after Cleanup: %v", err)
	}
}

func TestTempFile_Reader(t *testing.T) {
	t.Parallel()

	tf, err := New("", "reader-", ".tmp")
	if err != nil {
		t.Fatalf("New() error: %v", err)
	}
	defer tf.Cleanup()

	content := []byte("readable content")
	if _, err := tf.Write(content); err != nil {
		t.Fatalf("Write() error: %v", err)
	}
	if err := tf.Close(); err != nil {
		t.Fatalf("Close() error: %v", err)
	}

	r, err := tf.Reader()
	if err != nil {
		t.Fatalf("Reader() error: %v", err)
	}
	defer r.Close()

	got, err := io.ReadAll(r)
	if err != nil {
		t.Fatalf("ReadAll error: %v", err)
	}
	if !bytes.Equal(got, content) {
		t.Errorf("Reader content = %q, want %q", got, content)
	}
}

func TestTempFile_CloseIdempotent(t *testing.T) {
	t.Parallel()

	tf, err := New("", "close-", ".tmp")
	if err != nil {
		t.Fatalf("New() error: %v", err)
	}
	defer tf.Cleanup()

	if err := tf.Close(); err != nil {
		t.Fatalf("first Close() error: %v", err)
	}
	if err := tf.Close(); err != nil {
		t.Errorf("second Close() should be a no-op, got: %v", err)
	}
}