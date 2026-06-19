package config_test

import (
	"os"
	"testing"

	"github.com/org/pg-s3-backup/internal/config"
)

// setEnv sets multiple environment variables and returns a cleanup function.
func setEnv(t *testing.T, pairs map[string]string) {
	t.Helper()
	for k, v := range pairs {
		if err := os.Setenv(k, v); err != nil {
			t.Fatalf("os.Setenv(%q, %q): %v", k, v, err)
		}
	}
	t.Cleanup(func() {
		for k := range pairs {
			os.Unsetenv(k)
		}
	})
}

func minimalEnv() map[string]string {
	return map[string]string{
		"BACKUP_DATABASE_DSN": "postgres://user:pass@localhost:5432/testdb?sslmode=disable",
		"BACKUP_S3_BUCKET":    "my-backup-bucket",
		"BACKUP_S3_REGION":    "us-east-1",
	}
}

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

func TestLoad_MinimalEnvVars(t *testing.T) {
	setEnv(t, minimalEnv())

	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}

	if cfg.DatabaseDSN != "postgres://user:pass@localhost:5432/testdb?sslmode=disable" {
		t.Errorf("unexpected DatabaseDSN: %q", cfg.DatabaseDSN)
	}
	if cfg.S3Bucket != "my-backup-bucket" {
		t.Errorf("unexpected S3Bucket: %q", cfg.S3Bucket)
	}
	if cfg.S3Region != "us-east-1" {
		t.Errorf("unexpected S3Region: %q", cfg.S3Region)
	}
}

func TestLoad_Defaults(t *testing.T) {
	setEnv(t, minimalEnv())

	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}

	if cfg.S3Prefix != "backups/" {
		t.Errorf("expected default s3_prefix 'backups/', got %q", cfg.S3Prefix)
	}
	if cfg.Schedule != "0 2 * * *" {
		t.Errorf("expected default schedule '0 2 * * *', got %q", cfg.Schedule)
	}
	if cfg.RetentionDays != 30 {
		t.Errorf("expected default retention_days 30, got %d", cfg.RetentionDays)
	}
	if cfg.LogLevel != "info" {
		t.Errorf("expected default log_level 'info', got %q", cfg.LogLevel)
	}
}

func TestLoad_EnvVarOverridesDefault(t *testing.T) {
	env := minimalEnv()
	env["BACKUP_RETENTION_DAYS"] = "7"
	env["BACKUP_LOG_LEVEL"] = "debug"
	env["BACKUP_S3_PREFIX"] = "custom/prefix/"
	env["BACKUP_SCHEDULE"] = "0 3 * * 0"
	setEnv(t, env)

	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}

	if cfg.RetentionDays != 7 {
		t.Errorf("expected retention_days 7, got %d", cfg.RetentionDays)
	}
	if cfg.LogLevel != "debug" {
		t.Errorf("expected log_level 'debug', got %q", cfg.LogLevel)
	}
	if cfg.S3Prefix != "custom/prefix/" {
		t.Errorf("expected s3_prefix 'custom/prefix/', got %q", cfg.S3Prefix)
	}
	if cfg.Schedule != "0 3 * * 0" {
		t.Errorf("expected schedule '0 3 * * 0', got %q", cfg.Schedule)
	}
}

// ---------------------------------------------------------------------------
// Validation failure tests
// ---------------------------------------------------------------------------

func TestLoad_MissingDatabaseDSN(t *testing.T) {
	env := minimalEnv()
	delete(env, "BACKUP_DATABASE_DSN")
	setEnv(t, env)

	_, err := config.Load()
	if err == nil {
		t.Fatal("expected error for missing database_dsn, got nil")
	}
}

func TestLoad_MissingS3Bucket(t *testing.T) {
	env := minimalEnv()
	delete(env, "BACKUP_S3_BUCKET")
	setEnv(t, env)

	_, err := config.Load()
	if err == nil {
		t.Fatal("expected error for missing s3_bucket, got nil")
	}
}

func TestLoad_MissingS3Region(t *testing.T) {
	env := minimalEnv()
	delete(env, "BACKUP_S3_REGION")
	setEnv(t, env)

	_, err := config.Load()
	if err == nil {
		t.Fatal("expected error for missing s3_region, got nil")
	}
}

func TestLoad_InvalidRetentionDays(t *testing.T) {
	env := minimalEnv()
	env["BACKUP_RETENTION_DAYS"] = "0"
	setEnv(t, env)

	_, err := config.Load()
	if err == nil {
		t.Fatal("expected error for retention_days=0, got nil")
	}
}

func TestLoad_InvalidLogLevel(t *testing.T) {
	env := minimalEnv()
	env["BACKUP_LOG_LEVEL"] = "verbose"
	setEnv(t, env)

	_, err := config.Load()
	if err == nil {
		t.Fatal("expected error for invalid log_level, got nil")
	}
}

func TestLoad_MultipleValidationErrors(t *testing.T) {
	// Clear all env vars so nothing is set.
	setEnv(t, map[string]string{
		"BACKUP_DATABASE_DSN": "",
		"BACKUP_S3_BUCKET":    "",
		"BACKUP_S3_REGION":    "",
	})

	_, err := config.Load()
	if err == nil {
		t.Fatal("expected validation error, got nil")
	}
}