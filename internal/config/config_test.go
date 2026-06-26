package config_test

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/yourorg/dbworker/internal/config"
)

const validS3Config = `
database:
  host: localhost
  port: 5432
  name: mydb
  user: postgres
  password: secret
  ssl_mode: disable

storage:
  backend: s3
  s3:
    bucket: my-backups
    region: us-east-1
    key_prefix: "backups/{db}/{date}/{timestamp}.sql.gz"
    part_size: 5242880
    concurrency: 5
    max_retries: 3
    credentials:
      access_key_id: ""
      secret_access_key: ""

compress:
  algorithm: gzip
  level: 6

worker:
  schedule: "0 2 * * *"
  temp_dir: /tmp
`

const validLocalConfig = `
database:
  host: localhost
  port: 5432
  name: mydb
  user: postgres
  password: secret
  ssl_mode: disable

storage:
  backend: local
  local:
    base_dir: /var/backups

compress:
  algorithm: gzip
  level: 6

worker:
  schedule: "0 2 * * *"
`

func writeConfig(t *testing.T, content string) string {
	t.Helper()
	dir := t.TempDir()
	path := filepath.Join(dir, "config.yaml")
	if err := os.WriteFile(path, []byte(content), 0o600); err != nil {
		t.Fatalf("writing config file: %v", err)
	}
	return path
}

func TestLoad_ValidS3Config(t *testing.T) {
	path := writeConfig(t, validS3Config)
	cfg, err := config.Load(path)
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	if cfg.Storage.S3.Bucket != "my-backups" {
		t.Errorf("bucket = %q; want %q", cfg.Storage.S3.Bucket, "my-backups")
	}
	if cfg.Storage.S3.Region != "us-east-1" {
		t.Errorf("region = %q; want %q", cfg.Storage.S3.Region, "us-east-1")
	}
	if cfg.Storage.S3.KeyPrefix != "backups/{db}/{date}/{timestamp}.sql.gz" {
		t.Errorf("key_prefix = %q; unexpected value", cfg.Storage.S3.KeyPrefix)
	}
	if cfg.Storage.S3.PartSize != 5242880 {
		t.Errorf("part_size = %d; want 5242880", cfg.Storage.S3.PartSize)
	}
	if cfg.Storage.S3.MaxRetries != 3 {
		t.Errorf("max_retries = %d; want 3", cfg.Storage.S3.MaxRetries)
	}
}

func TestLoad_ValidLocalConfig(t *testing.T) {
	path := writeConfig(t, validLocalConfig)
	cfg, err := config.Load(path)
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	if cfg.Storage.Backend != "local" {
		t.Errorf("backend = %q; want %q", cfg.Storage.Backend, "local")
	}
	if cfg.Storage.Local.BaseDir != "/var/backups" {
		t.Errorf("base_dir = %q; want %q", cfg.Storage.Local.BaseDir, "/var/backups")
	}
}

func TestLoad_MissingBucket(t *testing.T) {
	content := `
database:
  host: localhost
  port: 5432
  name: mydb
  user: postgres
  password: ""
  ssl_mode: disable
storage:
  backend: s3
  s3:
    region: us-east-1
compress:
  algorithm: gzip
  level: 6
worker:
  schedule: "0 2 * * *"
`
	path := writeConfig(t, content)
	_, err := config.Load(path)
	if err == nil {
		t.Error("expected error for missing bucket, got nil")
	}
}

func TestLoad_MissingRegion(t *testing.T) {
	content := `
database:
  host: localhost
  port: 5432
  name: mydb
  user: postgres
  password: ""
  ssl_mode: disable
storage:
  backend: s3
  s3:
    bucket: my-bucket
compress:
  algorithm: gzip
  level: 6
worker:
  schedule: "0 2 * * *"
`
	path := writeConfig(t, content)
	_, err := config.Load(path)
	if err == nil {
		t.Error("expected error for missing region, got nil")
	}
}

func TestLoad_UnsupportedBackend(t *testing.T) {
	content := `
database:
  host: localhost
  port: 5432
  name: mydb
  user: postgres
  password: ""
  ssl_mode: disable
storage:
  backend: gcs
  s3:
    bucket: my-bucket
    region: us-east-1
compress:
  algorithm: gzip
  level: 6
worker:
  schedule: "0 2 * * *"
`
	path := writeConfig(t, content)
	_, err := config.Load(path)
	if err == nil {
		t.Error("expected error for unsupported backend, got nil")
	}
}

func TestLoad_FileNotFound(t *testing.T) {
	_, err := config.Load("/nonexistent/path/config.yaml")
	if err == nil {
		t.Error("expected error for missing file, got nil")
	}
}

func TestLoad_MissingLocalBaseDir(t *testing.T) {
	content := `
database:
  host: localhost
  port: 5432
  name: mydb
  user: postgres
  password: ""
  ssl_mode: disable
storage:
  backend: local
  local:
    base_dir: ""
compress:
  algorithm: gzip
  level: 6
worker:
  schedule: "0 2 * * *"
`
	path := writeConfig(t, content)
	_, err := config.Load(path)
	if err == nil {
		t.Error("expected error for missing local base_dir, got nil")
	}
}