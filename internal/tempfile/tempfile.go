package tempfile

import (
	"fmt"
	"io"
	"os"
)

// TempFile wraps an *os.File and provides a Remove method to clean it up.
type TempFile struct {
	*os.File
}

// New creates a new temporary file in the default temp directory.
func New() (*TempFile, error) {
	f, err := os.CreateTemp("", "pgbackup-*.tmp")
	if err != nil {
		return nil, fmt.Errorf("create temp file: %w", err)
	}
	return &TempFile{File: f}, nil
}

// Remove closes and deletes the temporary file.
func (t *TempFile) Remove() error {
	name := t.Name()
	if err := t.Close(); err != nil {
		// Ignore close errors on already-closed files.
		_ = os.Remove(name)
		return nil
	}
	return os.Remove(name)
}

// Ensure TempFile satisfies io.ReadWriteSeeker.
var _ io.ReadWriteSeeker = (*TempFile)(nil)