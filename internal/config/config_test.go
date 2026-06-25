package config_test

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/sno6/gosane/internal/config"
)

func writeConfig(t *testing.T, content string) string {
	t.Helper()
	dir := t.TempDir()
	path := filepath.Join(dir, "config.yaml")
	if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
		t.Fatalf("write config: %v", err)
	}
	return path
}

func TestLoad_Valid(t *testing.T) {
	path := writeConfig(t, `
database:
  host: localhost
  port: 5432
  name: mydb
  user: postgres
  password: secret
  ssl_mode: disable
storage:
  output_dir: /tmp/dumps
compression:
  format: gzip
  level: 6
`)
	cfg, err := config.Load(path)
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	if cfg.Database.Host != "localhost" {
		t.Errorf("Host = %q, want %q", cfg.Database.Host, "localhost")
	}
	if cfg.Compression.Format != config.CompressionGzip {
		t.Errorf("Format = %q, want %q", cfg.Compression.Format, config.CompressionGzip)
	}
	if cfg.Compression.Level != 6 {
		t.Errorf("Level = %d, want 6", cfg.Compression.Level)
	}
}

func TestLoad_Zstd(t *testing.T) {
	path := writeConfig(t, `
database:
  host: db.example.com
  name: proddb
  user: admin
compression:
  format: zstd
  level: 3
`)
	cfg, err := config.Load(path)
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	if cfg.Compression.Format != config.CompressionZstd {
		t.Errorf("Format = %q, want %q", cfg.Compression.Format, config.CompressionZstd)
	}
}

func TestLoad_None(t *testing.T) {
	path := writeConfig(t, `
database:
  host: localhost
  name: testdb
  user: postgres
compression:
  format: none
`)
	cfg, err := config.Load(path)
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	if cfg.Compression.Format != config.CompressionNone {
		t.Errorf("Format = %q, want %q", cfg.Compression.Format, config.CompressionNone)
	}
}

func TestLoad_InvalidFormat(t *testing.T) {
	path := writeConfig(t, `
database:
  host: localhost
  name: testdb
  user: postgres
compression:
  format: brotli
`)
	_, err := config.Load(path)
	if err == nil {
		t.Fatal("expected error for invalid compression format, got nil")
	}
}

func TestLoad_MissingHost(t *testing.T) {
	path := writeConfig(t, `
database:
  name: testdb
  user: postgres
`)
	_, err := config.Load(path)
	if err == nil {
		t.Fatal("expected error for missing database host, got nil")
	}
}

func TestLoad_FileNotFound(t *testing.T) {
	_, err := config.Load("/nonexistent/path/config.yaml")
	if err == nil {
		t.Fatal("expected error for missing file, got nil")
	}
}

func TestConfig_Defaults(t *testing.T) {
	cfg := &config.Config{}
	cfg.Defaults()

	if cfg.Database.Port != 5432 {
		t.Errorf("Port = %d, want 5432", cfg.Database.Port)
	}
	if cfg.Database.SSLMode != "disable" {
		t.Errorf("SSLMode = %q, want %q", cfg.Database.SSLMode, "disable")
	}
	if cfg.Storage.OutputDir != "/tmp" {
		t.Errorf("OutputDir = %q, want /tmp", cfg.Storage.OutputDir)
	}
	if cfg.Compression.Format != config.CompressionGzip {
		t.Errorf("Format = %q, want %q", cfg.Compression.Format, config.CompressionGzip)
	}
}