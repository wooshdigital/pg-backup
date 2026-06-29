package tempfile

import (
	"fmt"
	"os"
)

// TempFile wraps an *os.File created in the OS temp directory and provides a
// Remove helper that closes and unlinks it.
type TempFile struct {
	*os.File
}

// New creates a temporary file in the default temp directory.
func New() (*TempFile, error) {
	f, err := os.CreateTemp("", "dbbackup-*.tmp")
	if err != nil {
		return nil, fmt.Errorf("create temp file: %w", err)
	}
	return &TempFile{File: f}, nil
}

// Remove closes and deletes the temporary file. Calling Remove more than once
// is safe; subsequent calls are no-ops.
func (t *TempFile) Remove() error {
	name := t.Name()
	_ = t.Close()
	if err := os.Remove(name); err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("remove temp file %q: %w", name, err)
	}
	return nil
}