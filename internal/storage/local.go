package storage

import (
	"context"
	"fmt"
	"io"
	"log/slog"
	"os"
	"path/filepath"
)

// LocalBackend implements Backend by writing files to a local directory.
// Useful for testing and local development.
type LocalBackend struct {
	baseDir string
}

// NewLocal creates a LocalBackend that stores files under baseDir.
func NewLocal(baseDir string) (*LocalBackend, error) {
	if err := os.MkdirAll(baseDir, 0o755); err != nil {
		return nil, fmt.Errorf("create base dir: %w", err)
	}
	return &LocalBackend{baseDir: baseDir}, nil
}

// Put writes the contents of r to a file at baseDir/key.
func (b *LocalBackend) Put(_ context.Context, key string, r io.Reader) (int64, error) {
	dest := filepath.Join(b.baseDir, key)
	if err := os.MkdirAll(filepath.Dir(dest), 0o755); err != nil {
		return 0, fmt.Errorf("create parent dirs: %w", err)
	}

	f, err := os.Create(dest)
	if err != nil {
		return 0, fmt.Errorf("create file: %w", err)
	}
	defer f.Close()

	n, err := io.Copy(f, r)
	if err != nil {
		return 0, fmt.Errorf("write file: %w", err)
	}

	slog.Debug("local storage: wrote file", "path", dest, "bytes", n)
	return n, nil
}