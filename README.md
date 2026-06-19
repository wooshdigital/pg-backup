# pg-s3-backup

A production-ready PostgreSQL backup tool that dumps databases on a cron schedule and stores them in Amazon S3 with configurable retention.

## Features

- ⏰ **Cron-based scheduling** — standard five-field cron expressions (UTC)
- ☁️  **S3 storage** — uploads compressed dumps directly to S3
- 🗑️  **Automatic retention** — deletes objects older than *N* days
- 🔧 **Layered configuration** — YAML file + environment variable overrides
- 📋 **Structured logging** — JSON output via `zerolog`

---

## Quickstart

### 1. Prerequisites

| Tool | Version |
|------|---------|
| Go   | ≥ 1.22  |
| AWS credentials | configured via env, `~/.aws/credentials`, or IAM role |
| `pg_dump` | matching your target PostgreSQL version |

### 2. Clone & build

```bash
git clone https://github.com/org/pg-s3-backup.git
cd pg-s3-backup
make build
```

### 3. Configure

Copy the example env file and fill in your values:

```bash
cp .env.example .env
# edit .env with your DSN, bucket, region, etc.
```

Or copy the YAML example:

```bash
cp config.yaml.example config.yaml
# edit config.yaml
```

### 4. Run

```bash
# Using environment variables
source .env
make run

# Or pass variables inline
BACKUP_DB_DSN="postgres://user:pass@localhost/mydb" \
BACKUP_S3_BUCKET="my-bucket" \
BACKUP_S3_REGION="us-east-1" \
./bin/pg-s3-backup
```

---

## Configuration Reference

All configuration keys can be set either in `config.yaml` **or** as environment variables. Environment variables always take precedence.

| Config key      | Environment variable      | Required | Default        | Description |
|-----------------|--------------------------|----------|----------------|-------------|
| `db_dsn`        | `BACKUP_DB_DSN`          | ✅ Yes   | —              | PostgreSQL connection DSN |
| `s3_bucket`     | `BACKUP_S3_BUCKET`       | ✅ Yes   | —              | S3 bucket name |
| `s3_region`     | `BACKUP_S3_REGION`       | ✅ Yes   | —              | AWS region of the bucket |
| `s3_prefix`     | `BACKUP_S3_PREFIX`       | No       | `backups/`     | Key prefix (folder) within the bucket |
| `schedule`      | `BACKUP_SCHEDULE`        | No       | `0 2 * * *`    | Cron schedule (UTC) |
| `retention_days`| `BACKUP_RETENTION_DAYS`  | No       | `30`           | Days to keep old backups |
| `log_level`     | `BACKUP_LOG_LEVEL`       | No       | `info`         | Log verbosity (`trace`…`panic`) |

### DSN Format

```
postgres://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=disable
```

---

## Development

```bash
# Run all tests with race detector and coverage
make test

# Lint (requires golangci-lint)
make lint

# Tidy dependencies
make tidy

# Remove build artefacts
make clean
```

---

## Project Structure

```
pg-s3-backup/
├── cmd/
│   └── worker/
│       └── main.go          # Entry point
├── internal/
│   └── config/
│       ├── config.go        # Config struct + Viper loader + validation
│       └── config_test.go   # Unit tests
├── .env.example             # Documented env var template
├── config.yaml.example      # Documented YAML config template
├── Makefile                 # Build, test, lint, run targets
└── README.md
```

---

## License

MIT © 2026 Your Organisation