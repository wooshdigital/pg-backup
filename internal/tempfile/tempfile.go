// Package tempfile provides a helper for writing to a temporary file and
// atomically committing it to a final path.
package tempfile

import (
	"fmt"
	"os"
	"path/filepath"
)

// TempFile wraps an *os.File and adds Commit / Cleanup helpers.
type TempFile struct {
	*os.File
	committed bool
}

// New creates a temporary file in dir using the given pattern (passed directly
// to os.CreateTemp). The caller must call either Commit or Cleanup when done.
func New(dir, pattern string) (*TempFile, error) {
	if err := os.MkdirAll(dir, 0o750); err != nil {
		return nil, fmt.Errorf("tempfile: mkdir %q: %w", dir, err)
	}

	f, err := os.CreateTemp(dir, pattern)
	if err != nil {
		return nil, fmt.Errorf("tempfile: create: %w", err)
	}

	return &TempFile{File: f}, nil
}

// Commit closes the file and atomically renames it to dst.
// dst must be on the same file system as the temp file (same directory).
func (t *TempFile) Commit(dst string) error {
	if err := t.File.Close(); err != nil {
		return fmt.Errorf("tempfile: close before commit: %w", err)
	}

	// Ensure the destination directory exists.
	if err := os.MkdirAll(filepath.Dir(dst), 0o750); err != nil {
		return fmt.Errorf("tempfile: mkdir for dst: %w", err)
	}

	if err := os.Rename(t.File.Name(), dst); err != nil {
		return fmt.Errorf("tempfile: rename to %q: %w", dst, err)
	}

	t.committed = true
	return nil
}

// Cleanup removes the temp file if it has not been committed.
// It is safe to call Cleanup after a successful Commit (it becomes a no-op).
func (t *TempFile) Cleanup() {
	if t.committed {
		return
	}
	// Best-effort close – ignore errors because the file may already be closed.
	_ = t.File.Close()
	_ = os.Remove(t.File.Name())
}