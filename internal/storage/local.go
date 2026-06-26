package storage

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"
)

// LocalStorage implements StorageBackend by writing artifacts to the local filesystem.
// It is intended for development and testing use only.
type LocalStorage struct {
	// BaseDir is the root directory under which all keys are stored.
	BaseDir string
}

// NewLocalStorage creates a LocalStorage that writes files under baseDir.
// The directory is created if it does not already exist.
func NewLocalStorage(baseDir string) (*LocalStorage, error) {
	if baseDir == "" {
		return nil, fmt.Errorf("local storage: baseDir must not be empty")
	}
	if err := os.MkdirAll(baseDir, 0o750); err != nil {
		return nil, fmt.Errorf("local storage: failed to create base directory %q: %w", baseDir, err)
	}
	return &LocalStorage{BaseDir: baseDir}, nil
}

// Upload writes the contents of r to a file at <BaseDir>/<key>.
// Any intermediate directories implied by the key are created automatically.
func (l *LocalStorage) Upload(_ context.Context, key string, r io.Reader, _ int64) error {
	if key == "" {
		return fmt.Errorf("local storage: key must not be empty")
	}

	// Resolve the full destination path and guard against path traversal.
	destPath := filepath.Join(l.BaseDir, filepath.FromSlash(key))
	if !isSubPath(l.BaseDir, destPath) {
		return fmt.Errorf("local storage: key %q resolves outside base directory", key)
	}

	// Create parent directories as needed.
	if err := os.MkdirAll(filepath.Dir(destPath), 0o750); err != nil {
		return fmt.Errorf("local storage: failed to create directories for %q: %w", destPath, err)
	}

	f, err := os.Create(destPath)
	if err != nil {
		return fmt.Errorf("local storage: failed to create file %q: %w", destPath, err)
	}
	defer f.Close()

	if _, err := io.Copy(f, r); err != nil {
		return fmt.Errorf("local storage: failed to write to %q: %w", destPath, err)
	}

	return f.Sync()
}

// Close is a no-op for LocalStorage.
func (l *LocalStorage) Close() error {
	return nil
}

// Path returns the filesystem path for the given key.
func (l *LocalStorage) Path(key string) string {
	return filepath.Join(l.BaseDir, filepath.FromSlash(key))
}

// isSubPath reports whether child is within parent (inclusive).
func isSubPath(parent, child string) bool {
	parent = filepath.Clean(parent)
	child = filepath.Clean(child)
	if parent == child {
		return true
	}
	// Add a separator to prevent "parentdir" matching "parentdir-other".
	parentWithSep := parent + string(filepath.Separator)
	return len(child) > len(parentWithSep) && child[:len(parentWithSep)] == parentWithSep
}