package tempfile

import (
	"fmt"
	"os"
)

// TempFile wraps an *os.File that lives in the system temp directory and
// provides a convenient Remove helper.
type TempFile struct {
	f *os.File
}

// New creates a new temporary file.
func New() (*TempFile, error) {
	f, err := os.CreateTemp("", "pgbackup-*.tmp")
	if err != nil {
		return nil, fmt.Errorf("create temp file: %w", err)
	}
	return &TempFile{f: f}, nil
}

// File returns the underlying *os.File.
func (t *TempFile) File() *os.File {
	return t.f
}

// Path returns the filesystem path of the temp file.
func (t *TempFile) Path() string {
	return t.f.Name()
}

// Remove closes and deletes the temp file.  It is safe to call multiple times.
func (t *TempFile) Remove() error {
	if t.f == nil {
		return nil
	}
	name := t.f.Name()
	_ = t.f.Close()
	t.f = nil
	return os.Remove(name)
}