# pg-s3-backup

A production-ready PostgreSQL backup tool that dumps databases on a cron schedule and uploads them to Amazon S3, with automatic retention management.

---

## Features

- ⏰ **Cron-based scheduling** — define your backup frequency with a standard cron expression
- ☁️ **S3 storage** — uploads compressed dumps to any S3-compatible endpoint
- 🗓️ **Retention management** — automatically deletes backups older than N days
- 📋 **Structured logging** — JSON output via `zerolog`, debug-friendly console mode
- 🔧 **Layered config** — environment variables override config file values; sane defaults out of the box

---

## Quickstart

### 1. Clone and build

```bash
git clone https://github.com/org/pg-s3-backup.git
cd pg-s3-backup
make build
```

### 2. Configure

Copy the example files and fill in your values:

```bash
cp config.yaml.example config.yaml
cp .env.example .env
# edit config.yaml or set environment variables
```

### 3. Run

```bash
# Using environment variables:
export PG_S3_BACKUP_DATABASE_DSN="postgres://user:pass@localhost:5432/mydb"
export PG_S3_BACKUP_S3_BUCKET="my-backup-bucket"
export PG_S3_BACKUP_S3_REGION="us-east-1"
./bin/pg-s3-backup

# Using a config file:
./bin/pg-s3-backup   # reads ./config.yaml automatically
```

---

## Configuration Reference

All configuration can be supplied via **environment variables** (highest priority), a **`config.yaml`** file, or will fall back to **default values**.

Environment variable names follow the pattern: `PG_S3_BACKUP_<KEY>` where `<KEY>` is the YAML key in `SCREAMING_SNAKE_CASE`.

| YAML Key          | Environment Variable              | Required | Default       | Description                                              |
|-------------------|-----------------------------------|----------|---------------|----------------------------------------------------------|
| `database_dsn`    | `PG_S3_BACKUP_DATABASE_DSN`       | ✅ Yes   | —             | PostgreSQL connection string                             |
| `s3_bucket`       | `PG_S3_BACKUP_S3_BUCKET`          | ✅ Yes   | —             | S3 bucket name                                           |
| `s3_region`       | `PG_S3_BACKUP_S3_REGION`          | ✅ Yes   | —             | AWS region (e.g. `us-east-1`)                            |
| `s3_prefix`       | `PG_S3_BACKUP_S3_PREFIX`          | No       | `backups/`    | Key prefix (folder) inside the bucket                    |
| `schedule`        | `PG_S3_BACKUP_SCHEDULE`           | No       | `0 2 * * *`   | Cron expression for backup frequency                     |
| `retention_days`  | `PG_S3_BACKUP_RETENTION_DAYS`     | No       | `30`          | Days to keep backups before automatic deletion           |
| `log_level`       | `PG_S3_BACKUP_LOG_LEVEL`          | No       | `info`        | Log verbosity: `debug`, `info`, `warn`, `error`          |

### PostgreSQL DSN format

```
postgres://username:password@host:port/database?sslmode=disable
```

---

## Development

```bash
make test          # run tests with race detection + coverage
make test-verbose  # verbose test output
make cover         # open HTML coverage report
make lint          # run golangci-lint
make fmt           # gofmt all files
make vet           # go vet
make tidy          # go mod tidy + verify
make clean         # remove build artifacts
make help          # list all targets
```

### Running tests

```bash
make test
```

Tests use only the standard library and environment variables — no external services required.

---

## Project Structure

```
pg-s3-backup/
├── cmd/
│   └── worker/
│       └── main.go          # Entry point
├── internal/
│   └── config/
│       ├── config.go        # Config struct + Viper-based Load()
│       └── config_test.go   # Unit tests
├── config.yaml.example      # Example config file
├── .env.example             # Example environment variables
├── Makefile                 # Dev workflow targets
├── go.mod
└── go.sum
```

---

## License

MIT