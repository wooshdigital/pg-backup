package storage

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"
)

// LocalStorage is a StorageBackend that writes objects to the local
// filesystem.  It is intended for development and testing; it must not be
// used in production.
//
// The key is treated as a relative path beneath BaseDir.  Intermediate
// directories are created automatically.
type LocalStorage struct {
	// BaseDir is the root directory under which all objects are written.
	BaseDir string
}

// NewLocalStorage returns a LocalStorage rooted at baseDir.
// baseDir is created (with all parents) if it does not exist.
func NewLocalStorage(baseDir string) (*LocalStorage, error) {
	if baseDir == "" {
		return nil, fmt.Errorf("storage: LocalStorage baseDir must not be empty")
	}
	if err := os.MkdirAll(baseDir, 0o755); err != nil {
		return nil, fmt.Errorf("storage: creating base directory %q: %w", baseDir, err)
	}
	return &LocalStorage{BaseDir: baseDir}, nil
}

// Upload writes the content of r to BaseDir/key.
// Intermediate directories under BaseDir are created as needed.
// The context is checked for cancellation before the write begins.
func (ls *LocalStorage) Upload(ctx context.Context, key string, r io.Reader, _ int64) error {
	if err := ctx.Err(); err != nil {
		return fmt.Errorf("storage: upload cancelled: %w", err)
	}

	dest := filepath.Join(ls.BaseDir, filepath.FromSlash(key))

	// Ensure the parent directory exists.
	if err := os.MkdirAll(filepath.Dir(dest), 0o755); err != nil {
		return fmt.Errorf("storage: creating directory for key %q: %w", key, err)
	}

	f, err := os.Create(dest)
	if err != nil {
		return fmt.Errorf("storage: creating file %q: %w", dest, err)
	}

	_, copyErr := io.Copy(f, r)
	closeErr := f.Close()

	if copyErr != nil {
		// Best-effort removal of a partially written file.
		_ = os.Remove(dest)
		return fmt.Errorf("storage: writing to %q: %w", dest, copyErr)
	}
	if closeErr != nil {
		return fmt.Errorf("storage: closing %q: %w", dest, closeErr)
	}
	return nil
}

// Close is a no-op for LocalStorage; it exists to satisfy StorageBackend.
func (ls *LocalStorage) Close() error {
	return nil
}