package storage

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"
)

// LocalBackend stores backup files on the local filesystem.
// Primarily useful for development and testing without cloud credentials.
type LocalBackend struct {
	baseDir string
}

// NewLocalBackend creates a LocalBackend that stores files under baseDir.
func NewLocalBackend(baseDir string) (*LocalBackend, error) {
	if err := os.MkdirAll(baseDir, 0o755); err != nil {
		return nil, fmt.Errorf("create base dir %q: %w", baseDir, err)
	}
	return &LocalBackend{baseDir: baseDir}, nil
}

// Upload copies r to a file at <baseDir>/<key>, creating parent directories
// as needed, and returns the number of bytes written.
func (b *LocalBackend) Upload(_ context.Context, key string, r io.Reader) (int64, error) {
	dest := filepath.Join(b.baseDir, filepath.FromSlash(key))
	if err := os.MkdirAll(filepath.Dir(dest), 0o755); err != nil {
		return 0, fmt.Errorf("create parent dirs for %q: %w", dest, err)
	}

	f, err := os.Create(dest)
	if err != nil {
		return 0, fmt.Errorf("create file %q: %w", dest, err)
	}
	defer f.Close()

	n, err := io.Copy(f, r)
	if err != nil {
		return 0, fmt.Errorf("write file %q: %w", dest, err)
	}
	return n, nil
}