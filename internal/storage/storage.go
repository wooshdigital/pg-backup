package storage

import (
	"context"
	"io"
)

// Backend is the interface that storage backends must implement.
type Backend interface {
	// Upload streams r to the backend under the given key and returns bytes written.
	Upload(ctx context.Context, key string, r io.Reader) (int64, error)
}