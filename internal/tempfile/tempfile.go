package tempfile

import (
	"fmt"
	"os"
	"path/filepath"
)

// TempFile wraps an *os.File created in a specific directory and supports
// atomic commit (rename) to a final destination path.
type TempFile struct {
	f    *os.File
	path string
}

// New creates a new temporary file in dir with the given pattern.
func New(dir, pattern string) (*TempFile, error) {
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return nil, fmt.Errorf("tempfile: mkdir %s: %w", dir, err)
	}
	f, err := os.CreateTemp(dir, pattern)
	if err != nil {
		return nil, fmt.Errorf("tempfile: create: %w", err)
	}
	return &TempFile{f: f, path: f.Name()}, nil
}

// File returns the underlying *os.File for writing.
func (t *TempFile) File() *os.File {
	return t.f
}

// Path returns the current path of the temp file.
func (t *TempFile) Path() string {
	return t.path
}

// Commit closes the temp file and renames it to dst.
// The destination directory is created if it does not exist.
func (t *TempFile) Commit(dst string) error {
	if err := t.f.Sync(); err != nil {
		return fmt.Errorf("tempfile: sync: %w", err)
	}
	if err := t.f.Close(); err != nil {
		return fmt.Errorf("tempfile: close: %w", err)
	}
	if err := os.MkdirAll(filepath.Dir(dst), 0o755); err != nil {
		return fmt.Errorf("tempfile: mkdir dst: %w", err)
	}
	if err := os.Rename(t.path, dst); err != nil {
		return fmt.Errorf("tempfile: rename to %s: %w", dst, err)
	}
	return nil
}

// Cleanup removes the temp file if it still exists. Safe to call after Commit.
func (t *TempFile) Cleanup() error {
	_ = t.f.Close() // ignore close error on cleanup
	if err := os.Remove(t.path); err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("tempfile: cleanup %s: %w", t.path, err)
	}
	return nil
}