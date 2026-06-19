# pg-s3-backup

A lightweight, production-ready PostgreSQL backup daemon that streams `pg_dump`
output directly to Amazon S3 on a configurable cron schedule and enforces a
retention policy by pruning old backups automatically.

---

## Features

- **Scheduled backups** — standard 5-field cron expressions (powered by
  `robfig/cron`)
- **Streaming uploads** — no temporary disk files; `pg_dump` stdout is piped
  straight to S3
- **Retention management** — automatically deletes backups older than
  `retention_days` after each successful run
- **Structured logging** — JSON output via `zerolog`; human-friendly coloured
  output when a TTY is detected
- **12-factor configuration** — YAML file + environment-variable overrides
  (env vars always win)
- **Zero runtime dependencies** — single static binary, easy to containerise

---

## Quickstart

```bash
# 1. Clone and enter the repository
git clone https://github.com/org/pg-s3-backup.git
cd pg-s3-backup

# 2. Copy and edit the environment file
cp .env.example .env
$EDITOR .env

# 3. Build
make build

# 4. Run (reads .env automatically via make)
make run
```

Or with Docker:

```bash
docker build -t pg-s3-backup .
docker run --env-file .env pg-s3-backup
```

---

## Configuration

Configuration is layered (highest priority last):

| Layer | Source |
|-------|--------|
| 1 | Built-in defaults |
| 2 | `config.yaml` in the working directory (or `/etc/pg-s3-backup/config.yaml`) |
| 3 | Environment variables prefixed with `BACKUP_` |

### Config reference

| Key (`config.yaml`) | Env var | Required | Default | Description |
|---------------------|---------|----------|---------|-------------|
| `database_dsn` | `BACKUP_DATABASE_DSN` | ✅ | — | libpq connection string for the source PostgreSQL database |
| `s3_bucket` | `BACKUP_S3_BUCKET` | ✅ | — | Target S3 bucket name |
| `s3_region` | `BACKUP_S3_REGION` | ✅ | — | AWS region of the target bucket |
| `s3_prefix` | `BACKUP_S3_PREFIX` | | `backups/` | Key prefix (folder) inside the bucket |
| `schedule` | `BACKUP_SCHEDULE` | | `0 2 * * *` | Cron expression — when to run backups (UTC) |
| `retention_days` | `BACKUP_RETENTION_DAYS` | | `30` | Days of backups to retain; older ones are deleted |
| `log_level` | `BACKUP_LOG_LEVEL` | | `info` | Zerolog level: `trace`, `debug`, `info`, `warn`, `error`, `fatal`, `panic` |

> **Tip:** Environment variables always override config file values, making it
> easy to inject secrets from a vault or Kubernetes secret without modifying
> the config file.

### Example `config.yaml`

```yaml
database_dsn: "postgres://backup_user:s3cr3t@pg-primary:5432/production?sslmode=require"
s3_bucket: "acme-db-backups"
s3_region: "us-east-1"
s3_prefix: "postgres/production/"
schedule: "0 2 * * *"      # 02:00 UTC every day
retention_days: 30
log_level: "info"
```

---

## Development

```bash
# Run tests
make test

# Lint (requires golangci-lint)
make lint

# Tidy dependencies
make tidy

# Clean build artefacts
make clean
```

---

## Project layout

```
.
├── cmd/
│   └── worker/
│       └── main.go          # Entry point
├── internal/
│   └── config/
│       ├── config.go        # Config struct, Viper loader, validation
│       └── config_test.go   # Unit tests
├── config.yaml.example      # Annotated example config file
├── .env.example             # Annotated example env-var file
├── Makefile
└── README.md
```

---

## License

MIT — see [LICENSE](LICENSE).