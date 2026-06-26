// Package storage provides the StorageBackend interface and implementations
// for uploading database backup artifacts to various destinations.
package storage

import (
	"context"
	"io"
)

// StorageBackend is the common interface for all storage implementations.
// Callers supply the destination key, a reader over the data, and the
// total size in bytes (used to optimise multipart uploads; pass -1 when
// the size is unknown).
type StorageBackend interface {
	// Upload writes the contents of r to the given key.
	// size is the total byte count of r, or -1 if unknown.
	Upload(ctx context.Context, key string, r io.Reader, size int64) error

	// Delete removes the object at key. Implementations should return nil
	// if the object did not exist (idempotent delete).
	Delete(ctx context.Context, key string) error

	// Exists reports whether an object with the given key exists.
	Exists(ctx context.Context, key string) (bool, error)
}