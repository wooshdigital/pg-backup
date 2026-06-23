# pgbackup

A production-grade PostgreSQL backup tool that streams `pg_dump` output
directly to configurable storage targets.

---

## Architecture

```
cmd/worker/
  main.go               – entry point, wires everything together

internal/
  config/
    config.go           – YAML / env-var configuration loader
    config_test.go      – config unit tests

  dumper/
    dsn.go              – PostgreSQL DSN parser (URL + key=value)
    dsn_test.go         – table-driven DSN parser tests
    dumper.go           – Dumper interface + PgDumper implementation
    env.go              – os.Environ wrapper (swap-able in tests)
    dumper_test.go      – unit tests with mock exec runner
    integration_test.go – integration tests using testcontainers-go

  tempfile/
    tempfile.go         – safe named temp-file helper
    tempfile_test.go    – tempfile unit tests
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| Go   | ≥ 1.22  |
| pg_dump (client tools) | ≥ 14 |
| Docker | any recent version (integration tests only) |

---

## Quick start

```bash
# Build the binary
make build

# Run unit tests (no Docker required)
make test

# Run all tests including integration (Docker required)
make test-integration
```

---

## Phase 2 – PostgreSQL Dump Integration

### `internal/dumper`

#### DSN parsing (`dsn.go`)

Supports two PostgreSQL connection string formats:

```
# URL format
postgres://user:password@host:5432/dbname?sslmode=disable

# Key=value format (libpq style)
host=localhost port=5432 user=myuser password=mypass dbname=mydb sslmode=disable
```

`ConnParams.PgDumpArgs()` returns the `pg_dump` CLI flags derived from the
parsed DSN. The password is **never** included in the args; it is injected via
the `PGPASSWORD` environment variable.

#### Dumper (`dumper.go`)

```go
d := dumper.NewPgDumper(
    dumper.WithPgDumpPath("/usr/bin/pg_dump"),   // optional; default "pg_dump"
    dumper.WithExtraArgs("--format=custom", "--compress=9"),
)

var w io.Writer // e.g. os.File, bytes.Buffer, gzip.Writer …
result, err := d.Dump(ctx, dsn, w)
if err != nil {
    log.Fatal(err)
}
fmt.Printf("wrote %d bytes in %v\n", result.BytesWritten, result.Duration)
```

Key properties:
- Streams `pg_dump` stdout directly to the provided `io.Writer` – no full
  dump buffered in memory.
- Captures stderr separately and includes it in error messages.
- Respects `context.Context` for cancellation / deadline propagation.
- The `ExecRunner` / `Commander` interfaces allow the exec layer to be mocked
  in unit tests without spawning real processes.

### `internal/tempfile`

```go
tf, err := tempfile.New("/var/tmp/pgbackup", "dump-", ".pgdump")
if err != nil { ... }
defer tf.Cleanup() // removes the file if not Persisted

result, err := d.Dump(ctx, dsn, tf)
if err != nil { ... }

// Atomically move to final location
if err := tf.Persist("/backups/2026-06-23.pgdump"); err != nil { ... }
```

---

## Running integration tests

The integration tests require Docker to be running locally:

```bash
make test-integration
```

Tests spin up a `postgres:16-alpine` container, seed a small schema, run
`pg_dump`, and assert:

1. The byte count matches the buffer length.
2. A plain-text dump starts with `--` and contains `PostgreSQL database dump`.
3. A custom-format dump starts with the magic bytes `PGDMP`.
4. A pre-cancelled context causes `Dump` to return a non-nil error.