# pgbackup

A production-ready PostgreSQL backup tool implemented in Go.

## Project Structure

```
.
├── cmd/worker/          # Main entrypoint
├── internal/
│   ├── config/          # Configuration loading
│   ├── dumper/          # pg_dump invocation and DSN parsing
│   └── tempfile/        # Safe temporary file management
├── config.yaml.example  # Example configuration
├── go.mod
└── Makefile
```

## Phase 2: PostgreSQL Dump Integration

### Overview

The `internal/dumper` package provides:

- **`Dumper` interface** — the core abstraction for running PostgreSQL dumps.
- **`PgDumper` struct** — invokes `pg_dump` via `os/exec`, streaming stdout
  directly to an `io.Writer` to avoid buffering large dumps in memory.
- **`ParseDSN`** — parses both URL-style (`postgres://...`) and libpq
  key=value DSNs into a `ConnParams` struct.
- **`ConnParams.BuildPgDumpArgs`** — converts connection parameters into
  `pg_dump` command-line flags.

The `internal/tempfile` package provides safe temp-file creation with atomic
commit (rename) and explicit discard semantics.

### Running Tests

**Unit tests** (no Docker required):

```bash
make test
# or
go test ./... -race
```

**Integration tests** (Docker required, `pg_dump` must be in PATH):

```bash
make integration-test
# or
INTEGRATION_TESTS=1 go test -tags integration ./... -race -timeout 120s -v
```

### Design Decisions

1. **Streaming I/O**: `cmd.Stdout` is connected directly to a counting wrapper
   around the caller-provided `io.Writer`. This means even a multi-GB dump is
   never held in memory.

2. **Password handling**: Passwords are passed via the `PGPASSWORD` environment
   variable, never on the command line (which would appear in `ps` output).

3. **Context cancellation**: `exec.CommandContext` is used so that context
   cancellation or timeout kills the `pg_dump` process promptly.

4. **Testability**: The `ExecRunner` func type allows unit tests to inject a
   fake command without any Docker or real Postgres.

5. **Integration tests**: Guarded by both a build tag (`-tags integration`) and
   an environment variable (`INTEGRATION_TESTS=1`) to prevent accidental
   execution in CI environments without Docker.