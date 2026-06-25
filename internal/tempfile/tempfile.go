// Package tempfile provides an atomic write-then-rename file primitive.
package tempfile

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
)

// TempFile writes data to a sibling temporary file and renames it to the
// final destination on Commit, providing atomic semantics on most OSes.
type TempFile struct {
	dest string
	f    *os.File
}

// New creates a TempFile targeting dest. The actual data is written to a
// temporary file in the same directory until Commit or Discard is called.
func New(dest string) (*TempFile, error) {
	if err := os.MkdirAll(filepath.Dir(dest), 0o755); err != nil {
		return nil, fmt.Errorf("tempfile: mkdir: %w", err)
	}
	f, err := os.CreateTemp(filepath.Dir(dest), ".tmp-dump-*")
	if err != nil {
		return nil, fmt.Errorf("tempfile: create: %w", err)
	}
	return &TempFile{dest: dest, f: f}, nil
}

// Write implements io.Writer.
func (t *TempFile) Write(p []byte) (int, error) {
	return t.f.Write(p)
}

// Commit flushes, syncs, closes the temp file and renames it to the
// destination. It returns the final file size.
func (t *TempFile) Commit() (int64, error) {
	if err := t.f.Sync(); err != nil {
		_ = t.f.Close()
		_ = os.Remove(t.f.Name())
		return 0, fmt.Errorf("tempfile: sync: %w", err)
	}

	info, err := t.f.Stat()
	if err != nil {
		_ = t.f.Close()
		_ = os.Remove(t.f.Name())
		return 0, fmt.Errorf("tempfile: stat: %w", err)
	}
	size := info.Size()

	if err := t.f.Close(); err != nil {
		_ = os.Remove(t.f.Name())
		return 0, fmt.Errorf("tempfile: close: %w", err)
	}

	if err := os.Rename(t.f.Name(), t.dest); err != nil {
		_ = os.Remove(t.f.Name())
		return 0, fmt.Errorf("tempfile: rename: %w", err)
	}

	return size, nil
}

// Discard closes and removes the temporary file without committing.
func (t *TempFile) Discard() error {
	_ = t.f.Close()
	return os.Remove(t.f.Name())
}

// Ensure TempFile implements io.Writer at compile time.
var _ io.Writer = (*TempFile)(nil)