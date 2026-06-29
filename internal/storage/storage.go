package storage

import (
	"context"
	"io"
)

// Backend is the interface that all storage backends must implement.
type Backend interface {
	// Put writes the contents of r to the given key and returns the number of
	// bytes written.
	Put(ctx context.Context, key string, r io.Reader) (int64, error)
}