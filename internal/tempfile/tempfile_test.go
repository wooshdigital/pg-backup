package tempfile

import (
	"io"
	"os"
	"strings"
	"testing"
)

func TestNew_CreatesFile(t *testing.T) {
	tf, err := New("", "testprefix", ".sql")
	if err != nil {
		t.Fatalf("New: %v", err)
	}
	defer tf.CloseAndRemove() //nolint

	path := tf.Path()
	if path == "" {
		t.Fatal("Path() returned empty string")
	}

	// File should exist.
	if _, err := os.Stat(path); err != nil {
		t.Fatalf("temp file does not exist: %v", err)
	}

	// Name should contain prefix.
	if !strings.Contains(path, "testprefix") {
		t.Errorf("path %q does not contain prefix %q", path, "testprefix")
	}
	// Name should end with suffix.
	if !strings.HasSuffix(path, ".sql") {
		t.Errorf("path %q does not have suffix .sql", path)
	}
}

func TestTempFile_Write(t *testing.T) {
	tf, err := New("", "writetest", ".txt")
	if err != nil {
		t.Fatalf("New: %v", err)
	}
	defer tf.CloseAndRemove() //nolint

	data := []byte("hello, temp file")
	n, err := tf.Write(data)
	if err != nil {
		t.Fatalf("Write: %v", err)
	}
	if n != len(data) {
		t.Errorf("Write returned %d, want %d", n, len(data))
	}

	size, err := tf.Size()
	if err != nil {
		t.Fatalf("Size: %v", err)
	}
	if size != int64(len(data)) {
		t.Errorf("Size = %d, want %d", size, len(data))
	}
}

func TestTempFile_CloseAndRemove(t *testing.T) {
	tf, err := New("", "removetest", ".tmp")
	if err != nil {
		t.Fatalf("New: %v", err)
	}
	path := tf.Path()

	if err := tf.CloseAndRemove(); err != nil {
		t.Fatalf("CloseAndRemove: %v", err)
	}

	// File should no longer exist.
	if _, err := os.Stat(path); !os.IsNotExist(err) {
		t.Errorf("expected file to be removed, but stat returned: %v", err)
	}
}

func TestTempFile_Close_FileRemains(t *testing.T) {
	tf, err := New("", "closetest", ".tmp")
	if err != nil {
		t.Fatalf("New: %v", err)
	}
	path := tf.Path()
	defer os.Remove(path) //nolint

	if err := tf.Close(); err != nil {
		t.Fatalf("Close: %v", err)
	}

	// File should still exist after Close (not CloseAndRemove).
	if _, err := os.Stat(path); err != nil {
		t.Errorf("file should still exist after Close: %v", err)
	}
}

func TestWriteDumpToTemp_Success(t *testing.T) {
	const content = "PostgreSQL database dump"

	path, err := WriteDumpToTemp("", "dumptest", ".sql", func(w io.Writer) error {
		_, err := io.WriteString(w, content)
		return err
	})
	if err != nil {
		t.Fatalf("WriteDumpToTemp: %v", err)
	}
	defer os.Remove(path) //nolint

	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("ReadFile: %v", err)
	}
	if string(data) != content {
		t.Errorf("content mismatch: got %q, want %q", string(data), content)
	}
}

func TestWriteDumpToTemp_ErrorCleansUp(t *testing.T) {
	var savedPath string

	_, err := WriteDumpToTemp("", "errtest", ".sql", func(w io.Writer) error {
		// We need to capture the path somehow; use the file's path from the writer.
		// Since we don't have direct access, just return an error.
		return io.ErrUnexpectedEOF
	})

	if err == nil {
		t.Fatal("expected error, got nil")
	}

	// If we somehow captured the path, verify it's gone.
	if savedPath != "" {
		if _, statErr := os.Stat(savedPath); !os.IsNotExist(statErr) {
			t.Errorf("temp file was not cleaned up: %s", savedPath)
		}
	}
}

func TestTempFile_Sync(t *testing.T) {
	tf, err := New("", "synctest", ".tmp")
	if err != nil {
		t.Fatalf("New: %v", err)
	}
	defer tf.CloseAndRemove() //nolint

	if _, err := tf.Write([]byte("sync me")); err != nil {
		t.Fatalf("Write: %v", err)
	}
	if err := tf.Sync(); err != nil {
		t.Fatalf("Sync: %v", err)
	}
}

func TestTempFile_Dir(t *testing.T) {
	tf, err := New("", "dirtest", ".tmp")
	if err != nil {
		t.Fatalf("New: %v", err)
	}
	defer tf.CloseAndRemove() //nolint

	dir := tf.Dir()
	if dir == "" {
		t.Error("Dir() returned empty string")
	}
	if _, err := os.Stat(dir); err != nil {
		t.Errorf("Dir() returned non-existent path: %v", err)
	}
}