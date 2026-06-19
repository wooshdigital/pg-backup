# pg-s3-backup

A production-ready PostgreSQL → S3 backup worker written in Go.  
It runs on a configurable cron schedule, dumps your database with `pg_dump`,
streams the compressed archive to an S3-compatible bucket, and prunes old
backups according to a retention policy.

---

## Quickstart

```bash
# 1. Copy and edit the config file
cp config.yaml.example config.yaml
$EDITOR config.yaml

# 2. (Optional) use environment variables instead of / in addition to the file
cp .env.example .env
$EDITOR .env
source .env

# 3. Build and run
make build
./bin/pg-s3-backup
```

---

## Configuration Reference

Configuration is loaded in this order (later sources override earlier ones):

1. Built-in defaults  
2. `config.yaml` in the current directory (or `/etc/pg-s3-backup/config.yaml`)  
3. Environment variables prefixed with `BACKUP_`

| Key               | Env var                  | Default        | Required | Description                                                  |
|-------------------|--------------------------|----------------|----------|--------------------------------------------------------------|
| `database_dsn`    | `BACKUP_DATABASE_DSN`    | —              | ✅        | PostgreSQL connection string                                 |
| `s3_bucket`       | `BACKUP_S3_BUCKET`       | —              | ✅        | S3 bucket name                                               |
| `s3_region`       | `BACKUP_S3_REGION`       | `us-east-1`    | ✅        | AWS region for the bucket                                    |
| `s3_prefix`       | `BACKUP_S3_PREFIX`       | `backups/`     | ❌        | Key prefix (folder) inside the bucket                        |
| `schedule`        | `BACKUP_SCHEDULE`        | `0 2 * * *`    | ❌        | Cron expression for backup schedule (UTC)                    |
| `retention_days`  | `BACKUP_RETENTION_DAYS`  | `30`           | ❌        | Days to keep backups before pruning                          |
| `log_level`       | `BACKUP_LOG_LEVEL`       | `info`         | ❌        | Zerolog level: trace / debug / info / warn / error / fatal   |

---

## Development

```bash
make build        # compile binary to ./bin/
make test         # run tests with race detector + coverage
make test-verbose # same, with -v
make lint         # run golangci-lint
make run          # build + run
make tidy         # go mod tidy + verify
make clean        # remove artifacts
```

### Project Layout

```
.
├── cmd/
│   └── worker/
│       └── main.go          # Entry point
├── internal/
│   └── config/
│       ├── config.go        # Config struct + Viper-based Load()
│       └── config_test.go   # Unit tests
├── config.yaml.example      # Documented YAML config template
├── .env.example             # Documented env var template
├── Makefile
└── README.md
```

---

## License

MIT