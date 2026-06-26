// Package storage provides a pluggable interface for uploading backup artifacts.
package storage

import (
	"context"
	"io"
)

// StorageBackend is the primary interface implemented by every backend (S3,
// local filesystem, etc.).  Upload streams r (of the given size in bytes) to
// the destination identified by key.  Implementations must be safe to call
// from multiple goroutines.
type StorageBackend interface {
	// Upload writes the content of r to the storage destination under key.
	// size is the total byte count of r; some backends (e.g. S3 multipart)
	// require it up front.  Pass -1 when the size is unknown.
	Upload(ctx context.Context, key string, r io.Reader, size int64) error

	// Close releases any resources held by the backend.
	Close() error
}