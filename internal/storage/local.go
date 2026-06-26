package storage

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"
)

// LocalStorage implements StorageBackend by writing files to the local
// filesystem. It is intended for development and testing only.
type LocalStorage struct {
	baseDir string
}

// NewLocalStorage creates a LocalStorage that writes under baseDir.
// The directory is created (with MkdirAll) if it does not already exist.
func NewLocalStorage(baseDir string) (*LocalStorage, error) {
	if err := os.MkdirAll(baseDir, 0o750); err != nil {
		return nil, fmt.Errorf("local storage: creating base dir %q: %w", baseDir, err)
	}
	return &LocalStorage{baseDir: baseDir}, nil
}

// Upload writes the content of r to <baseDir>/<key>.
// Intermediate directories under key are created automatically.
// size is ignored by this implementation.
func (l *LocalStorage) Upload(_ context.Context, key string, r io.Reader, _ int64) error {
	dest := filepath.Join(l.baseDir, filepath.FromSlash(key))

	if err := os.MkdirAll(filepath.Dir(dest), 0o750); err != nil {
		return fmt.Errorf("local storage: creating directories for %q: %w", dest, err)
	}

	f, err := os.OpenFile(dest, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0o640)
	if err != nil {
		return fmt.Errorf("local storage: creating file %q: %w", dest, err)
	}
	defer f.Close()

	if _, err := io.Copy(f, r); err != nil {
		return fmt.Errorf("local storage: writing to %q: %w", dest, err)
	}

	if err := f.Sync(); err != nil {
		return fmt.Errorf("local storage: syncing %q: %w", dest, err)
	}

	return nil
}

// Close is a no-op for LocalStorage.
func (l *LocalStorage) Close() error {
	return nil
}

// Ensure LocalStorage satisfies the StorageBackend interface at compile time.
var _ StorageBackend = (*LocalStorage)(nil)