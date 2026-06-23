//go:build integration

package dumper

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/testcontainers/testcontainers-go"
	tcpostgres "github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/testcontainers/testcontainers-go/wait"
)

const (
	testDBUser     = "testuser"
	testDBPassword = "testpassword"
	testDBName     = "testdb"
	postgresImage  = "postgres:15-alpine"
)

// postgresContainer wraps a running Postgres testcontainer.
type postgresContainer struct {
	container *tcpostgres.PostgresContainer
	dsn       string
}

// startPostgres spins up a Postgres container and returns its DSN.
func startPostgres(ctx context.Context, t *testing.T) *postgresContainer {
	t.Helper()

	pgContainer, err := tcpostgres.RunContainer(ctx,
		testcontainers.WithImage(postgresImage),
		tcpostgres.WithDatabase(testDBName),
		tcpostgres.WithUsername(testDBUser),
		tcpostgres.WithPassword(testDBPassword),
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
		if err := pgContainer.Terminate(context.Background()); err != nil {
			t.Logf("warning: failed to terminate postgres container: %v", err)
		}
	})

	host, err := pgContainer.Host(ctx)
	if err != nil {
		t.Fatalf("failed to get container host: %v", err)
	}
	port, err := pgContainer.MappedPort(ctx, "5432")
	if err != nil {
		t.Fatalf("failed to get container port: %v", err)
	}

	dsn := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
		testDBUser, testDBPassword, host, port.Port(), testDBName)

	return &postgresContainer{
		container: pgContainer,
		dsn:       dsn,
	}
}