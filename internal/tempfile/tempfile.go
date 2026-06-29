package tempfile

import (
	"fmt"
	"os"
)

// TempFile wraps an *os.File that can be cleaned up easily.
type TempFile struct {
	file *os.File
}

// New creates a new temporary file.
func New() (*TempFile, error) {
	f, err := os.CreateTemp("", "backup-*.tmp")
	if err != nil {
		return nil, fmt.Errorf("create temp file: %w", err)
	}
	return &TempFile{file: f}, nil
}

// File returns the underlying *os.File.
func (t *TempFile) File() *os.File {
	return t.file
}

// Remove closes and deletes the temp file.
func (t *TempFile) Remove() error {
	name := t.file.Name()
	if err := t.file.Close(); err != nil {
		return fmt.Errorf("close temp file: %w", err)
	}
	if err := os.Remove(name); err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("remove temp file: %w", err)
	}
	return nil
}