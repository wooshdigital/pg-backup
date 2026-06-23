package tempfile_test

import (
	"bytes"
	"os"
	"strings"
	"testing"

	"github.com/yourorg/pgdumper/internal/tempfile"
)

func TestNew(t *testing.T) {
	tf, err := tempfile.New("test-*.tmp")
	if err != nil {
		t.Fatalf("New: unexpected error: %v", err)
	}
	defer tf.Cleanup()

	if tf.Name() == "" {
		t.Error("Name() should not be empty")
	}
	if !strings.HasSuffix(tf.Name(), ".tmp") {
		t.Errorf("expected .tmp suffix, got %q", tf.Name())
	}

	// Verify the file exists on disk.
	if _, err := os.Stat(tf.Name()); err != nil {
		t.Errorf("file should exist: %v", err)
	}
}

func TestNewInDir(t *testing.T) {
	dir := t.TempDir()
	tf, err := tempfile.NewInDir(dir, "sub-*.bin")
	if err != nil {
		t.Fatalf("NewInDir: unexpected error: %v", err)
	}
	defer tf.Cleanup()

	if !strings.HasPrefix(tf.Name(), dir) {
		t.Errorf("expected file in %q, got %q", dir, tf.Name())
	}
}

func TestWriteAndReadAll(t *testing.T) {
	tf, err := tempfile.New("rw-*.bin")
	if err != nil {
		t.Fatalf("New: %v", err)
	}
	defer tf.Cleanup()

	data := []byte("hello, temp file world!")
	if _, err := tf.File().Write(data); err != nil {
		t.Fatalf("Write: %v", err)
	}

	got, err := tf.ReadAll()
	if err != nil {
		t.Fatalf("ReadAll: %v", err)
	}
	if !bytes.Equal(got, data) {
		t.Errorf("ReadAll: got %q, want %q", got, data)
	}
}

func TestRemove(t *testing.T) {
	tf, err := tempfile.New("remove-*.tmp")
	if err != nil {
		t.Fatalf("New: %v", err)
	}

	name := tf.Name()
	if err := tf.Close(); err != nil {
		t.Fatalf("Close: %v", err)
	}
	if err := tf.Remove(); err != nil {
		t.Fatalf("Remove: %v", err)
	}

	// File should no longer exist.
	if _, err := os.Stat(name); !os.IsNotExist(err) {
		t.Errorf("file should have been removed, stat error: %v", err)
	}

	// Second Remove should be a no-op (idempotent).
	if err := tf.Remove(); err != nil {
		t.Errorf("second Remove: unexpected error: %v", err)
	}
}

func TestCleanup(t *testing.T) {
	tf, err := tempfile.New("cleanup-*.tmp")
	if err != nil {
		t.Fatalf("New: %v", err)
	}
	name := tf.Name()
	tf.Cleanup()

	if _, err := os.Stat(name); !os.IsNotExist(err) {
		t.Errorf("file should be gone after Cleanup, stat: %v", err)
	}
}

func TestCleanupWithLog(t *testing.T) {
	tf, err := tempfile.New("log-cleanup-*.tmp")
	if err != nil {
		t.Fatalf("New: %v", err)
	}
	name := tf.Name()

	var logs []string
	tf.CleanupWithLog(func(msg string) { logs = append(logs, msg) })

	if _, err := os.Stat(name); !os.IsNotExist(err) {
		t.Errorf("file should be gone after CleanupWithLog")
	}
	// Expect no log messages on clean teardown.
	if len(logs) > 0 {
		t.Errorf("unexpected log messages: %v", logs)
	}
}

func TestFile_ReturnsUnderlyingFile(t *testing.T) {
	tf, err := tempfile.New("file-*.tmp")
	if err != nil {
		t.Fatalf("New: %v", err)
	}
	defer tf.Cleanup()

	f := tf.File()
	if f == nil {
		t.Fatal("File() returned nil")
	}
	if f.Name() != tf.Name() {
		t.Errorf("File().Name() = %q, want %q", f.Name(), tf.Name())
	}
}