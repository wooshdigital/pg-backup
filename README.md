# pg-s3-backup

A production-ready, containerisable Go worker that takes scheduled PostgreSQL
dumps and uploads them to Amazon S3, with automatic retention management.

---

## Features

- **Scheduled backups** via a standard cron expression
- **Structured JSON logging** with [zerolog](https://github.com/rs/zerolog)
- **Layered configuration**: defaults → config file → environment variables
- **Retention management**: automatically prune old backup objects from S3
- **Single static binary** — trivial to deploy in Docker / Kubernetes

---

## Quickstart

### 1. Clone and install dependencies

```bash
git clone https://github.com/org/pg-s3-backup.git
cd pg-s3-backup
go mod download
```

### 2. Configure

Copy the example files and fill in your values:

```bash
cp config.yaml.example config.yaml
cp .env.example .env
```

Either the YAML file **or** environment variables (or both) can be used.
Environment variables always take precedence.

### 3. Build and run

```bash
make build
make run
```

Or with `go run` directly:

```bash
BACKUP_DATABASE_DSN="postgres://user:pass@localhost:5432/mydb" \
BACKUP_S3_BUCKET="my-backup-bucket" \
BACKUP_S3_REGION="us-east-1" \
go run ./cmd/worker
```

---

## Configuration Reference

All configuration keys can be supplied via:

1. **`config.yaml`** in the working directory (or `/etc/pg-s3-backup/config.yaml`)
2. **Environment variables** — prefix every key with `BACKUP_` and
   upper-case it (e.g. `database_dsn` → `BACKUP_DATABASE_DSN`).

| Key              | Env Variable              | Required | Default        | Description                                                   |
|------------------|---------------------------|----------|----------------|---------------------------------------------------------------|
| `database_dsn`   | `BACKUP_DATABASE_DSN`     | ✅ Yes   | —              | PostgreSQL connection string passed to `pg_dump`              |
| `s3_bucket`      | `BACKUP_S3_BUCKET`        | ✅ Yes   | —              | Name of the target S3 bucket                                  |
| `s3_region`      | `BACKUP_S3_REGION`        | ✅ Yes   | —              | AWS region of the S3 bucket (e.g. `us-east-1`)                |
| `s3_prefix`      | `BACKUP_S3_PREFIX`        | No       | `backups/`     | Key prefix (folder) inside the bucket                         |
| `schedule`       | `BACKUP_SCHEDULE`         | No       | `0 2 * * *`    | Cron expression for backup frequency (UTC)                    |
| `retention_days` | `BACKUP_RETENTION_DAYS`   | No       | `30`           | Days to keep backups; `0` means keep forever                  |
| `log_level`      | `BACKUP_LOG_LEVEL`        | No       | `info`         | Zerolog level: `trace`, `debug`, `info`, `warn`, `error`, …   |

---

## Development

```bash
make tidy    # go mod tidy + verify
make test    # race-detected tests + coverage
make lint    # golangci-lint (install separately)
make build   # produces ./bin/pg-s3-backup
make clean   # remove build artefacts
```

---

## Project Layout

```
.
├── cmd/
│   └── worker/
│       └── main.go          # Entry point
├── internal/
│   └── config/
│       ├── config.go        # Config struct + Viper-based loader + validation
│       └── config_test.go   # Unit tests
├── config.yaml.example      # Example YAML config
├── .env.example             # Example environment variables
├── Makefile
└── README.md
```

---

## License

MIT