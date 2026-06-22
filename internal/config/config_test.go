package config_test

import (
	"os"
	"testing"

	"github.com/org/pg-s3-backup/internal/config"
)

// setEnv is a helper that sets environment variables for the duration of a test
// and restores their original values via t.Cleanup.
func setEnv(t *testing.T, pairs map[string]string) {
	t.Helper()
	for k, v := range pairs {
		orig, exists := os.LookupEnv(k)
		if err := os.Setenv(k, v); err != nil {
			t.Fatalf("setenv %s: %v", k, err)
		}
		k := k // capture
		if exists {
			t.Cleanup(func() { os.Setenv(k, orig) })
		} else {
			t.Cleanup(func() { os.Unsetenv(k) })
		}
	}
}

// minimalEnv returns a map with the minimum required env vars so tests that
// only care about one aspect don't have to repeat boilerplate.
func minimalEnv() map[string]string {
	return map[string]string{
		"BACKUP_DATABASE_DSN": "postgres://user:secret@localhost:5432/testdb?sslmode=disable",
		"BACKUP_S3_BUCKET":    "my-backup-bucket",
		"BACKUP_S3_REGION":    "us-east-1",
	}
}

// ── Happy path ───────────────────────────────────────────────────────────────

func TestLoad_MinimalEnvVars(t *testing.T) {
	setEnv(t, minimalEnv())

	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}

	if cfg.DatabaseDSN == "" {
		t.Error("expected DatabaseDSN to be set")
	}
	if cfg.S3Bucket != "my-backup-bucket" {
		t.Errorf("expected S3Bucket 'my-backup-bucket', got %q", cfg.S3Bucket)
	}
	if cfg.S3Region != "us-east-1" {
		t.Errorf("expected S3Region 'us-east-1', got %q", cfg.S3Region)
	}
}

func TestLoad_Defaults(t *testing.T) {
	setEnv(t, minimalEnv())

	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if cfg.S3Prefix != "backups/" {
		t.Errorf("expected default S3Prefix 'backups/', got %q", cfg.S3Prefix)
	}
	if cfg.Schedule != "0 2 * * *" {
		t.Errorf("expected default Schedule '0 2 * * *', got %q", cfg.Schedule)
	}
	if cfg.RetentionDays != 30 {
		t.Errorf("expected default RetentionDays 30, got %d", cfg.RetentionDays)
	}
	if cfg.LogLevel != "info" {
		t.Errorf("expected default LogLevel 'info', got %q", cfg.LogLevel)
	}
}

func TestLoad_EnvVarOverridesDefault(t *testing.T) {
	env := minimalEnv()
	env["BACKUP_RETENTION_DAYS"] = "7"
	env["BACKUP_LOG_LEVEL"] = "debug"
	env["BACKUP_SCHEDULE"] = "0 3 * * *"
	env["BACKUP_S3_PREFIX"] = "custom/prefix/"
	setEnv(t, env)

	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if cfg.RetentionDays != 7 {
		t.Errorf("expected RetentionDays 7, got %d", cfg.RetentionDays)
	}
	if cfg.LogLevel != "debug" {
		t.Errorf("expected LogLevel 'debug', got %q", cfg.LogLevel)
	}
	if cfg.Schedule != "0 3 * * *" {
		t.Errorf("expected Schedule '0 3 * * *', got %q", cfg.Schedule)
	}
	if cfg.S3Prefix != "custom/prefix/" {
		t.Errorf("expected S3Prefix 'custom/prefix/', got %q", cfg.S3Prefix)
	}
}

func TestLoad_LogLevelNormalisedToLowerCase(t *testing.T) {
	env := minimalEnv()
	env["BACKUP_LOG_LEVEL"] = "WARN"
	setEnv(t, env)

	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if cfg.LogLevel != "warn" {
		t.Errorf("expected normalised LogLevel 'warn', got %q", cfg.LogLevel)
	}
}

// ── Validation failures ───────────────────────────────────────────────────────

func TestLoad_MissingDatabaseDSN(t *testing.T) {
	env := minimalEnv()
	delete(env, "BACKUP_DATABASE_DSN")
	// Unset in case it was inherited from the shell
	os.Unsetenv("BACKUP_DATABASE_DSN")
	setEnv(t, env)

	_, err := config.Load()
	if err == nil {
		t.Fatal("expected error when DatabaseDSN is missing, got nil")
	}
}

func TestLoad_MissingS3Bucket(t *testing.T) {
	env := minimalEnv()
	delete(env, "BACKUP_S3_BUCKET")
	os.Unsetenv("BACKUP_S3_BUCKET")
	setEnv(t, env)

	_, err := config.Load()
	if err == nil {
		t.Fatal("expected error when S3Bucket is missing, got nil")
	}
}

func TestLoad_MissingS3Region(t *testing.T) {
	env := minimalEnv()
	delete(env, "BACKUP_S3_REGION")
	os.Unsetenv("BACKUP_S3_REGION")
	setEnv(t, env)

	_, err := config.Load()
	if err == nil {
		t.Fatal("expected error when S3Region is missing, got nil")
	}
}

func TestLoad_InvalidRetentionDays(t *testing.T) {
	env := minimalEnv()
	env["BACKUP_RETENTION_DAYS"] = "0"
	setEnv(t, env)

	_, err := config.Load()
	if err == nil {
		t.Fatal("expected error when RetentionDays is 0, got nil")
	}
}

func TestLoad_InvalidLogLevel(t *testing.T) {
	env := minimalEnv()
	env["BACKUP_LOG_LEVEL"] = "verbose"
	setEnv(t, env)

	_, err := config.Load()
	if err == nil {
		t.Fatal("expected error for invalid log level 'verbose', got nil")
	}
}

// ── MaskDSN ───────────────────────────────────────────────────────────────────

func TestMaskDSN_WithPassword(t *testing.T) {
	dsn := "postgres://alice:s3cr3t@db.example.com:5432/mydb?sslmode=require"
	masked := config.MaskDSN(dsn)

	if masked == dsn {
		t.Error("expected password to be masked but DSN was unchanged")
	}
	if contains(masked, "s3cr3t") {
		t.Errorf("password should be masked, got: %s", masked)
	}
	if !contains(masked, "alice") {
		t.Errorf("username should remain visible, got: %s", masked)
	}
	if !contains(masked, "***") {
		t.Errorf("expected '***' placeholder in masked DSN, got: %s", masked)
	}
}

func TestMaskDSN_WithoutPassword(t *testing.T) {
	dsn := "postgres://alice@db.example.com:5432/mydb"
	masked := config.MaskDSN(dsn)
	if masked != dsn {
		t.Errorf("DSN without password should be unchanged; got %q", masked)
	}
}

func TestMaskDSN_Empty(t *testing.T) {
	if got := config.MaskDSN(""); got != "" {
		t.Errorf("expected empty string, got %q", got)
	}
}

func TestMaskDSN_NonURLDSN(t *testing.T) {
	// Key=value style DSN — cannot parse as URL, should be fully redacted.
	dsn := "host=localhost user=alice password=s3cr3t dbname=mydb"
	masked := config.MaskDSN(dsn)
	if masked == dsn {
		t.Error("non-URL DSN containing password should be redacted")
	}
}

// ── helpers ───────────────────────────────────────────────────────────────────

func contains(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr ||
		len(substr) == 0 ||
		indexOfSubstr(s, substr) >= 0)
}

func indexOfSubstr(s, sub string) int {
	for i := 0; i <= len(s)-len(sub); i++ {
		if s[i:i+len(sub)] == sub {
			return i
		}
	}
	return -1
}