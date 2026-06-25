package config_test

import (
	"os"
	"testing"
	"time"

	"github.com/yourusername/pg-dump-worker/internal/config"
)

func writeConfig(t *testing.T, content string) string {
	t.Helper()
	f, err := os.CreateTemp(t.TempDir(), "config-*.yaml")
	if err != nil {
		t.Fatalf("create temp config: %v", err)
	}
	if _, err := f.WriteString(content); err != nil {
		t.Fatalf("write temp config: %v", err)
	}
	f.Close()
	return f.Name()
}

func TestLoad_Valid(t *testing.T) {
	path := writeConfig(t, `
database_url: "postgres://user:pass@localhost/mydb"
output_dir: "/tmp/dumps"
dump_timeout: 10m
compression_format: gzip
compression_level: 6
`)
	cfg, err := config.Load(path)
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	if cfg.DatabaseURL != "postgres://user:pass@localhost/mydb" {
		t.Errorf("DatabaseURL = %q", cfg.DatabaseURL)
	}
	if cfg.CompressionFormat != config.CompressionGzip {
		t.Errorf("CompressionFormat = %q", cfg.CompressionFormat)
	}
	if cfg.CompressionLevel != 6 {
		t.Errorf("CompressionLevel = %d", cfg.CompressionLevel)
	}
	if cfg.DumpTimeout != 10*time.Minute {
		t.Errorf("DumpTimeout = %v", cfg.DumpTimeout)
	}
}

func TestLoad_DefaultCompression(t *testing.T) {
	path := writeConfig(t, `
database_url: "postgres://localhost/test"
output_dir: "/tmp"
`)
	cfg, err := config.Load(path)
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	if cfg.CompressionFormat != config.CompressionGzip {
		t.Errorf("expected default gzip, got %q", cfg.CompressionFormat)
	}
}

func TestLoad_ZstdFormat(t *testing.T) {
	path := writeConfig(t, `
database_url: "postgres://localhost/test"
output_dir: "/tmp"
compression_format: zstd
compression_level: 3
`)
	cfg, err := config.Load(path)
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	if cfg.CompressionFormat != config.CompressionZstd {
		t.Errorf("CompressionFormat = %q, want zstd", cfg.CompressionFormat)
	}
}

func TestLoad_NoneFormat(t *testing.T) {
	path := writeConfig(t, `
database_url: "postgres://localhost/test"
output_dir: "/tmp"
compression_format: none
`)
	cfg, err := config.Load(path)
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	if cfg.CompressionFormat != config.CompressionNone {
		t.Errorf("CompressionFormat = %q, want none", cfg.CompressionFormat)
	}
}

func TestLoad_MissingDatabaseURL(t *testing.T) {
	path := writeConfig(t, `
output_dir: "/tmp"
`)
	_, err := config.Load(path)
	if err == nil {
		t.Fatal("expected error for missing database_url, got nil")
	}
}

func TestLoad_MissingOutputDir(t *testing.T) {
	path := writeConfig(t, `
database_url: "postgres://localhost/test"
`)
	_, err := config.Load(path)
	if err == nil {
		t.Fatal("expected error for missing output_dir, got nil")
	}
}

func TestLoad_InvalidFormat(t *testing.T) {
	path := writeConfig(t, `
database_url: "postgres://localhost/test"
output_dir: "/tmp"
compression_format: bzip2
`)
	_, err := config.Load(path)
	if err == nil {
		t.Fatal("expected error for invalid compression_format, got nil")
	}
}

func TestLoad_FileNotFound(t *testing.T) {
	_, err := config.Load("/nonexistent/path/config.yaml")
	if err == nil {
		t.Fatal("expected error for missing file, got nil")
	}
}