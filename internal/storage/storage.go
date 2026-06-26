// Package storage provides interfaces and implementations for storing dump artifacts.
package storage

import (
	"context"
	"io"
)

// StorageBackend is the interface that wraps the basic Upload method.
// Implementations include S3Uploader and LocalStorage.
type StorageBackend interface {
	// Upload streams the content of r to the storage backend under the given key.
	// size is the total number of bytes in r; pass -1 if unknown (may disable multipart optimisations).
	Upload(ctx context.Context, key string, r io.Reader, size int64) error
}