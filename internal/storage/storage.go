package storage

import (
	"context"
	"fmt"
	"io"

	"github.com/ssoready/conf/internal/config"
)

// Backend is the interface for uploading backup files.
type Backend interface {
	// Put uploads the content from r and returns a storage key.
	Put(ctx context.Context, r io.Reader) (key string, err error)
}

// New constructs a storage Backend based on the provided configuration.
func New(ctx context.Context, cfg *config.Config) (Backend, error) {
	switch cfg.Storage.Backend {
	case "s3", "":
		return newS3Backend(ctx, cfg)
	case "local":
		return newLocalBackend(cfg)
	default:
		return nil, fmt.Errorf("unknown storage backend %q", cfg.Storage.Backend)
	}
}