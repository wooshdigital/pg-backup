package storage

import (
	"context"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
)

// LocalStorage implements StorageBackend by writing files to the local filesystem.
// It is intended for development and testing; not for production use.
type LocalStorage struct {
	// BaseDir is the root directory under which all files are written.
	BaseDir string
}

// NewLocalStorage creates a new LocalStorage that stores files under baseDir.
// baseDir is created (including parents) if it does not already exist.
func NewLocalStorage(baseDir string) (*LocalStorage, error) {
	if baseDir == "" {
		return nil, fmt.Errorf("storage: local base directory must not be empty")
	}
	if err := os.MkdirAll(baseDir, 0o755); err != nil {
		return nil, fmt.Errorf("storage: failed to create local storage directory %q: %w", baseDir, err)
	}
	return &LocalStorage{BaseDir: baseDir}, nil
}

// Upload writes the content of r to a file at <BaseDir>/<key>.
// Any intermediate directories implied by key are created automatically.
// size is accepted for interface compatibility but is not used.
func (l *LocalStorage) Upload(_ context.Context, key string, r io.Reader, size int64) error {
	dest := filepath.Join(l.BaseDir, filepath.FromSlash(key))

	// Ensure the parent directory exists.
	if err := os.MkdirAll(filepath.Dir(dest), 0o755); err != nil {
		return fmt.Errorf("storage: failed to create directory for key %q: %w", key, err)
	}

	f, err := os.Create(dest)
	if err != nil {
		return fmt.Errorf("storage: failed to create local file %q: %w", dest, err)
	}
	defer f.Close()

	written, err := io.Copy(f, r)
	if err != nil {
		return fmt.Errorf("storage: failed to write local file %q: %w", dest, err)
	}

	log.Printf("storage: local upload complete – path=%s bytes=%d", dest, written)
	return nil
}