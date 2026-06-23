// Package tempfile provides helpers for creating and safely cleaning up
// named temporary files.
package tempfile

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
)

// TempFile represents a named temporary file that can be used as an io.Writer
// and later renamed to its final destination or deleted.
type TempFile struct {
	f    *os.File
	path string
}

// New creates a new temporary file in the given directory with the given
// prefix. If dir is empty, os.TempDir() is used.
//
// The caller is responsible for calling either Commit or Discard when done.
func New(dir, prefix string) (*TempFile, error) {
	if dir == "" {
		dir = os.TempDir()
	}

	f, err := os.CreateTemp(dir, prefix+"*.tmp")
	if err != nil {
		return nil, fmt.Errorf("tempfile: create: %w", err)
	}

	return &TempFile{
		f:    f,
		path: f.Name(),
	}, nil
}

// Write implements io.Writer.
func (t *TempFile) Write(p []byte) (int, error) {
	return t.f.Write(p)
}

// Path returns the path to the temporary file.
func (t *TempFile) Path() string {
	return t.path
}

// File returns the underlying *os.File for direct access (e.g., Seek, Stat).
func (t *TempFile) File() *os.File {
	return t.f
}

// Sync flushes the file's contents to stable storage.
func (t *TempFile) Sync() error {
	if err := t.f.Sync(); err != nil {
		return fmt.Errorf("tempfile: sync: %w", err)
	}
	return nil
}

// Close closes the underlying file without deleting it.
// After Close, the file can still be committed or discarded by path.
func (t *TempFile) Close() error {
	if err := t.f.Close(); err != nil {
		return fmt.Errorf("tempfile: close: %w", err)
	}
	return nil
}

// Commit closes the file and renames it atomically to dest.
// On most Unix systems the rename is atomic as long as src and dest are on
// the same filesystem; for cross-device moves it falls back to a copy.
func (t *TempFile) Commit(dest string) error {
	if err := t.f.Sync(); err != nil {
		return fmt.Errorf("tempfile: sync before commit: %w", err)
	}
	if err := t.f.Close(); err != nil {
		return fmt.Errorf("tempfile: close before commit: %w", err)
	}

	// Ensure destination directory exists
	if err := os.MkdirAll(filepath.Dir(dest), 0o755); err != nil {
		return fmt.Errorf("tempfile: mkdir: %w", err)
	}

	// Attempt atomic rename first
	if err := os.Rename(t.path, dest); err != nil {
		// Fall back to copy if rename fails (e.g., cross-device)
		if copyErr := copyFile(t.path, dest); copyErr != nil {
			return fmt.Errorf("tempfile: commit (rename failed: %v; copy failed: %w)", err, copyErr)
		}
		// Remove the temp file since copy succeeded
		_ = os.Remove(t.path)
	}

	return nil
}

// Discard closes and removes the temporary file. It is safe to call even if
// the file has already been committed or closed.
func (t *TempFile) Discard() error {
	// Best-effort close; ignore error since file may already be closed.
	_ = t.f.Close()

	if err := os.Remove(t.path); err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("tempfile: discard: %w", err)
	}
	return nil
}

// Size returns the number of bytes written to the temp file.
func (t *TempFile) Size() (int64, error) {
	info, err := t.f.Stat()
	if err != nil {
		return 0, fmt.Errorf("tempfile: stat: %w", err)
	}
	return info.Size(), nil
}

// copyFile copies src to dst using io.Copy.
func copyFile(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()

	out, err := os.OpenFile(dst, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0o644)
	if err != nil {
		return err
	}
	defer func() {
		_ = out.Close()
	}()

	if _, err := io.Copy(out, in); err != nil {
		return err
	}
	return out.Sync()
}