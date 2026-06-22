# pg-s3-backup

> A production-ready PostgreSQL → S3 backup worker written in Go.

## Features

- Scheduled `pg_dump` backups via a cron expression
- Upload compressed dumps to any S3-compatible object store
- Configurable retention policy with automatic deletion of old backups
- Structured JSON logging via [zerolog](https://github.com/rs/zerolog)
- Layered configuration: config file → environment variables (env wins)

---

## Quickstart

```bash
# 1. Clone and enter the repository
git clone https://github.com/org/pg-s3-backup.git
cd pg-s3-backup

# 2. Copy example configs
cp config.yaml.example config.yaml   # edit as needed
cp .env.example .env                 # or export vars directly

# 3. Build
make build

# 4. Run (reads config.yaml and/or env vars)
make run
```

---

## Configuration Reference

Configuration is resolved in the following order (highest priority last):

1. Built-in defaults
2. `config.yaml` in the working directory (or `/etc/pg-s3-backup/config.yaml`)
3. Environment variables (prefix: `BACKUP_`)

| Key | Env Var | Default | Description |
|-----|---------|---------|-------------|
| `database_dsn` | `BACKUP_DATABASE_DSN` | *(required)* | PostgreSQL connection string |
| `s3_bucket` | `BACKUP_S3_BUCKET` | *(required)* | Target S3 bucket name |
| `s3_region` | `BACKUP_S3_REGION` | *(required)* | AWS region of the S3 bucket |
| `s3_prefix` | `BACKUP_S3_PREFIX` | `backups/` | Key prefix (folder) inside the bucket |
| `schedule` | `BACKUP_SCHEDULE` | `0 2 * * *` | Cron expression for backup frequency |
| `retention_days` | `BACKUP_RETENTION_DAYS` | `30` | Days to retain old backups |
| `log_level` | `BACKUP_LOG_LEVEL` | `info` | Zerolog level: trace/debug/info/warn/error/fatal/panic |

### Database DSN format

```
postgres://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=disable
```

### Cron expression format

Standard 5-field cron: `MINUTE HOUR DAY_OF_MONTH MONTH DAY_OF_WEEK`

```
0 2 * * *   → every day at 02:00 UTC
0 */6 * * * → every 6 hours
```

---

## Development

```bash
make build   # compile binary → ./bin/pg-s3-backup
make test    # run tests with race detector + coverage
make lint    # run golangci-lint
make tidy    # go mod tidy + verify
make clean   # remove build artefacts
```

### Running tests

```bash
# All tests
go test ./...

# With coverage
go test -race -coverprofile=coverage.out ./...
go tool cover -html=coverage.out
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
│       ├── config.go        # Config struct, Load(), validation
│       └── config_test.go   # Unit tests
├── config.yaml.example      # Example YAML config
├── .env.example             # Example environment variables
├── Makefile
└── README.md
```

---

## License

MIT © 2026 org