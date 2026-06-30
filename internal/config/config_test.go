package config_test

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/ssoready/conf/internal/config"
)

func TestLoad_Defaults(t *testing.T) {
	// Point CONFIG_FILE at a non-existent path so we get defaults.
	t.Setenv("CONFIG_FILE", "/nonexistent/config.yaml")

	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	if cfg.Compression.Algorithm != "gzip" {
		t.Errorf("default algorithm = %q, want gzip", cfg.Compression.Algorithm)
	}
	if cfg.Storage.Backend != "s3" {
		t.Errorf("default backend = %q, want s3", cfg.Storage.Backend)
	}
}

func TestLoad_FromFile(t *testing.T) {
	dir := t.TempDir()
	cfgFile := filepath.Join(dir, "config.yaml")

	content := `
database:
  dsn: "postgres://user:pass@host/db"
storage:
  backend: "local"
  local_path: "/tmp/backups"
compression:
  algorithm: "gzip"
  level: 9
stream_direct: true
`
	if err := os.WriteFile(cfgFile, []byte(content), 0644); err != nil {
		t.Fatalf("write config: %v", err)
	}

	t.Setenv("CONFIG_FILE", cfgFile)

	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	if cfg.Database.DSN != "postgres://user:pass@host/db" {
		t.Errorf("DSN = %q", cfg.Database.DSN)
	}
	if cfg.Storage.Backend != "local" {
		t.Errorf("backend = %q", cfg.Storage.Backend)
	}
	if cfg.Compression.Level != 9 {
		t.Errorf("level = %d", cfg.Compression.Level)
	}
	if !cfg.StreamDirect {
		t.Error("stream_direct should be true")
	}
}

func TestLoad_EnvOverride(t *testing.T) {
	t.Setenv("CONFIG_FILE", "/nonexistent/config.yaml")
	t.Setenv("POSTGRES_DSN", "postgres://override@host/db")
	t.Setenv("S3_BUCKET", "my-bucket")

	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	if cfg.Database.DSN != "postgres://override@host/db" {
		t.Errorf("DSN override failed: got %q", cfg.Database.DSN)
	}
	if cfg.Storage.S3Bucket != "my-bucket" {
		t.Errorf("S3Bucket override failed: got %q", cfg.Storage.S3Bucket)
	}
}