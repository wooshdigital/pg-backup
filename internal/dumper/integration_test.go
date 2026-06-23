//go:build integration

package dumper_test

import (
	"bytes"
	"context"
	"fmt"
	"strings"
	"testing"
	"time"

	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/testcontainers/testcontainers-go/wait"

	"github.com/yourorg/pgbackup/internal/dumper"
)

const (
	postgresImage    = "postgres:16-alpine"
	postgresDB       = "testdb"
	postgresUser     = "testuser"
	postgresPassword = "testpassword"
)

// TestPgDumper_Integration spins up a real Postgres container via testcontainers-go,
// creates a trivial schema, and asserts that the dump output starts with the
// standard pg_dump plain-text or custom-format header.
func TestPgDumper_Integration(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in short mode")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Minute)
	defer cancel()

	// ------------------------------------------------------------------
	// 1. Start a Postgres container.
	// ------------------------------------------------------------------
	pgContainer, err := postgres.RunContainer(ctx,
		testcontainers.WithImage(postgresImage),
		postgres.WithDatabase(postgresDB),
		postgres.WithUsername(postgresUser),
		postgres.WithPassword(postgresPassword),
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
			t.Logf("failed to terminate postgres container: %v", err)
		}
	})

	// ------------------------------------------------------------------
	// 2. Build connection DSN.
	// ------------------------------------------------------------------
	host, err := pgContainer.Host(ctx)
	if err != nil {
		t.Fatalf("get container host: %v", err)
	}
	mappedPort, err := pgContainer.MappedPort(ctx, "5432")
	if err != nil {
		t.Fatalf("get mapped port: %v", err)
	}

	dsn := fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=disable",
		postgresUser, postgresPassword,
		host, mappedPort.Port(),
		postgresDB,
	)

	// ------------------------------------------------------------------
	// 3. Seed a small table so the dump has something interesting.
	// ------------------------------------------------------------------
	if err := seedDatabase(ctx, dsn); err != nil {
		t.Fatalf("seed database: %v", err)
	}

	// ------------------------------------------------------------------
	// 4. Run the dumper (plain-text format for easy header inspection).
	// ------------------------------------------------------------------
	d := dumper.NewPgDumper(
		dumper.WithExtraArgs("--format=plain"),
	)

	var buf bytes.Buffer
	result, err := d.Dump(ctx, dsn, &buf)
	if err != nil {
		t.Fatalf("Dump failed: %v", err)
	}

	// ------------------------------------------------------------------
	// 5. Assertions.
	// ------------------------------------------------------------------
	t.Logf("dump complete: %d bytes in %v", result.BytesWritten, result.Duration)

	if result.BytesWritten == 0 {
		t.Error("dump produced zero bytes")
	}
	if result.BytesWritten != int64(buf.Len()) {
		t.Errorf("BytesWritten (%d) != actual bytes (%d)", result.BytesWritten, buf.Len())
	}
	if result.Duration <= 0 {
		t.Errorf("Duration should be positive, got %v", result.Duration)
	}
	if result.StartedAt.IsZero() {
		t.Error("StartedAt should not be zero")
	}

	// A plain-text pg_dump file always starts with "--" (SQL comment header).
	output := buf.String()
	if !strings.HasPrefix(output, "--") {
		t.Errorf("expected dump to start with '--', got first 100 bytes: %q",
			truncate(output, 100))
	}

	// Check for pg_dump signature line.
	if !strings.Contains(output, "PostgreSQL database dump") {
		t.Errorf("dump output does not contain 'PostgreSQL database dump'; first 200 bytes: %q",
			truncate(output, 200))
	}

	// Our seeded table should appear in the dump.
	if !strings.Contains(output, "widgets") {
		t.Errorf("expected table 'widgets' to appear in dump")
	}
}

// TestPgDumper_Integration_CustomFormat verifies that the custom binary format
// header (PGDMP magic bytes) is present when --format=custom is used.
func TestPgDumper_Integration_CustomFormat(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in short mode")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Minute)
	defer cancel()

	pgContainer, err := postgres.RunContainer(ctx,
		testcontainers.WithImage(postgresImage),
		postgres.WithDatabase(postgresDB),
		postgres.WithUsername(postgresUser),
		postgres.WithPassword(postgresPassword),
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
		_ = pgContainer.Terminate(context.Background())
	})

	host, err := pgContainer.Host(ctx)
	if err != nil {
		t.Fatalf("get container host: %v", err)
	}
	port, err := pgContainer.MappedPort(ctx, "5432")
	if err != nil {
		t.Fatalf("get mapped port: %v", err)
	}

	dsn := fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=disable",
		postgresUser, postgresPassword,
		host, port.Port(),
		postgresDB,
	)

	d := dumper.NewPgDumper(
		dumper.WithExtraArgs("--format=custom"),
	)

	var buf bytes.Buffer
	result, err := d.Dump(ctx, dsn, &buf)
	if err != nil {
		t.Fatalf("Dump (custom format) failed: %v", err)
	}

	t.Logf("custom format dump: %d bytes in %v", result.BytesWritten, result.Duration)

	// pg_dump custom format always begins with the magic string "PGDMP".
	magic := buf.Bytes()
	if len(magic) < 5 {
		t.Fatalf("dump output too short (%d bytes)", len(magic))
	}
	if string(magic[:5]) != "PGDMP" {
		t.Errorf("expected custom format to start with 'PGDMP', got %q", magic[:5])
	}
}

// TestPgDumper_Integration_Cancellation verifies that cancelling the context
// aborts an in-progress dump.
func TestPgDumper_Integration_Cancellation(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in short mode")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Minute)
	defer cancel()

	pgContainer, err := postgres.RunContainer(ctx,
		testcontainers.WithImage(postgresImage),
		postgres.WithDatabase(postgresDB),
		postgres.WithUsername(postgresUser),
		postgres.WithPassword(postgresPassword),
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
		_ = pgContainer.Terminate(context.Background())
	})

	host, err := pgContainer.Host(ctx)
	if err != nil {
		t.Fatalf("get container host: %v", err)
	}
	port, err := pgContainer.MappedPort(ctx, "5432")
	if err != nil {
		t.Fatalf("get mapped port: %v", err)
	}

	dsn := fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=disable",
		postgresUser, postgresPassword,
		host, port.Port(),
		postgresDB,
	)

	// Cancel the dump context immediately.
	dumpCtx, dumpCancel := context.WithCancel(ctx)
	dumpCancel()

	d := dumper.NewPgDumper()
	_, err = d.Dump(dumpCtx, dsn, io.Discard)
	if err == nil {
		t.Error("expected error when context is pre-cancelled, got nil")
	} else {
		t.Logf("got expected error: %v", err)
	}
}

// -------------------------------------------------------------------------
// helpers
// -------------------------------------------------------------------------

// seedDatabase creates a simple table in the target database so that the dump
// contains recognisable content.
func seedDatabase(ctx context.Context, dsn string) error {
	// We use pgx directly to seed the DB.
	conn, err := pgx.Connect(ctx, dsn)
	if err != nil {
		return fmt.Errorf("connect: %w", err)
	}
	defer conn.Close(ctx)

	_, err = conn.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS widgets (
			id   SERIAL PRIMARY KEY,
			name TEXT NOT NULL
		);
		INSERT INTO widgets (name) VALUES ('foo'), ('bar'), ('baz');
	`)
	return err
}

func truncate(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return s[:n]
}