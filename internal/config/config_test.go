package config_test

import (
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/yourorg/dbworker/internal/config"
)

func writeConfig(t *testing.T, content string) string {
	t.Helper()
	dir := t.TempDir()
	path := filepath.Join(dir, "config.yaml")
	if err := os.WriteFile(path, []byte(content), 0o600); err != nil {
		t.Fatalf("writing config file: %v", err)
	}
	return path
}

func TestLoad_S3Backend(t *testing.T) {
	path := writeConfig(t, `
worker:
  schedule: "0 2 * * *"
  timeout: 1h
database:
  dsn: postgres://user:pass@localhost:5432/mydb
  name: mydb
storage:
  backend: s3
  s3:
    bucket: my-backups
    region: us-east-1
    prefix_template: "backups/{db}/{date}/{timestamp}.sql.gz"
    part_size_bytes: 10485760
    concurrency: 3
    max_retries: 5
compress:
  algorithm: gzip
  level: 6
`)

	cfg, err := config.Load(path)
	if err != nil {
		t.Fatalf("Load() error: %v", err)
	}

	if cfg.Storage.Backend != "s3" {
		t.Errorf("Backend = %q, want %q", cfg.Storage.Backend, "s3")
	}
	if cfg.Storage.S3.Bucket != "my-backups" {
		t.Errorf("Bucket = %q, want %q", cfg.Storage.S3.Bucket, "my-backups")
	}
	if cfg.Storage.S3.Region != "us-east-1" {
		t.Errorf("Region = %q, want %q", cfg.Storage.S3.Region, "us-east-1")
	}
	if cfg.Storage.S3.PartSizeBytes != 10485760 {
		t.Errorf("PartSizeBytes = %d, want %d", cfg.Storage.S3.PartSizeBytes, 10485760)
	}
	if cfg.Storage.S3.Concurrency != 3 {
		t.Errorf("Concurrency = %d, want %d", cfg.Storage.S3.Concurrency, 3)
	}
	if cfg.Storage.S3.MaxRetries != 5 {
		t.Errorf("MaxRetries = %d, want %d", cfg.Storage.S3.MaxRetries, 5)
	}
	if cfg.Worker.Timeout != time.Hour {
		t.Errorf("Timeout = %v, want %v", cfg.Worker.Timeout, time.Hour)
	}
}

func TestLoad_Defaults(t *testing.T) {
	path := writeConfig(t, `
storage:
  s3:
    bucket: my-backups
    region: eu-west-1
`)

	cfg, err := config.Load(path)
	if err != nil {
		t.Fatalf("Load() error: %v", err)
	}

	if cfg.Storage.Backend != "s3" {
		t.Errorf("default Backend = %q, want \"s3\"", cfg.Storage.Backend)
	}
	if cfg.Storage.S3.PrefixTemplate != config.DefaultPrefixTemplate {
		t.Errorf("default PrefixTemplate = %q, want %q", cfg.Storage.S3.PrefixTemplate, config.DefaultPrefixTemplate)
	}
	if cfg.Storage.S3.PartSizeBytes != 5*1024*1024 {
		t.Errorf("default PartSizeBytes = %d, want %d", cfg.Storage.S3.PartSizeBytes, 5*1024*1024)
	}
	if cfg.Storage.S3.Concurrency != 5 {
		t.Errorf("default Concurrency = %d, want 5", cfg.Storage.S3.Concurrency)
	}
	if cfg.Storage.S3.MaxRetries != 3 {
		t.Errorf("default MaxRetries = %d, want 3", cfg.Storage.S3.MaxRetries)
	}
	if cfg.Compress.Algorithm != "gzip" {
		t.Errorf("default Algorithm = %q, want \"gzip\"", cfg.Compress.Algorithm)
	}
	if cfg.Worker.Timeout != 2*time.Hour {
		t.Errorf("default Timeout = %v, want 2h", cfg.Worker.Timeout)
	}
}

func TestLoad_LocalBackend(t *testing.T) {
	path := writeConfig(t, `
storage:
  backend: local
  local:
    base_dir: /tmp/backups
`)

	cfg, err := config.Load(path)
	if err != nil {
		t.Fatalf("Load() error: %v", err)
	}

	if cfg.Storage.Backend != "local" {
		t.Errorf("Backend = %q, want \"local\"", cfg.Storage.Backend)
	}
	if cfg.Storage.Local.BaseDir != "/tmp/backups" {
		t.Errorf("BaseDir = %q, want /tmp/backups", cfg.Storage.Local.BaseDir)
	}
}

func TestLoad_ValidationErrors(t *testing.T) {
	tests := []struct {
		name    string
		content string
	}{
		{
			name: "s3 backend missing bucket",
			content: `
storage:
  backend: s3
  s3:
    region: us-east-1
`,
		},
		{
			name: "s3 backend missing region",
			content: `
storage:
  backend: s3
  s3:
    bucket: my-backups
`,
		},
		{
			name: "local backend missing base_dir",
			content: `
storage:
  backend: local
`,
		},
		{
			name: "unknown backend",
			content: `
storage:
  backend: gcs
`,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			path := writeConfig(t, tc.content)
			_, err := config.Load(path)
			if err == nil {
				t.Fatal("expected validation error, got nil")
			}
		})
	}
}

func TestLoad_FileNotFound(t *testing.T) {
	_, err := config.Load("/nonexistent/path/config.yaml")
	if err == nil {
		t.Fatal("expected error for missing file, got nil")
	}
}

func TestLoad_StaticCredentials(t *testing.T) {
	path := writeConfig(t, `
storage:
  backend: s3
  s3:
    bucket: secure-backups
    region: us-west-2
    credentials:
      access_key_id: AKIAIOSFODNN7EXAMPLE
      secret_access_key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
      session_token: AQoXnyc4lcK4w
`)

	cfg, err := config.Load(path)
	if err != nil {
		t.Fatalf("Load() error: %v", err)
	}

	if cfg.Storage.S3.Credentials.AccessKeyID != "AKIAIOSFODNN7EXAMPLE" {
		t.Errorf("AccessKeyID = %q", cfg.Storage.S3.Credentials.AccessKeyID)
	}
	if cfg.Storage.S3.Credentials.SecretAccessKey != "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY" {
		t.Errorf("SecretAccessKey mismatch")
	}
	if cfg.Storage.S3.Credentials.SessionToken != "AQoXnyc4lcK4w" {
		t.Errorf("SessionToken = %q", cfg.Storage.S3.Credentials.SessionToken)
	}
}