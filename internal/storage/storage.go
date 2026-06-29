package storage

import (
	"context"
	"fmt"
	"io"
	"time"
)

// Backend defines the interface for backup storage providers.
type Backend interface {
	// Upload writes the content of r to the given key and returns the number of bytes written.
	Upload(ctx context.Context, key string, r io.Reader) (int64, error)
	// Download retrieves the object at key and writes it to w.
	Download(ctx context.Context, key string, w io.Writer) error
	// List returns all object keys in the backend.
	List(ctx context.Context) ([]string, error)
	// Delete removes the object at key.
	Delete(ctx context.Context, key string) error
}

// GenerateKey generates a time-stamped storage key for a backup.
// The extension should include a leading dot, e.g. ".sql.gz".
func GenerateKey(extension string) string {
	now := time.Now().UTC()
	return fmt.Sprintf("backups/%d/%02d/%02d/%s%s",
		now.Year(), now.Month(), now.Day(),
		now.Format("20060102T150405Z"),
		extension,
	)
}