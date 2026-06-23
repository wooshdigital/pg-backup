package tempfile

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestNew(t *testing.T) {
	tf, err := New("", "test")
	if err != nil {
		t.Fatalf("New() error: %v", err)
	}
	defer tf.Discard()

	if tf.Path() == "" {
		t.Error("Path() should not be empty")
	}
	if !strings.Contains(filepath.Base(tf.Path()), "test") {
		t.Errorf("Path() = %q, want it to contain 'test'", tf.Path())
	}

	// File should exist
	if _, err := os.Stat(tf.Path()); err != nil {
		t.Errorf("temp file should exist: %v", err)
	}
}

func TestTempFile_Write(t *testing.T) {
	tf, err := New("", "test")
	if err != nil {
		t.Fatalf("New() error: %v", err)
	}
	defer tf.Discard()

	data := []byte("hello, world")
	n, err := tf.Write(data)
	if err != nil {
		t.Fatalf("Write() error: %v", err)
	}
	if n != len(data) {
		t.Errorf("Write() = %d, want %d", n, len(data))
	}

	size, err := tf.Size()
	if err != nil {
		t.Fatalf("Size() error: %v", err)
	}
	if size != int64(len(data)) {
		t.Errorf("Size() = %d, want %d", size, len(data))
	}
}

func TestTempFile_Commit(t *testing.T) {
	tf, err := New("", "test")
	if err != nil {
		t.Fatalf("New() error: %v", err)
	}

	data := []byte("committed content")
	if _, err := tf.Write(data); err != nil {
		t.Fatalf("Write() error: %v", err)
	}

	dest := filepath.Join(t.TempDir(), "subdir", "final.txt")
	if err := tf.Commit(dest); err != nil {
		t.Fatalf("Commit() error: %v", err)
	}

	// Dest should exist
	got, err := os.ReadFile(dest)
	if err != nil {
		t.Fatalf("ReadFile(dest) error: %v", err)
	}
	if string(got) != string(data) {
		t.Errorf("committed file content = %q, want %q", got, data)
	}

	// Temp file should be gone (either renamed or removed after copy)
	if _, err := os.Stat(tf.Path()); !os.IsNotExist(err) {
		// On some systems rename works, on others a copy+remove is done.
		// It's also possible the temp and dest are the same file if rename succeeded.
		if tf.Path() != dest {
			t.Errorf("temp file should be gone after Commit, but Stat returned: %v", err)
		}
	}
}

func TestTempFile_Discard(t *testing.T) {
	tf, err := New("", "test")
	if err != nil {
		t.Fatalf("New() error: %v", err)
	}

	path := tf.Path()
	if err := tf.Discard(); err != nil {
		t.Fatalf("Discard() error: %v", err)
	}

	if _, err := os.Stat(path); !os.IsNotExist(err) {
		t.Error("file should not exist after Discard")
	}

	// Double-discard should not error
	if err := tf.Discard(); err != nil {
		t.Errorf("second Discard() error: %v", err)
	}
}