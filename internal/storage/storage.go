// Package storage provides a pluggable backend interface for storing database
// backup artifacts. Implementations include an AWS S3 backend and a local
// filesystem backend suitable for development and testing.
package storage

import (
	"context"
	"io"
)

// StorageBackend is the interface that every storage implementation must satisfy.
//
// Upload streams the content of r (of the given size in bytes) to the
// backend under the supplied key. Implementations are expected to handle
// retry / error recovery internally; callers should treat a returned error
// as a final failure.
type StorageBackend interface {
	// Upload writes the data from r to the backend under key.
	// size is the total byte count of r; backends may use it for
	// Content-Length or progress reporting. Pass -1 if unknown.
	Upload(ctx context.Context, key string, r io.Reader, size int64) error

	// Close releases any resources held by the backend (e.g. SDK clients).
	// It is safe to call Close multiple times.
	Close() error
}