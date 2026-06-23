//go:build integration
// +build integration

package dumper

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/testcontainers/testcontainers-go/wait"
)

// pgContainer holds a running Postgres testcontainer.
type pgContainer struct {
	container *postgres.PostgresContainer
	DSN       string
}

// startPostgres starts a Postgres container and returns connection info.
func startPostgres(ctx context.Context, t *testing.T) *pgContainer {
	t.Helper()

	const (
		dbName   = "testdb"
		dbUser   = "testuser"
		dbPass   = "testpass"
		pgImage  = "postgres:15-alpine"
	)

	pgC, err := postgres.RunContainer(ctx,
		testcontainers.WithImage(pgImage),
		postgres.WithDatabase(dbName),
		postgres.WithUsername(dbUser),
		postgres.WithPassword(dbPass),
		testcontainers.WithWaitStrategy(
			wait.ForLog("database system is ready to accept connections").
				WithOccurrence(2).
				WithStartupTimeout(60*time.Second),
		),
	)
	if err != nil {
		t.Fatalf("failed to start postgres container: %v", err)
	}

	t.Cleanup(func() {
		if err := pgC.Terminate(context.Background()); err != nil {
			t.Logf("warning: failed to terminate postgres container: %v", err)
		}
	})

	host, err := pgC.Host(ctx)
	if err != nil {
		t.Fatalf("getting container host: %v", err)
	}
	port, err := pgC.MappedPort(ctx, "5432")
	if err != nil {
		t.Fatalf("getting mapped port: %v", err)
	}

	dsn := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
		dbUser, dbPass, host, port.Port(), dbName)

	return &pgContainer{
		container: pgC,
		DSN:       dsn,
	}
}