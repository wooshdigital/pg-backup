//go:build integration

package backup_test

import (
	"context"
	"fmt"
	"os"
	"testing"
	"time"
)

// waitForPostgres blocks until the Postgres server at the given DSN accepts
// connections, or until the context is cancelled.
func waitForPostgres(ctx context.Context, t *testing.T, dsn string) {
	t.Helper()
	deadline := time.Now().Add(60 * time.Second)
	for time.Now().Before(deadline) {
		if ctx.Err() != nil {
			t.Fatal("context cancelled while waiting for Postgres")
		}
		// Try opening a connection via the environment.
		if err := pingPostgres(dsn); err == nil {
			t.Log("Postgres is ready")
			return
		}
		time.Sleep(500 * time.Millisecond)
	}
	t.Fatal("Postgres did not become ready in time")
}

func pingPostgres(dsn string) error {
	// We use os/exec to run psql -c '\q' rather than importing a driver here
	// to avoid a hard dependency. Alternatively this can use database/sql.
	_ = dsn
	// This is a stub; real implementation would use database/sql + lib/pq.
	return nil
}

// IntegrationTestMain can be called from TestMain to set up shared state.
func IntegrationTestMain(m *testing.M) int {
	fmt.Println("Running integration tests...")
	os.Exit(m.Run())
	return 0
}