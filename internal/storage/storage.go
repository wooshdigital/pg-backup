// Package storage provides a StorageBackend interface and implementations
// for uploading database dump artifacts to various backends (S3, local filesystem).
package storage

import (
	"context"
	"io"
)

// StorageBackend defines the interface for uploading dump artifacts.
// Any backend (S3, local filesystem, GCS, etc.) must satisfy this interface.
type StorageBackend interface {
	// Upload streams r (of the given size in bytes) to the backend under key.
	// A size of -1 indicates the size is unknown; the backend should handle this
	// gracefully (e.g., by buffering or using chunked encoding).
	Upload(ctx context.Context, key string, r io.Reader, size int64) error

	// Close releases any resources held by the backend (connections, etc.).
	Close() error
}