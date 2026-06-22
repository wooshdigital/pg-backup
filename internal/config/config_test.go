package config_test

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/org/pg-s3-backup/internal/config"
)

// setEnv sets multiple environment variables and returns a cleanup function
// that unsets them all. Call defer cleanup() immediately after setEnv.
func setEnv(t *testing.T, pairs map[string]string) func() {
	t.Helper()
	originals := make(map[string]string, len(pairs))
	for k, v := range pairs {
		originals[k] = os.Getenv(k)
		if err := os.Setenv(k, v); err != nil {
			t.Fatalf("failed to set env var %s: %v", k, err)
		}
	}
	return func() {
		for k, orig := range originals {
			if orig == "" {
				os.Unsetenv(k)
			} else {
				os.Setenv(k, orig)
			}
		}
	}
}

// minimalEnv returns the minimum set of env vars needed to pass validation.
func minimalEnv() map[string]string {
	return map[string]string{
		"PG_S3_BACKUP_DATABASE_DSN": "postgres://user:pass@localhost:5432/mydb?sslmode=disable",
		"PG_S3_BACKUP_S3_BUCKET":   "my-backup-bucket",
		"PG_S3_BACKUP_S3_REGION":   "us-east-1",
	}
}

// TestLoad_ValidMinimalConfig verifies that a config with only required fields
// loads successfully and that defaults are applied for optional fields.
func TestLoad_ValidMinimalConfig(t *testing.T) {
	cleanup := setEnv(t, minimalEnv())
	defer cleanup()

	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}

	if cfg.DatabaseDSN != "postgres://user:pass@localhost:5432/mydb?sslmode=disable" {
		t.Errorf("unexpected DatabaseDSN: %q", cfg.DatabaseDSN)
	}
	if cfg.S3Bucket != "my-backup-bucket" {
		t.Errorf("unexpected S3Bucket: %q", cfg.S3Bucket)
	}
	if cfg.S3Region != "us-east-1" {
		t.Errorf("unexpected S3Region: %q", cfg.S3Region)
	}

	// Defaults
	if cfg.S3Prefix != "backups/" {
		t.Errorf("expected default S3Prefix %q, got %q", "backups/", cfg.S3Prefix)
	}
	if cfg.Schedule != "0 2 * * *" {
		t.Errorf("expected default Schedule %q, got %q", "0 2 * * *", cfg.Schedule)
	}
	if cfg.RetentionDays != 30 {
		t.Errorf("expected default RetentionDays 30, got %d", cfg.RetentionDays)
	}
	if cfg.LogLevel != "info" {
		t.Errorf("expected default LogLevel %q, got %q", "info", cfg.LogLevel)
	}
}

// TestLoad_EnvVarOverrides verifies that environment variables override all fields.
func TestLoad_EnvVarOverrides(t *testing.T) {
	env := minimalEnv()
	env["PG_S3_BACKUP_S3_PREFIX"] = "custom/prefix/"
	env["PG_S3_BACKUP_SCHEDULE"] = "0 4 * * 0"
	env["PG_S3_BACKUP_RETENTION_DAYS"] = "7"
	env["PG_S3_BACKUP_LOG_LEVEL"] = "debug"

	cleanup := setEnv(t, env)
	defer cleanup()

	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}

	if cfg.S3Prefix != "custom/prefix/" {
		t.Errorf("expected S3Prefix %q, got %q", "custom/prefix/", cfg.S3Prefix)
	}
	if cfg.Schedule != "0 4 * * 0" {
		t.Errorf("expected Schedule %q, got %q", "0 4 * * 0", cfg.Schedule)
	}
	if cfg.RetentionDays != 7 {
		t.Errorf("expected RetentionDays 7, got %d", cfg.RetentionDays)
	}
	if cfg.LogLevel != "debug" {
		t.Errorf("expected LogLevel %q, got %q", "debug", cfg.LogLevel)
	}
}

// TestLoad_MissingDatabaseDSN verifies that omitting database_dsn causes a validation error.
func TestLoad_MissingDatabaseDSN(t *testing.T) {
	env := map[string]string{
		"PG_S3_BACKUP_DATABASE_DSN": "",
		"PG_S3_BACKUP_S3_BUCKET":   "my-bucket",
		"PG_S3_BACKUP_S3_REGION":   "us-east-1",
	}
	cleanup := setEnv(t, env)
	defer cleanup()

	_, err := config.Load()
	if err == nil {
		t.Fatal("expected validation error for missing database_dsn, got nil")
	}
	if !containsSubstr(err.Error(), "database_dsn is required") {
		t.Errorf("error message should mention database_dsn, got: %v", err)
	}
}

// TestLoad_MissingS3Bucket verifies that omitting s3_bucket causes a validation error.
func TestLoad_MissingS3Bucket(t *testing.T) {
	env := map[string]string{
		"PG_S3_BACKUP_DATABASE_DSN": "postgres://user:pass@localhost/db",
		"PG_S3_BACKUP_S3_BUCKET":   "",
		"PG_S3_BACKUP_S3_REGION":   "us-east-1",
	}
	cleanup := setEnv(t, env)
	defer cleanup()

	_, err := config.Load()
	if err == nil {
		t.Fatal("expected validation error for missing s3_bucket, got nil")
	}
	if !containsSubstr(err.Error(), "s3_bucket is required") {
		t.Errorf("error message should mention s3_bucket, got: %v", err)
	}
}

// TestLoad_MissingS3Region verifies that omitting s3_region causes a validation error.
func TestLoad_MissingS3Region(t *testing.T) {
	env := map[string]string{
		"PG_S3_BACKUP_DATABASE_DSN": "postgres://user:pass@localhost/db",
		"PG_S3_BACKUP_S3_BUCKET":   "my-bucket",
		"PG_S3_BACKUP_S3_REGION":   "",
	}
	cleanup := setEnv(t, env)
	defer cleanup()

	_, err := config.Load()
	if err == nil {
		t.Fatal("expected validation error for missing s3_region, got nil")
	}
	if !containsSubstr(err.Error(), "s3_region is required") {
		t.Errorf("error message should mention s3_region, got: %v", err)
	}
}

// TestLoad_InvalidRetentionDays verifies that a non-positive retention_days fails validation.
func TestLoad_InvalidRetentionDays(t *testing.T) {
	env := minimalEnv()
	env["PG_S3_BACKUP_RETENTION_DAYS"] = "0"
	cleanup := setEnv(t, env)
	defer cleanup()

	_, err := config.Load()
	if err == nil {
		t.Fatal("expected validation error for retention_days=0, got nil")
	}
	if !containsSubstr(err.Error(), "retention_days must be >= 1") {
		t.Errorf("error should mention retention_days constraint, got: %v", err)
	}
}

// TestLoad_InvalidLogLevel verifies that an unrecognised log level fails validation.
func TestLoad_InvalidLogLevel(t *testing.T) {
	env := minimalEnv()
	env["PG_S3_BACKUP_LOG_LEVEL"] = "verbose"
	cleanup := setEnv(t, env)
	defer cleanup()

	_, err := config.Load()
	if err == nil {
		t.Fatal("expected validation error for invalid log_level, got nil")
	}
	if !containsSubstr(err.Error(), "log_level must be one of") {
		t.Errorf("error should mention log_level constraint, got: %v", err)
	}
}

// TestLoad_LogLevelNormalisation verifies that log level is lowercased on load.
func TestLoad_LogLevelNormalisation(t *testing.T) {
	env := minimalEnv()
	env["PG_S3_BACKUP_LOG_LEVEL"] = "DEBUG"
	cleanup := setEnv(t, env)
	defer cleanup()

	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}
	if cfg.LogLevel != "debug" {
		t.Errorf("expected log_level to be normalised to %q, got %q", "debug", cfg.LogLevel)
	}
}

// TestLoad_MultipleValidationErrors verifies that all errors are reported together.
func TestLoad_MultipleValidationErrors(t *testing.T) {
	env := map[string]string{
		"PG_S3_BACKUP_DATABASE_DSN":   "",
		"PG_S3_BACKUP_S3_BUCKET":      "",
		"PG_S3_BACKUP_S3_REGION":      "",
		"PG_S3_BACKUP_RETENTION_DAYS": "0",
		"PG_S3_BACKUP_LOG_LEVEL":      "bad",
	}
	cleanup := setEnv(t, env)
	defer cleanup()

	_, err := config.Load()
	if err == nil {
		t.Fatal("expected multiple validation errors, got nil")
	}

	errStr := err.Error()
	for _, substr := range []string{
		"database_dsn is required",
		"s3_bucket is required",
		"s3_region is required",
		"retention_days must be >= 1",
		"log_level must be one of",
	} {
		if !containsSubstr(errStr, substr) {
			t.Errorf("expected error to contain %q, full error: %v", substr, err)
		}
	}
}

// TestLoad_ConfigFileOverridesDefaults verifies that values in a config.yaml file
// are read and override defaults (but can still be overridden by env vars).
func TestLoad_ConfigFileOverridesDefaults(t *testing.T) {
	// Write a temporary config.yaml
	dir := t.TempDir()
	content := `
database_dsn: "postgres://file:secret@db:5432/testdb"
s3_bucket: "file-bucket"
s3_region: "eu-west-1"
s3_prefix: "from-file/"
schedule: "0 3 * * *"
retention_days: 14
log_level: "warn"
`
	cfgPath := filepath.Join(dir, "config.yaml")
	if err := os.WriteFile(cfgPath, []byte(content), 0600); err != nil {
		t.Fatalf("failed to write temp config file: %v", err)
	}

	// Change to the temp dir so viper finds config.yaml
	origDir, err := os.Getwd()
	if err != nil {
		t.Fatalf("failed to get working directory: %v", err)
	}
	if err := os.Chdir(dir); err != nil {
		t.Fatalf("failed to chdir to temp dir: %v", err)
	}
	defer os.Chdir(origDir)

	// Clear any env vars that might interfere
	cleanup := setEnv(t, map[string]string{
		"PG_S3_BACKUP_DATABASE_DSN":   "",
		"PG_S3_BACKUP_S3_BUCKET":      "",
		"PG_S3_BACKUP_S3_REGION":      "",
		"PG_S3_BACKUP_S3_PREFIX":      "",
		"PG_S3_BACKUP_SCHEDULE":       "",
		"PG_S3_BACKUP_RETENTION_DAYS": "",
		"PG_S3_BACKUP_LOG_LEVEL":      "",
	})
	defer cleanup()

	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}

	if cfg.DatabaseDSN != "postgres://file:secret@db:5432/testdb" {
		t.Errorf("unexpected DatabaseDSN: %q", cfg.DatabaseDSN)
	}
	if cfg.S3Bucket != "file-bucket" {
		t.Errorf("unexpected S3Bucket: %q", cfg.S3Bucket)
	}
	if cfg.S3Region != "eu-west-1" {
		t.Errorf("unexpected S3Region: %q", cfg.S3Region)
	}
	if cfg.S3Prefix != "from-file/" {
		t.Errorf("unexpected S3Prefix: %q", cfg.S3Prefix)
	}
	if cfg.Schedule != "0 3 * * *" {
		t.Errorf("unexpected Schedule: %q", cfg.Schedule)
	}
	if cfg.RetentionDays != 14 {
		t.Errorf("unexpected RetentionDays: %d", cfg.RetentionDays)
	}
	if cfg.LogLevel != "warn" {
		t.Errorf("unexpected LogLevel: %q", cfg.LogLevel)
	}
}

// containsSubstr is a small helper to keep test assertions readable.
func containsSubstr(s, sub string) bool {
	return len(s) >= len(sub) && (s == sub || len(sub) == 0 ||
		func() bool {
			for i := 0; i <= len(s)-len(sub); i++ {
				if s[i:i+len(sub)] == sub {
					return true
				}
			}
			return false
		}())
}