package config_test

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/example/pgdumpworker/internal/compress"
	"github.com/example/pgdumpworker/internal/config"
)

func writeConfig(t *testing.T, content string) string {
	t.Helper()
	dir := t.TempDir()
	p := filepath.Join(dir, "config.yaml")
	if err := os.WriteFile(p, []byte(content), 0o600); err != nil {
		t.Fatal(err)
	}
	return p
}

func TestLoad_Valid(t *testing.T) {
	p := writeConfig(t, `
database_url: postgres://user:pass@localhost/db
output_dir: /tmp/dumps
compression_format: gzip
compression_level: 6
`)
	cfg, err := config.Load(p)
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	if cfg.CompressionFormat != compress.FormatGzip {
		t.Errorf("CompressionFormat = %q, want gzip", cfg.CompressionFormat)
	}
	if cfg.CompressionLevel != 6 {
		t.Errorf("CompressionLevel = %d, want 6", cfg.CompressionLevel)
	}
}

func TestLoad_DefaultsToGzip(t *testing.T) {
	p := writeConfig(t, `
database_url: postgres://user:pass@localhost/db
output_dir: /tmp/dumps
`)
	cfg, err := config.Load(p)
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	if cfg.CompressionFormat != compress.FormatGzip {
		t.Errorf("CompressionFormat = %q, want gzip (default)", cfg.CompressionFormat)
	}
}

func TestLoad_ZstdFormat(t *testing.T) {
	p := writeConfig(t, `
database_url: postgres://user:pass@localhost/db
output_dir: /tmp/dumps
compression_format: zstd
compression_level: 3
`)
	cfg, err := config.Load(p)
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	if cfg.CompressionFormat != compress.FormatZstd {
		t.Errorf("CompressionFormat = %q, want zstd", cfg.CompressionFormat)
	}
}

func TestLoad_NoneFormat(t *testing.T) {
	p := writeConfig(t, `
database_url: postgres://user:pass@localhost/db
output_dir: /tmp/dumps
compression_format: none
`)
	cfg, err := config.Load(p)
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	if cfg.CompressionFormat != compress.FormatNone {
		t.Errorf("CompressionFormat = %q, want none", cfg.CompressionFormat)
	}
}

func TestLoad_InvalidFormat(t *testing.T) {
	p := writeConfig(t, `
database_url: postgres://user:pass@localhost/db
output_dir: /tmp/dumps
compression_format: bzip2
`)
	if _, err := config.Load(p); err == nil {
		t.Error("expected error for unknown compression_format, got nil")
	}
}

func TestLoad_MissingDatabaseURL(t *testing.T) {
	p := writeConfig(t, `
output_dir: /tmp/dumps
`)
	if _, err := config.Load(p); err == nil {
		t.Error("expected error for missing database_url, got nil")
	}
}

func TestLoad_MissingOutputDir(t *testing.T) {
	p := writeConfig(t, `
database_url: postgres://user:pass@localhost/db
`)
	if _, err := config.Load(p); err == nil {
		t.Error("expected error for missing output_dir, got nil")
	}
}

func TestConfig_CompressorConfig(t *testing.T) {
	p := writeConfig(t, `
database_url: postgres://user:pass@localhost/db
output_dir: /tmp/dumps
compression_format: zstd
compression_level: 4
`)
	cfg, err := config.Load(p)
	if err != nil {
		t.Fatalf("Load: %v", err)
	}

	cc := cfg.CompressorConfig()
	if cc.Format != compress.FormatZstd {
		t.Errorf("Format = %q, want zstd", cc.Format)
	}
	if cc.Level != 4 {
		t.Errorf("Level = %d, want 4", cc.Level)
	}
}