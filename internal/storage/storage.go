package storage

import (
	"context"
	"io"
)

// StorageBackend is the interface satisfied by every storage implementation.
type StorageBackend interface {
	// Upload streams data from r into the backend under the given key and
	// returns the number of bytes written.
	Upload(ctx context.Context, key string, r io.Reader) (int64, error)
}