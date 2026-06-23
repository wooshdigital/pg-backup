// Package tempfile provides helpers for creating and managing temporary files
// for database dump operations.
package tempfile

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
)

// TempFile represents a temporary file that can be written to and then
// either persisted (moved to a final destination) or cleaned up.
type TempFile struct {
	f    *os.File
	path string
}

// New creates a new temporary file in dir with the given prefix and suffix.
// If dir is empty the system default temporary directory is used.
//
// The caller is responsible for calling either Persist or Cleanup (or Close
// followed by one of those) when done with the file.
func New(dir, prefix, suffix string) (*TempFile, error) {
	if dir != "" {
		if err := os.MkdirAll(dir, 0o750); err != nil {
			return nil, fmt.Errorf("tempfile: create directory %q: %w", dir, err)
		}
	}

	f, err := os.CreateTemp(dir, prefix+"*"+suffix)
	if err != nil {
		return nil, fmt.Errorf("tempfile: create temp file: %w", err)
	}

	return &TempFile{f: f, path: f.Name()}, nil
}

// Write implements io.Writer, writing data to the underlying temp file.
func (t *TempFile) Write(p []byte) (int, error) {
	n, err := t.f.Write(p)
	if err != nil {
		return n, fmt.Errorf("tempfile: write: %w", err)
	}
	return n, nil
}

// Path returns the absolute path of the temporary file.
func (t *TempFile) Path() string {
	return t.path
}

// Size returns the current size of the temporary file in bytes.
func (t *TempFile) Size() (int64, error) {
	info, err := t.f.Stat()
	if err != nil {
		return 0, fmt.Errorf("tempfile: stat: %w", err)
	}
	return info.Size(), nil
}

// Close closes the underlying file handle without removing the file.
// It is safe to call Close multiple times.
func (t *TempFile) Close() error {
	if t.f == nil {
		return nil
	}
	err := t.f.Close()
	t.f = nil
	if err != nil {
		return fmt.Errorf("tempfile: close: %w", err)
	}
	return nil
}

// Persist moves the temporary file to dst.
// The file handle is closed first if it is still open.
// On success the TempFile must not be used further.
func (t *TempFile) Persist(dst string) error {
	if err := t.Close(); err != nil {
		return err
	}

	// Ensure the destination directory exists.
	dstDir := filepath.Dir(dst)
	if err := os.MkdirAll(dstDir, 0o750); err != nil {
		return fmt.Errorf("tempfile: create destination directory %q: %w", dstDir, err)
	}

	// os.Rename is atomic on the same filesystem.
	if err := os.Rename(t.path, dst); err != nil {
		// Fall back to a copy + delete if rename fails (cross-device).
		if copyErr := copyFile(t.path, dst); copyErr != nil {
			return fmt.Errorf("tempfile: persist (rename failed: %v; copy failed: %w)", err, copyErr)
		}
		_ = os.Remove(t.path)
	}

	t.path = dst
	return nil
}

// Cleanup removes the temporary file and closes the handle if open.
// It is safe to call Cleanup after Persist (the destination file is not removed).
// It is safe to call Cleanup multiple times.
func (t *TempFile) Cleanup() error {
	_ = t.Close() // best-effort close
	if t.path == "" {
		return nil
	}
	if err := os.Remove(t.path); err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("tempfile: cleanup %q: %w", t.path, err)
	}
	return nil
}

// Reader returns a new *os.File opened for reading the temp file.
// The caller is responsible for closing the returned file.
func (t *TempFile) Reader() (*os.File, error) {
	r, err := os.Open(t.path)
	if err != nil {
		return nil, fmt.Errorf("tempfile: open for reading: %w", err)
	}
	return r, nil
}

// copyFile copies src to dst using io.Copy. Used as a fallback for cross-device
// renames.
func copyFile(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()

	out, err := os.OpenFile(dst, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0o640)
	if err != nil {
		return err
	}

	if _, err := io.Copy(out, in); err != nil {
		out.Close()
		os.Remove(dst)
		return err
	}

	return out.Close()
}