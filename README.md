# pg-s3-backup

Automated PostgreSQL backup tool that dumps databases on a cron schedule and
uploads the compressed archives to Amazon S3, with configurable retention.

---

## Features

- **Scheduled backups** via a standard cron expression
- **S3 upload** with configurable bucket, region, and key prefix
- **Retention management** — automatically removes backups older than *N* days
- **Structured JSON logging** powered by [zerolog](https://github.com/rs/zerolog)
- **Layered configuration** — YAML file + environment variable overrides via [viper](https://github.com/spf13/viper)

---

## Quickstart

### 1. Clone & build

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
$EDITOR .env          # set BACKUP_DATABASE_DSN, BACKUP_S3_BUCKET, BACKUP_S3_REGION at minimum
```

### 3. Run

```bash
make run
# or directly:
./bin/pg-s3-backup
```

On startup the binary validates the configuration, logs a redacted summary,
and exits `0`. Future phases add the scheduler and actual backup logic.

---

## Configuration reference

All settings can be specified in `config.yaml` **or** as environment variables.
Environment variables always win.

| Key | Env var | Required | Default | Description |
|-----|---------|----------|---------|-------------|
| `database_dsn` | `BACKUP_DATABASE_DSN` | ✅ | — | PostgreSQL DSN (`postgres://user:pass@host/db`) |
| `s3_bucket` | `BACKUP_S3_BUCKET` | ✅ | — | S3 bucket name |
| `s3_region` | `BACKUP_S3_REGION` | ✅ | — | AWS region (e.g. `us-east-1`) |
| `s3_prefix` | `BACKUP_S3_PREFIX` | ❌ | `backups/` | Key prefix inside the bucket |
| `schedule` | `BACKUP_SCHEDULE` | ❌ | `0 2 * * *` | Cron expression for backup frequency |
| `retention_days` | `BACKUP_RETENTION_DAYS` | ❌ | `30` | Days to keep old backups in S3 |
| `log_level` | `BACKUP_LOG_LEVEL` | ❌ | `info` | Logging verbosity (`trace`…`panic`) |

An optional `BACKUP_CONFIG_FILE` env var can point to a YAML config file at a
non-default path.

---

## Development

```bash
make test    # run tests with race detector + coverage
make lint    # run staticcheck
make tidy    # tidy go.mod / go.sum
make clean   # remove build artefacts
make help    # list all targets
```

---

## Project layout

```
.
├── cmd/worker/          # Binary entry point
│   └── main.go
├── internal/
│   └── config/          # Config struct, Load(), validation
│       ├── config.go
│       └── config_test.go
├── config.yaml.example  # Annotated YAML config template
├── .env.example         # Annotated env-var template
├── Makefile
└── README.md
```

---

## License

MIT