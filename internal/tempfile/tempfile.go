// Package tempfile provides helpers for creating, using, and cleaning up
// temporary files safely.
package tempfile

import (
	"fmt"
	"io"
	"os"
)

// TempFile wraps an *os.File that was created in the system's temp directory.
// Call CleanupWithLog (or Cleanup) to remove the file from disk when done.
type TempFile struct {
	f *os.File
}

// New creates a new named temporary file. The pattern follows os.CreateTemp
// semantics: if pattern includes a "*", the random part replaces the "*".
//
// Example:
//
//	tf, err := tempfile.New("pgdump-*.sql")
func New(pattern string) (*TempFile, error) {
	f, err := os.CreateTemp("", pattern)
	if err != nil {
		return nil, fmt.Errorf("tempfile: creating temp file with pattern %q: %w", pattern, err)
	}
	return &TempFile{f: f}, nil
}

// NewInDir creates a new temp file inside the specified directory.
func NewInDir(dir, pattern string) (*TempFile, error) {
	f, err := os.CreateTemp(dir, pattern)
	if err != nil {
		return nil, fmt.Errorf("tempfile: creating temp file in %q with pattern %q: %w", dir, pattern, err)
	}
	return &TempFile{f: f}, nil
}

// File returns the underlying *os.File so callers can write to it directly or
// pass it to other APIs that accept io.Writer.
func (t *TempFile) File() *os.File { return t.f }

// Name returns the absolute path of the temporary file.
func (t *TempFile) Name() string { return t.f.Name() }

// ReadAll reads the entire content of the temp file from the beginning.
// It is safe to call ReadAll after writing; it seeks to the start first.
func (t *TempFile) ReadAll() ([]byte, error) {
	if _, err := t.f.Seek(0, io.SeekStart); err != nil {
		return nil, fmt.Errorf("tempfile: seeking to start: %w", err)
	}
	data, err := io.ReadAll(t.f)
	if err != nil {
		return nil, fmt.Errorf("tempfile: reading file: %w", err)
	}
	return data, nil
}

// Close closes the underlying file without removing it.
func (t *TempFile) Close() error {
	if err := t.f.Close(); err != nil {
		return fmt.Errorf("tempfile: closing %q: %w", t.f.Name(), err)
	}
	return nil
}

// Remove deletes the file from disk. It is safe to call Remove after Close.
func (t *TempFile) Remove() error {
	if err := os.Remove(t.f.Name()); err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("tempfile: removing %q: %w", t.f.Name(), err)
	}
	return nil
}

// Cleanup closes the file (if still open) and removes it from disk.
// Any error is silently discarded. Use CleanupWithLog in tests to surface
// cleanup failures.
func (t *TempFile) Cleanup() {
	_ = t.f.Close()
	_ = os.Remove(t.f.Name())
}

// CleanupWithLog closes and removes the temp file, calling logFn with a
// message if either operation fails. Designed for use in test teardown.
//
//	defer tf.CleanupWithLog(func(msg string) { t.Log(msg) })
func (t *TempFile) CleanupWithLog(logFn func(string)) {
	if err := t.f.Close(); err != nil && !isClosedError(err) {
		logFn(fmt.Sprintf("tempfile: warning: closing %q: %v", t.f.Name(), err))
	}
	if err := os.Remove(t.f.Name()); err != nil && !os.IsNotExist(err) {
		logFn(fmt.Sprintf("tempfile: warning: removing %q: %v", t.f.Name(), err))
	}
}

// isClosedError reports whether err indicates the file is already closed.
func isClosedError(err error) bool {
	return err != nil && err.Error() == "close "+": file already closed"
}