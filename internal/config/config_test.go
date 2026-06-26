package config

import (
	"os"
	"path/filepath"
	"testing"
)

func writeConfig(t *testing.T, content string) string {
	t.Helper()
	dir := t.TempDir()
	path := filepath.Join(dir, "config.yaml")
	if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
		t.Fatalf("failed to write config file: %v", err)
	}
	return path
}

func TestLoad_S3Config(t *testing.T) {
	yaml := `
database:
  dsn: "postgres://user:pass@localhost/mydb"
storage:
  backend: s3
  s3:
    bucket: my-bucket
    region: us-east-1
    key_template: "backups/{db}/{date}/{timestamp}.gz"
    part_size: 10485760
    concurrency: 3
    max_retries: 5
    credentials:
      access_key_id: AKID
      secret_access_key: secret
dump:
  compress: gzip
  schedule: "0 2 * * *"
  timeout: 30m
`
	path := writeConfig(t, yaml)
	cfg, err := Load(path)
	if err != nil {
		t.Fatalf("Load: %v", err)
	}

	if cfg.Storage.Backend != "s3" {
		t.Errorf("Backend = %q, want %q", cfg.Storage.Backend, "s3")
	}
	if cfg.Storage.S3.Bucket != "my-bucket" {
		t.Errorf("Bucket = %q, want %q", cfg.Storage.S3.Bucket, "my-bucket")
	}
	if cfg.Storage.S3.Region != "us-east-1" {
		t.Errorf("Region = %q, want %q", cfg.Storage.S3.Region, "us-east-1")
	}
	if cfg.Storage.S3.KeyTemplate != "backups/{db}/{date}/{timestamp}.gz" {
		t.Errorf("KeyTemplate = %q", cfg.Storage.S3.KeyTemplate)
	}
	if cfg.Storage.S3.PartSize != 10485760 {
		t.Errorf("PartSize = %d, want %d", cfg.Storage.S3.PartSize, 10485760)
	}
	if cfg.Storage.S3.Concurrency != 3 {
		t.Errorf("Concurrency = %d, want 3", cfg.Storage.S3.Concurrency)
	}
	if cfg.Storage.S3.MaxRetries != 5 {
		t.Errorf("MaxRetries = %d, want 5", cfg.Storage.S3.MaxRetries)
	}
	if cfg.Storage.S3.Credentials.AccessKeyID != "AKID" {
		t.Errorf("AccessKeyID = %q", cfg.Storage.S3.Credentials.AccessKeyID)
	}
}

func TestLoad_LocalConfig(t *testing.T) {
	yaml := `
database:
  dsn: "postgres://user:pass@localhost/mydb"
storage:
  backend: local
  local:
    base_dir: /tmp/backups
dump:
  compress: gzip
`
	path := writeConfig(t, yaml)
	cfg, err := Load(path)
	if err != nil {
		t.Fatalf("Load: %v", err)
	}

	if cfg.Storage.Backend != "local" {
		t.Errorf("Backend = %q, want %q", cfg.Storage.Backend, "local")
	}
	if cfg.Storage.Local.BaseDir != "/tmp/backups" {
		t.Errorf("BaseDir = %q", cfg.Storage.Local.BaseDir)
	}
}

func TestLoad_ValidationErrors(t *testing.T) {
	tests := []struct {
		name    string
		yaml    string
		wantErr string
	}{
		{
			name: "missing backend",
			yaml: `
database:
  dsn: "postgres://localhost/db"
storage: {}
dump:
  compress: gzip
`,
			wantErr: "storage.backend must be set",
		},
		{
			name: "unknown backend",
			yaml: `
database:
  dsn: "postgres://localhost/db"
storage:
  backend: ftp
dump:
  compress: gzip
`,
			wantErr: "unknown storage backend",
		},
		{
			name: "s3 missing bucket",
			yaml: `
database:
  dsn: "postgres://localhost/db"
storage:
  backend: s3
  s3:
    region: us-east-1
    key_template: "backups/{db}/{date}.gz"
dump:
  compress: gzip
`,
			wantErr: "storage.s3.bucket is required",
		},
		{
			name: "s3 missing region",
			yaml: `
database:
  dsn: "postgres://localhost/db"
storage:
  backend: s3
  s3:
    bucket: my-bucket
    key_template: "backups/{db}/{date}.gz"
dump:
  compress: gzip
`,
			wantErr: "storage.s3.region is required",
		},
		{
			name: "s3 missing key template",
			yaml: `
database:
  dsn: "postgres://localhost/db"
storage:
  backend: s3
  s3:
    bucket: my-bucket
    region: us-east-1
dump:
  compress: gzip
`,
			wantErr: "storage.s3.key_template is required",
		},
		{
			name: "local missing base_dir",
			yaml: `
database:
  dsn: "postgres://localhost/db"
storage:
  backend: local
  local: {}
dump:
  compress: gzip
`,
			wantErr: "storage.local.base_dir is required",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			path := writeConfig(t, tt.yaml)
			_, err := Load(path)
			if err == nil {
				t.Fatal("expected error, got nil")
			}
			if tt.wantErr != "" {
				if !containsString(err.Error(), tt.wantErr) {
					t.Errorf("error = %q, want to contain %q", err.Error(), tt.wantErr)
				}
			}
		})
	}
}

func containsString(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || len(substr) == 0 ||
		findSubstring(s, substr))
}

func findSubstring(s, sub string) bool {
	for i := 0; i <= len(s)-len(sub); i++ {
		if s[i:i+len(sub)] == sub {
			return true
		}
	}
	return false
}