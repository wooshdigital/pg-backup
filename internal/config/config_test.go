package config_test

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/your-org/dbworker/internal/compress"
	"github.com/your-org/dbworker/internal/config"
)

func writeConfig(t *testing.T, content string) string {
	t.Helper()
	dir := t.TempDir()
	p := filepath.Join(dir, "config.yaml")
	if err := os.WriteFile(p, []byte(content), 0o644); err != nil {
		t.Fatal(err)
	}
	return p
}

func TestLoad_ValidGzip(t *testing.T) {
	p := writeConfig(t, `
database:
  dsn: "postgres://localhost/test"
compression:
  format: gzip
  level: -1
`)
	cfg, err := config.Load(p)
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	if cfg.Compression.Format != compress.FormatGzip {
		t.Errorf("expected gzip, got %q", cfg.Compression.Format)
	}
	if cfg.Compression.Level != -1 {
		t.Errorf("expected level -1, got %d", cfg.Compression.Level)
	}
}

func TestLoad_ValidZstd(t *testing.T) {
	p := writeConfig(t, `
database:
  dsn: "postgres://localhost/test"
compression:
  format: zstd
  level: 2
`)
	cfg, err := config.Load(p)
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	if cfg.Compression.Format != compress.FormatZstd {
		t.Errorf("expected zstd, got %q", cfg.Compression.Format)
	}
}

func TestLoad_Defaults(t *testing.T) {
	p := writeConfig(t, `
database:
  dsn: "postgres://localhost/test"
`)
	cfg, err := config.Load(p)
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	if cfg.Compression.Format != compress.FormatGzip {
		t.Errorf("expected default gzip, got %q", cfg.Compression.Format)
	}
	if cfg.Compression.Level != -1 {
		t.Errorf("expected default level -1, got %d", cfg.Compression.Level)
	}
	if cfg.Storage.OutputDir != "/tmp/dbdumps" {
		t.Errorf("expected default output dir, got %q", cfg.Storage.OutputDir)
	}
}

func TestLoad_MissingDSN(t *testing.T) {
	p := writeConfig(t, `
compression:
  format: gzip
`)
	_, err := config.Load(p)
	if err == nil {
		t.Fatal("expected validation error for missing DSN")
	}
}

func TestLoad_UnknownFormat(t *testing.T) {
	p := writeConfig(t, `
database:
  dsn: "postgres://localhost/test"
compression:
  format: bz2
`)
	_, err := config.Load(p)
	if err == nil {
		t.Fatal("expected error for unknown format")
	}
}

func TestCompressorConfig(t *testing.T) {
	p := writeConfig(t, `
database:
  dsn: "postgres://localhost/test"
compression:
  format: zstd
  level: 3
`)
	cfg, err := config.Load(p)
	if err != nil {
		t.Fatal(err)
	}
	cc := cfg.CompressorConfig()
	if cc.Format != compress.FormatZstd {
		t.Errorf("expected zstd, got %q", cc.Format)
	}
	if cc.Level != 3 {
		t.Errorf("expected level 3, got %d", cc.Level)
	}
}