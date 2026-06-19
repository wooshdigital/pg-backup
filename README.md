# pg-s3-backup

A production-ready PostgreSQL backup tool that schedules `pg_dump` runs and
uploads the resulting archives to Amazon S3, with automatic retention
management.

---

## Features

- 🕒 **Cron-scheduled backups** — standard cron expression support
- ☁️ **S3 upload** — streamed directly, no local disk required
- 🗑️ **Automatic retention** — prunes backups older than *N* days
- 📋 **Structured JSON logging** — via [zerolog](https://github.com/rs/zerolog)
- ⚙️ **Layered config** — YAML file → environment variables (env wins)

---

## Quickstart

### Prerequisites

| Tool | Version |
|------|---------|
| Go   | ≥ 1.22  |
| PostgreSQL client (`pg_dump`) | ≥ 14 |
| AWS credentials | any standard method |

### 1. Clone & install dependencies

```bash
git clone https://github.com/org/pg-s3-backup.git
cd pg-s3-backup
go mod download
```

### 2. Configure

Copy the example env file and fill in your values:

```bash
cp .env.example .env
$EDITOR .env
```

Alternatively, copy `config.yaml.example` to `config.yaml`:

```bash
cp config.yaml.example config.yaml
$EDITOR config.yaml
```

### 3. Build & run

```bash
make build
make run
```

---

## Configuration Reference

All keys can be set via **environment variable** (takes precedence) or
**`config.yaml`**. Environment variable names follow the pattern:

```
PG_S3_BACKUP_<KEY_UPPERCASE>
```

| Config Key       | Env Variable                    | Required | Default        | Description                                         |
|------------------|---------------------------------|----------|----------------|-----------------------------------------------------|
| `database_dsn`   | `PG_S3_BACKUP_DATABASE_DSN`    | ✅        | —              | Full PostgreSQL DSN                                 |
| `s3_bucket`      | `PG_S3_BACKUP_S3_BUCKET`       | ✅        | —              | S3 bucket name                                      |
| `s3_region`      | `PG_S3_BACKUP_S3_REGION`       | ✅        | —              | AWS region (e.g. `us-east-1`)                       |
| `s3_prefix`      | `PG_S3_BACKUP_S3_PREFIX`       | ❌        | `backups/`     | Key prefix inside the bucket                        |
| `schedule`       | `PG_S3_BACKUP_SCHEDULE`        | ❌        | `0 2 * * *`    | Cron expression for backup schedule                 |
| `retention_days` | `PG_S3_BACKUP_RETENTION_DAYS`  | ❌        | `30`           | Days to keep backups (min 1)                        |
| `log_level`      | `PG_S3_BACKUP_LOG_LEVEL`       | ❌        | `info`         | One of `debug`, `info`, `warn`, `error`             |

---

## Development

```bash
make test      # run tests with race detector + coverage
make lint      # run golangci-lint (or go vet)
make tidy      # tidy & verify modules
make clean     # remove build artifacts
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
│       ├── config.go        # Config struct, Load(), validate()
│       └── config_test.go   # Unit tests
├── config.yaml.example      # Example YAML config
├── .env.example             # Example environment variables
├── Makefile
└── README.md
```

---

## License

MIT