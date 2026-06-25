package tempfile_test

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/your-org/dbworker/internal/tempfile"
)

func TestCommit(t *testing.T) {
	dir := t.TempDir()
	dest := filepath.Join(dir, "out.txt")

	tf, err := tempfile.New(dest)
	if err != nil {
		t.Fatal(err)
	}

	data := []byte("hello, world")
	if _, err := tf.Write(data); err != nil {
		t.Fatal(err)
	}

	size, err := tf.Commit()
	if err != nil {
		t.Fatal(err)
	}

	if size != int64(len(data)) {
		t.Errorf("size: want %d got %d", len(data), size)
	}

	got, err := os.ReadFile(dest)
	if err != nil {
		t.Fatal(err)
	}
	if string(got) != string(data) {
		t.Errorf("content mismatch")
	}
}

func TestDiscard(t *testing.T) {
	dir := t.TempDir()
	dest := filepath.Join(dir, "out.txt")

	tf, err := tempfile.New(dest)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := tf.Write([]byte("data")); err != nil {
		t.Fatal(err)
	}
	if err := tf.Discard(); err != nil {
		t.Fatal(err)
	}

	if _, err := os.Stat(dest); !os.IsNotExist(err) {
		t.Error("expected destination file to not exist after Discard")
	}
}

func TestMkdirAll(t *testing.T) {
	dir := t.TempDir()
	dest := filepath.Join(dir, "nested", "deep", "out.txt")

	tf, err := tempfile.New(dest)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := tf.Commit(); err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(dest); err != nil {
		t.Errorf("expected file at %s: %v", dest, err)
	}
}