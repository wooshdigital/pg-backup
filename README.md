# pg-s3-backup

A production-ready PostgreSQL → S3 backup worker written in Go.

## Features

- Scheduled `pg_dump` backups via cron expression
- Automatic upload to Amazon S3 (with configurable prefix)
- Retention policy: auto-delete backups older than *N* days
- Layered configuration: YAML file → environment variables → defaults
- Structured JSON logging via [zerolog](https://github.com/rs/zerolog)

---

## Quickstart

```bash
# 1. Clone and enter the repo
git clone https://github.com/org/pg-s3-backup.git
cd pg-s3-backup

# 2. Copy example configs
cp config.yaml.example config.yaml   # edit as needed
cp .env.example .env                 # or export vars directly

# 3. Build and run
make build
make run
```

---

## Configuration Reference

Configuration is loaded in this priority order (highest wins):

1. **Environment variables** — prefixed with `BACKUP_`
2. **`config.yaml`** — in the working directory or `/etc/pg-s3-backup/`
3. **Built-in defaults**

| Key | Env Variable | Default | Required | Description |
|-----|-------------|---------|----------|-------------|
| `database_dsn` | `BACKUP_DATABASE_DSN` | — | ✅ | PostgreSQL connection string |
| `s3_bucket` | `BACKUP_S3_BUCKET` | — | ✅ | Target S3 bucket name |
| `s3_region` | `BACKUP_S3_REGION` | — | ✅ | AWS region for the bucket |
| `s3_prefix` | `BACKUP_S3_PREFIX` | `backups/` | | Path prefix inside the bucket |
| `schedule` | `BACKUP_SCHEDULE` | `0 2 * * *` | | Cron expression (5-field) |
| `retention_days` | `BACKUP_RETENTION_DAYS` | `30` | | Days to keep old backups |
| `log_level` | `BACKUP_LOG_LEVEL` | `info` | | One of: trace debug info warn error fatal |

---

## Development

```bash
make test    # run tests with race detector
make lint    # run golangci-lint
make build   # compile binary to ./bin/
make clean   # remove build artefacts
```

### Running Tests

```bash
go test -race -cover ./...
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
│       ├── config.go        # Config struct + Load() + validation
│       └── config_test.go   # Unit tests
├── config.yaml.example      # Example YAML config
├── .env.example             # Example environment variables
├── Makefile
└── README.md
```

---

## License

MIT