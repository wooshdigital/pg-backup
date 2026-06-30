package storage

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"

	"github.com/ssoready/conf/internal/config"
)

type localBackend struct {
	dir string
}

func newLocalBackend(cfg *config.Config) (*localBackend, error) {
	dir := cfg.Storage.LocalPath
	if dir == "" {
		dir = "."
	}
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, fmt.Errorf("create local storage dir %q: %w", dir, err)
	}
	return &localBackend{dir: dir}, nil
}

func (l *localBackend) Put(_ context.Context, r io.Reader) (string, error) {
	key := GenerateKey(".gz")
	dst := filepath.Join(l.dir, filepath.Base(key))

	f, err := os.Create(dst)
	if err != nil {
		return "", fmt.Errorf("create file %q: %w", dst, err)
	}
	defer f.Close()

	if _, err = io.Copy(f, r); err != nil {
		return "", fmt.Errorf("write file %q: %w", dst, err)
	}
	return key, nil
}