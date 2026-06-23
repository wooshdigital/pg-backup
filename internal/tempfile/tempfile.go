// Package tempfile provides helpers for creating and managing temporary files
// that are safely cleaned up after use.
package tempfile

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
)

// TempFile represents a temporary file that can be written to and later
// cleaned up or persisted.
type TempFile struct {
	f    *os.File
	path string
}

// New creates a new temporary file in dir with the given prefix and suffix.
// If dir is empty, os.TempDir() is used. The caller must call Close or
// CloseAndRemove when done.
func New(dir, prefix, suffix string) (*TempFile, error) {
	if dir == "" {
		dir = os.TempDir()
	}

	// os.CreateTemp does not support suffix; use our own approach.
	f, err := os.CreateTemp(dir, prefix+"*"+suffix)
	if err != nil {
		return nil, fmt.Errorf("creating temp file: %w", err)
	}

	return &TempFile{
		f:    f,
		path: f.Name(),
	}, nil
}

// Write writes p to the temporary file.
func (t *TempFile) Write(p []byte) (int, error) {
	return t.f.Write(p)
}

// Path returns the absolute path to the temporary file.
func (t *TempFile) Path() string {
	return t.path
}

// File returns the underlying *os.File.
func (t *TempFile) File() *os.File {
	return t.f
}

// Close closes the underlying file without removing it.
// After Close, the file can be read by other processes.
func (t *TempFile) Close() error {
	if err := t.f.Close(); err != nil {
		return fmt.Errorf("closing temp file %s: %w", t.path, err)
	}
	return nil
}

// CloseAndRemove closes and deletes the temporary file.
func (t *TempFile) CloseAndRemove() error {
	closeErr := t.f.Close()
	removeErr := os.Remove(t.path)

	if closeErr != nil && removeErr != nil {
		return fmt.Errorf("closing (%v) and removing (%v) temp file %s", closeErr, removeErr, t.path)
	}
	if closeErr != nil {
		return fmt.Errorf("closing temp file %s: %w", t.path, closeErr)
	}
	if removeErr != nil && !os.IsNotExist(removeErr) {
		return fmt.Errorf("removing temp file %s: %w", t.path, removeErr)
	}
	return nil
}

// Sync flushes the file's data to stable storage.
func (t *TempFile) Sync() error {
	return t.f.Sync()
}

// Size returns the current size of the temp file in bytes.
func (t *TempFile) Size() (int64, error) {
	info, err := t.f.Stat()
	if err != nil {
		return 0, fmt.Errorf("stating temp file %s: %w", t.path, err)
	}
	return info.Size(), nil
}

// WriteDumpToTemp is a convenience function that creates a temporary file,
// calls write(f) to populate it, syncs, and closes it. On error the file is
// removed. On success the path is returned.
func WriteDumpToTemp(dir, prefix, suffix string, write func(w io.Writer) error) (path string, err error) {
	tf, err := New(dir, prefix, suffix)
	if err != nil {
		return "", err
	}

	defer func() {
		if err != nil {
			_ = tf.CloseAndRemove()
		}
	}()

	if err = write(tf); err != nil {
		return "", fmt.Errorf("writing to temp file: %w", err)
	}
	if err = tf.Sync(); err != nil {
		return "", err
	}
	if err = tf.Close(); err != nil {
		return "", err
	}
	return tf.Path(), nil
}

// Dir returns the directory containing the temporary file.
func (t *TempFile) Dir() string {
	return filepath.Dir(t.path)
}