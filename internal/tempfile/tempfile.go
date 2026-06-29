package tempfile

import (
	"fmt"
	"io"
	"os"
)

// TempFile wraps an *os.File with convenience methods for backup use.
type TempFile struct {
	f *os.File
}

// New creates a new temporary file with the given pattern.
// The caller is responsible for calling Remove() when done.
func New(pattern string) (*TempFile, error) {
	f, err := os.CreateTemp("", pattern)
	if err != nil {
		return nil, fmt.Errorf("create temp file: %w", err)
	}
	return &TempFile{f: f}, nil
}

// Write implements io.Writer.
func (t *TempFile) Write(p []byte) (int, error) {
	return t.f.Write(p)
}

// Read implements io.Reader.
func (t *TempFile) Read(p []byte) (int, error) {
	return t.f.Read(p)
}

// Seek resets the file pointer to the beginning.
func (t *TempFile) Seek() error {
	_, err := t.f.Seek(0, io.SeekStart)
	return err
}

// Path returns the file's path on disk.
func (t *TempFile) Path() string {
	return t.f.Name()
}

// Remove closes and deletes the temporary file.
func (t *TempFile) Remove() error {
	name := t.f.Name()
	if err := t.f.Close(); err != nil {
		return fmt.Errorf("close temp file: %w", err)
	}
	if err := os.Remove(name); err != nil {
		return fmt.Errorf("remove temp file: %w", err)
	}
	return nil
}

// Size returns the current size of the file.
func (t *TempFile) Size() (int64, error) {
	info, err := t.f.Stat()
	if err != nil {
		return 0, err
	}
	return info.Size(), nil
}