//go:build !integration
// +build !integration

package dumper

import (
	"context"
	"testing"
)

// pgContainer is a stub for non-integration builds.
type pgContainer struct {
	DSN string
}

func startPostgres(_ context.Context, t *testing.T) *pgContainer {
	t.Helper()
	t.Skip("skipping integration test: build tag 'integration' not set")
	return nil
}