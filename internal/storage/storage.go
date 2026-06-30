package storage

import (
	"context"
	"io"
)

// StorageBackend is the interface implemented by every storage provider.
type StorageBackend interface {
	// Upload stores the content from r under key and returns the resolved key,
	// the number of bytes written, and any error.
	Upload(ctx context.Context, key string, r io.Reader) (string, int64, error)

	// Delete removes the object identified by key.
	Delete(ctx context.Context, key string) error

	// List returns all object keys that share the given prefix.
	List(ctx context.Context, prefix string) ([]string, error)
}