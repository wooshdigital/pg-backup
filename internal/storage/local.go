package storage

import (
	"context"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
)

// LocalStorage implements StorageBackend using the local filesystem.
// It is intended for development and testing scenarios where a real S3
// bucket is not available.
type LocalStorage struct {
	// baseDir is the root directory under which all objects are stored.
	baseDir string
}

// NewLocalStorage creates a new LocalStorage rooted at baseDir.
// The directory is created if it does not already exist.
func NewLocalStorage(baseDir string) (*LocalStorage, error) {
	if baseDir == "" {
		return nil, fmt.Errorf("local storage: baseDir must not be empty")
	}
	if err := os.MkdirAll(baseDir, 0o755); err != nil {
		return nil, fmt.Errorf("local storage: creating base directory %q: %w", baseDir, err)
	}
	return &LocalStorage{baseDir: baseDir}, nil
}

// Upload writes the contents of r to a file at <baseDir>/<key>.
// Intermediate directories are created automatically.
// size is accepted for interface compatibility but is not used.
func (l *LocalStorage) Upload(_ context.Context, key string, r io.Reader, _ int64) error {
	if key == "" {
		return fmt.Errorf("local storage: key must not be empty")
	}

	dest := filepath.Join(l.baseDir, filepath.FromSlash(key))

	// Create parent directories.
	if err := os.MkdirAll(filepath.Dir(dest), 0o755); err != nil {
		return fmt.Errorf("local storage: creating parent directory for %q: %w", dest, err)
	}

	f, err := os.OpenFile(dest, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0o644)
	if err != nil {
		return fmt.Errorf("local storage: creating file %q: %w", dest, err)
	}

	if _, err = io.Copy(f, r); err != nil {
		_ = f.Close()
		return fmt.Errorf("local storage: writing to %q: %w", dest, err)
	}

	if err = f.Close(); err != nil {
		return fmt.Errorf("local storage: closing %q: %w", dest, err)
	}
	return nil
}

// Delete removes the file at <baseDir>/<key>. Returns nil if the file did not exist.
func (l *LocalStorage) Delete(_ context.Context, key string) error {
	if key == "" {
		return fmt.Errorf("local storage: key must not be empty")
	}
	dest := filepath.Join(l.baseDir, filepath.FromSlash(key))
	if err := os.Remove(dest); err != nil && !errors.Is(err, os.ErrNotExist) {
		return fmt.Errorf("local storage: deleting %q: %w", dest, err)
	}
	return nil
}

// Exists reports whether a file exists at <baseDir>/<key>.
func (l *LocalStorage) Exists(_ context.Context, key string) (bool, error) {
	if key == "" {
		return false, fmt.Errorf("local storage: key must not be empty")
	}
	dest := filepath.Join(l.baseDir, filepath.FromSlash(key))
	_, err := os.Stat(dest)
	if err == nil {
		return true, nil
	}
	if errors.Is(err, os.ErrNotExist) {
		return false, nil
	}
	return false, fmt.Errorf("local storage: stat %q: %w", dest, err)
}

// BaseDir returns the root directory used by this LocalStorage instance.
func (l *LocalStorage) BaseDir() string {
	return l.baseDir
}