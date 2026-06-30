package tempfile

import (
	"fmt"
	"os"
)

// TempFile wraps an *os.File and tracks its path for easy cleanup.
type TempFile struct {
	file *os.File
	path string
}

// New creates a new temporary file in the default temp directory.
func New() (*TempFile, error) {
	f, err := os.CreateTemp("", "pg-backup-*.tmp")
	if err != nil {
		return nil, fmt.Errorf("create temp file: %w", err)
	}
	return &TempFile{file: f, path: f.Name()}, nil
}

// File returns the underlying *os.File.
func (t *TempFile) File() *os.File {
	return t.file
}

// Path returns the absolute path of the temporary file.
func (t *TempFile) Path() string {
	return t.path
}

// Remove closes and deletes the temporary file.
func (t *TempFile) Remove() error {
	if err := t.file.Close(); err != nil {
		// Ignore close errors if the file is already closed.
		_ = os.Remove(t.path)
		return fmt.Errorf("close temp file: %w", err)
	}
	if err := os.Remove(t.path); err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("remove temp file %q: %w", t.path, err)
	}
	return nil
}