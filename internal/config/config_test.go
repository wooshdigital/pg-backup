package config_test

import (
	"os"
	"testing"

	"github.com/org/pg-s3-backup/internal/config"
)

// setEnv sets multiple environment variables and returns a cleanup function
// that restores the previous values when called.
func setEnv(t *testing.T, pairs map[string]string) func() {
	t.Helper()
	prev := make(map[string]string, len(pairs))
	for k, v := range pairs {
		prev[k] = os.Getenv(k)
		if err := os.Setenv(k, v); err != nil {
			t.Fatalf("os.Setenv(%q, %q): %v", k, v, err)
		}
	}
	return func() {
		for k, v := range prev {
			if v == "" {
				_ = os.Unsetenv(k)
			} else {
				_ = os.Setenv(k, v)
			}
		}
	}
}

// minimalEnv returns the smallest set of env vars that satisfies validation.
func minimalEnv() map[string]string {
	return map[string]string{
		"BACKUP_DB_DSN":    "postgres://user:pass@localhost:5432/testdb?sslmode=disable",
		"BACKUP_S3_BUCKET": "my-backup-bucket",
		"BACKUP_S3_REGION": "us-east-1",
	}
}

func TestLoad_MinimalValidConfig(t *testing.T) {
	cleanup := setEnv(t, minimalEnv())
	defer cleanup()

	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}

	if cfg.DBDSN == "" {
		t.Error("expected DBDSN to be set")
	}
	if cfg.S3Bucket != "my-backup-bucket" {
		t.Errorf("expected S3Bucket=my-backup-bucket, got %q", cfg.S3Bucket)
	}
	if cfg.S3Region != "us-east-1" {
		t.Errorf("expected S3Region=us-east-1, got %q", cfg.S3Region)
	}
	// Defaults
	if cfg.RetentionDays != 30 {
		t.Errorf("expected default RetentionDays=30, got %d", cfg.RetentionDays)
	}
	if cfg.LogLevel != "info" {
		t.Errorf("expected default LogLevel=info, got %q", cfg.LogLevel)
	}
	if cfg.Schedule != "0 2 * * *" {
		t.Errorf("expected default Schedule='0 2 * * *', got %q", cfg.Schedule)
	}
	if cfg.S3Prefix != "backups/" {
		t.Errorf("expected default S3Prefix='backups/', got %q", cfg.S3Prefix)
	}
}

func TestLoad_EnvVarOverridesDefault(t *testing.T) {
	env := minimalEnv()
	env["BACKUP_RETENTION_DAYS"] = "7"
	env["BACKUP_LOG_LEVEL"] = "debug"
	env["BACKUP_SCHEDULE"] = "0 3 * * 0"
	env["BACKUP_S3_PREFIX"] = "prod/backups/"

	cleanup := setEnv(t, env)
	defer cleanup()

	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if cfg.RetentionDays != 7 {
		t.Errorf("expected RetentionDays=7, got %d", cfg.RetentionDays)
	}
	if cfg.LogLevel != "debug" {
		t.Errorf("expected LogLevel=debug, got %q", cfg.LogLevel)
	}
	if cfg.Schedule != "0 3 * * 0" {
		t.Errorf("expected Schedule='0 3 * * 0', got %q", cfg.Schedule)
	}
	if cfg.S3Prefix != "prod/backups/" {
		t.Errorf("expected S3Prefix='prod/backups/', got %q", cfg.S3Prefix)
	}
}

func TestLoad_MissingDBDSN(t *testing.T) {
	env := minimalEnv()
	delete(env, "BACKUP_DB_DSN")
	// Ensure any existing env var is cleared.
	cleanup := setEnv(t, env)
	defer cleanup()
	_ = os.Unsetenv("BACKUP_DB_DSN")

	_, err := config.Load()
	if err == nil {
		t.Fatal("expected validation error for missing db_dsn, got nil")
	}
}

func TestLoad_MissingS3Bucket(t *testing.T) {
	env := minimalEnv()
	delete(env, "BACKUP_S3_BUCKET")
	cleanup := setEnv(t, env)
	defer cleanup()
	_ = os.Unsetenv("BACKUP_S3_BUCKET")

	_, err := config.Load()
	if err == nil {
		t.Fatal("expected validation error for missing s3_bucket, got nil")
	}
}

func TestLoad_MissingS3Region(t *testing.T) {
	env := minimalEnv()
	delete(env, "BACKUP_S3_REGION")
	cleanup := setEnv(t, env)
	defer cleanup()
	_ = os.Unsetenv("BACKUP_S3_REGION")

	_, err := config.Load()
	if err == nil {
		t.Fatal("expected validation error for missing s3_region, got nil")
	}
}

func TestLoad_InvalidLogLevel(t *testing.T) {
	env := minimalEnv()
	env["BACKUP_LOG_LEVEL"] = "verbose" // not a valid zerolog level

	cleanup := setEnv(t, env)
	defer cleanup()

	_, err := config.Load()
	if err == nil {
		t.Fatal("expected validation error for invalid log_level, got nil")
	}
}

func TestLoad_InvalidRetentionDays(t *testing.T) {
	env := minimalEnv()
	env["BACKUP_RETENTION_DAYS"] = "0"

	cleanup := setEnv(t, env)
	defer cleanup()

	_, err := config.Load()
	if err == nil {
		t.Fatal("expected validation error for retention_days=0, got nil")
	}
}

func TestLoad_NegativeRetentionDays(t *testing.T) {
	env := minimalEnv()
	env["BACKUP_RETENTION_DAYS"] = "-5"

	cleanup := setEnv(t, env)
	defer cleanup()

	_, err := config.Load()
	if err == nil {
		t.Fatal("expected validation error for negative retention_days, got nil")
	}
}

func TestLoad_AllValidLogLevels(t *testing.T) {
	levels := []string{"trace", "debug", "info", "warn", "error", "fatal", "panic"}
	for _, level := range levels {
		t.Run(level, func(t *testing.T) {
			env := minimalEnv()
			env["BACKUP_LOG_LEVEL"] = level
			cleanup := setEnv(t, env)
			defer cleanup()

			_, err := config.Load()
			if err != nil {
				t.Errorf("expected no error for log_level=%q, got: %v", level, err)
			}
		})
	}
}