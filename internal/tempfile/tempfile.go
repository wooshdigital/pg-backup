package tempfile

import (
	"fmt"
	"os"
)

// TempFile wraps an *os.File created in the system's temp directory.
type TempFile struct {
	f    *os.File
	path string
}

// New creates a new temporary file.
func New() (*TempFile, error) {
	f, err := os.CreateTemp("", "pgbackup-*.sql.gz")
	if err != nil {
		return nil, fmt.Errorf("create temp file: %w", err)
	}
	return &TempFile{f: f, path: f.Name()}, nil
}

// File returns the underlying *os.File.
func (t *TempFile) File() *os.File {
	return t.f
}

// Path returns the file system path of the temp file.
func (t *TempFile) Path() string {
	return t.path
}

// Remove closes and deletes the temp file.
func (t *TempFile) Remove() error {
	if err := t.f.Close(); err != nil {
		// Ignore close errors on already-closed files.
		_ = err
	}
	if err := os.Remove(t.path); err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("remove temp file %s: %w", t.path, err)
	}
	return nil
}