package config

import (
	"os"
	"path/filepath"
	"testing"
	"time"
)

func writeConfig(t *testing.T, content string) string {
	t.Helper()
	f, err := os.CreateTemp(t.TempDir(), "config-*.yaml")
	if err != nil {
		t.Fatalf("creating temp config: %v", err)
	}
	if _, err := f.WriteString(content); err != nil {
		t.Fatalf("writing temp config: %v", err)
	}
	_ = f.Close()
	return f.Name()
}

func TestLoad_Valid(t *testing.T) {
	yaml := `
dsn: "postgres://user:pass@localhost/db"
output_dir: "/tmp/dumps"
schedule: "0 2 * * *"
pg_dump:
  binary_path: "/usr/bin/pg_dump"
  format: "custom"
  extra_args:
    - "--compress=9"
retention:
  max_age: 168h
  max_count: 7
`
	path := writeConfig(t, yaml)
	cfg, err := Load(path)
	if err != nil {
		t.Fatalf("Load: unexpected error: %v", err)
	}

	if cfg.DSN != "postgres://user:pass@localhost/db" {
		t.Errorf("DSN: got %q", cfg.DSN)
	}
	if cfg.OutputDir != "/tmp/dumps" {
		t.Errorf("OutputDir: got %q", cfg.OutputDir)
	}
	if cfg.PgDump.Format != "custom" {
		t.Errorf("Format: got %q", cfg.PgDump.Format)
	}
	if cfg.Retention.MaxAge != 168*time.Hour {
		t.Errorf("MaxAge: got %v", cfg.Retention.MaxAge)
	}
	if cfg.Retention.MaxCount != 7 {
		t.Errorf("MaxCount: got %d", cfg.Retention.MaxCount)
	}
}

func TestLoad_MissingFile(t *testing.T) {
	_, err := Load(filepath.Join(t.TempDir(), "nonexistent.yaml"))
	if err == nil {
		t.Fatal("expected error for missing file")
	}
}

func TestLoad_MissingDSN(t *testing.T) {
	yaml := `output_dir: "/tmp"`
	path := writeConfig(t, yaml)
	_, err := Load(path)
	if err == nil {
		t.Fatal("expected error for missing DSN")
	}
}

func TestLoad_MissingOutputDir(t *testing.T) {
	yaml := `dsn: "postgres://localhost/db"`
	path := writeConfig(t, yaml)
	_, err := Load(path)
	if err == nil {
		t.Fatal("expected error for missing output_dir")
	}
}

func TestLoad_InvalidFormat(t *testing.T) {
	yaml := `
dsn: "postgres://localhost/db"
output_dir: "/tmp"
pg_dump:
  format: "json"
`
	path := writeConfig(t, yaml)
	_, err := Load(path)
	if err == nil {
		t.Fatal("expected error for invalid format")
	}
}

func TestLoad_InvalidYAML(t *testing.T) {
	path := writeConfig(t, ":::invalid yaml:::")
	_, err := Load(path)
	if err == nil {
		t.Fatal("expected error for invalid YAML")
	}
}