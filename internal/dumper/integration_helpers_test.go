//go:build integration

package dumper

import (
	"context"
	"fmt"
	"time"

	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/testcontainers/testcontainers-go/wait"
)

// startPostgresContainer starts a Postgres container and returns a DSN and
// a cleanup function. It is only compiled when the "integration" build tag is
// present.
func startPostgresContainer(ctx context.Context) (dsn string, cleanup func(), err error) {
	const (
		dbUser     = "testuser"
		dbPassword = "testpassword"
		dbName     = "testdb"
	)

	pgContainer, err := postgres.RunContainer(ctx,
		testcontainers.WithImage("postgres:15-alpine"),
		postgres.WithDatabase(dbName),
		postgres.WithUsername(dbUser),
		postgres.WithPassword(dbPassword),
		testcontainers.WithWaitStrategy(
			wait.ForLog("database system is ready to accept connections").
				WithOccurrence(2).
				WithStartupTimeout(60*time.Second),
		),
	)
	if err != nil {
		return "", nil, fmt.Errorf("failed to start postgres container: %w", err)
	}

	connStr, err := pgContainer.ConnectionString(ctx, "sslmode=disable")
	if err != nil {
		_ = pgContainer.Terminate(ctx)
		return "", nil, fmt.Errorf("failed to get connection string: %w", err)
	}

	cleanup = func() {
		_ = pgContainer.Terminate(context.Background())
	}

	return connStr, cleanup, nil
}