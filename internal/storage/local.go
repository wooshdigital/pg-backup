package storage

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
)

// localBackend implements StorageBackend using the local filesystem.
// Intended for testing and development only.
type localBackend struct {
	root string
}

// NewLocal creates a StorageBackend that stores objects under root.
func NewLocal(root string) (StorageBackend, error) {
	if err := os.MkdirAll(root, 0o755); err != nil {
		return nil, fmt.Errorf("create local storage root %q: %w", root, err)
	}
	return &localBackend{root: root}, nil
}

func (b *localBackend) Upload(_ context.Context, key string, r io.Reader, _ int64) error {
	dst := filepath.Join(b.root, filepath.FromSlash(key))
	if err := os.MkdirAll(filepath.Dir(dst), 0o755); err != nil {
		return fmt.Errorf("mkdir for key %q: %w", key, err)
	}
	f, err := os.Create(dst)
	if err != nil {
		return fmt.Errorf("create file for key %q: %w", key, err)
	}
	defer f.Close()
	if _, err = io.Copy(f, r); err != nil {
		return fmt.Errorf("write key %q: %w", key, err)
	}
	return nil
}

func (b *localBackend) Delete(_ context.Context, key string) error {
	path := filepath.Join(b.root, filepath.FromSlash(key))
	if err := os.Remove(path); err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("delete key %q: %w", key, err)
	}
	return nil
}

func (b *localBackend) List(_ context.Context, prefix string) ([]string, error) {
	var keys []string
	err := filepath.WalkDir(b.root, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if d.IsDir() {
			return nil
		}
		rel, relErr := filepath.Rel(b.root, path)
		if relErr != nil {
			return relErr
		}
		key := filepath.ToSlash(rel)
		if strings.HasPrefix(key, prefix) {
			keys = append(keys, key)
		}
		return nil
	})
	if err != nil {
		return nil, fmt.Errorf("list local storage: %w", err)
	}
	return keys, nil
}