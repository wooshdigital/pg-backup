package storage

import (
	"context"
	"io"
)

// StorageBackend abstracts object-storage operations needed by the backup job.
type StorageBackend interface {
	// Upload writes r to the given key. size is the content length in bytes;
	// pass -1 if unknown (e.g. streaming).
	Upload(ctx context.Context, key string, r io.Reader, size int64) error

	// Delete removes the object at key.
	Delete(ctx context.Context, key string) error

	// List returns keys that share the given prefix.
	List(ctx context.Context, prefix string) ([]string, error)
}