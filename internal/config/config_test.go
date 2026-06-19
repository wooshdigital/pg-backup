package config_test

import (
	"os"
	"testing"

	"github.com/org/pg-s3-backup/internal/config"
)

// setEnv is a helper that sets environment variables and returns a cleanup
// function that restores the original values when called.
func setEnv(t *testing.T, pairs map[string]string) func() {
	t.Helper()
	original := make(map[string]string, len(pairs))
	for k, v := range pairs {
		original[k] = os.Getenv(k)
		if err := os.Setenv(k, v); err != nil {
			t.Fatalf("setenv %s: %v", k, err)
		}
	}
	return func() {
		for k, v := range original {
			if v == "" {
				_ = os.Unsetenv(k)
			} else {
				_ = os.Setenv(k, v)
			}
		}
	}
}

// minimalEnv returns the minimum set of env vars required to pass validation.
func minimalEnv() map[string]string {
	return map[string]string{
		"PG_S3_BACKUP_DATABASE_DSN": "postgres://user:pass@localhost:5432/testdb?sslmode=disable",
		"PG_S3_BACKUP_S3_BUCKET":   "my-backup-bucket",
		"PG_S3_BACKUP_S3_REGION":   "us-east-1",
	}
}

// ── Happy-path tests ─────────────────────────────────────────────────────────

func TestLoad_MinimalValidConfig(t *testing.T) {
	cleanup := setEnv(t, minimalEnv())
	defer cleanup()

	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}

	if cfg.DatabaseDSN == "" {
		t.Error("DatabaseDSN should not be empty")
	}
	if cfg.S3Bucket != "my-backup-bucket" {
		t.Errorf("expected S3Bucket %q, got %q", "my-backup-bucket", cfg.S3Bucket)
	}
	if cfg.S3Region != "us-east-1" {
		t.Errorf("expected S3Region %q, got %q", "us-east-1", cfg.S3Region)
	}
}

func TestLoad_DefaultValues(t *testing.T) {
	cleanup := setEnv(t, minimalEnv())
	defer cleanup()

	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

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

func TestLoad_EnvVarOverridesDefault(t *testing.T) {
	env := minimalEnv()
	env["PG_S3_BACKUP_S3_PREFIX"] = "custom/prefix/"
	env["PG_S3_BACKUP_SCHEDULE"] = "0 3 * * *"
	env["PG_S3_BACKUP_RETENTION_DAYS"] = "7"
	env["PG_S3_BACKUP_LOG_LEVEL"] = "debug"

	cleanup := setEnv(t, env)
	defer cleanup()

	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if cfg.S3Prefix != "custom/prefix/" {
		t.Errorf("expected S3Prefix %q, got %q", "custom/prefix/", cfg.S3Prefix)
	}
	if cfg.Schedule != "0 3 * * *" {
		t.Errorf("expected Schedule %q, got %q", "0 3 * * *", cfg.Schedule)
	}
	if cfg.RetentionDays != 7 {
		t.Errorf("expected RetentionDays 7, got %d", cfg.RetentionDays)
	}
	if cfg.LogLevel != "debug" {
		t.Errorf("expected LogLevel %q, got %q", "debug", cfg.LogLevel)
	}
}

// ── Validation failure tests ──────────────────────────────────────────────────

func TestLoad_MissingDatabaseDSN(t *testing.T) {
	env := minimalEnv()
	delete(env, "PG_S3_BACKUP_DATABASE_DSN")
	// Ensure it's unset in the environment too
	cleanup := setEnv(t, env)
	defer cleanup()
	_ = os.Unsetenv("PG_S3_BACKUP_DATABASE_DSN")

	_, err := config.Load()
	if err == nil {
		t.Fatal("expected error for missing database_dsn, got nil")
	}
}

func TestLoad_MissingS3Bucket(t *testing.T) {
	env := minimalEnv()
	delete(env, "PG_S3_BACKUP_S3_BUCKET")
	cleanup := setEnv(t, env)
	defer cleanup()
	_ = os.Unsetenv("PG_S3_BACKUP_S3_BUCKET")

	_, err := config.Load()
	if err == nil {
		t.Fatal("expected error for missing s3_bucket, got nil")
	}
}

func TestLoad_MissingS3Region(t *testing.T) {
	env := minimalEnv()
	delete(env, "PG_S3_BACKUP_S3_REGION")
	cleanup := setEnv(t, env)
	defer cleanup()
	_ = os.Unsetenv("PG_S3_BACKUP_S3_REGION")

	_, err := config.Load()
	if err == nil {
		t.Fatal("expected error for missing s3_region, got nil")
	}
}

func TestLoad_InvalidRetentionDays(t *testing.T) {
	env := minimalEnv()
	env["PG_S3_BACKUP_RETENTION_DAYS"] = "0"
	cleanup := setEnv(t, env)
	defer cleanup()

	_, err := config.Load()
	if err == nil {
		t.Fatal("expected error for retention_days=0, got nil")
	}
}

func TestLoad_NegativeRetentionDays(t *testing.T) {
	env := minimalEnv()
	env["PG_S3_BACKUP_RETENTION_DAYS"] = "-5"
	cleanup := setEnv(t, env)
	defer cleanup()

	_, err := config.Load()
	if err == nil {
		t.Fatal("expected error for negative retention_days, got nil")
	}
}

func TestLoad_InvalidLogLevel(t *testing.T) {
	env := minimalEnv()
	env["PG_S3_BACKUP_LOG_LEVEL"] = "verbose"
	cleanup := setEnv(t, env)
	defer cleanup()

	_, err := config.Load()
	if err == nil {
		t.Fatal("expected error for invalid log_level, got nil")
	}
}

func TestLoad_MultipleValidationErrors(t *testing.T) {
	// Unset all required env vars to trigger multiple errors at once
	cleanup := setEnv(t, map[string]string{
		"PG_S3_BACKUP_DATABASE_DSN": "",
		"PG_S3_BACKUP_S3_BUCKET":   "",
		"PG_S3_BACKUP_S3_REGION":   "",
	})
	defer cleanup()

	_, err := config.Load()
	if err == nil {
		t.Fatal("expected validation errors, got nil")
	}
}

func TestLoad_ValidLogLevels(t *testing.T) {
	levels := []string{"debug", "info", "warn", "error"}
	for _, level := range levels {
		t.Run(level, func(t *testing.T) {
			env := minimalEnv()
			env["PG_S3_BACKUP_LOG_LEVEL"] = level
			cleanup := setEnv(t, env)
			defer cleanup()

			cfg, err := config.Load()
			if err != nil {
				t.Fatalf("expected no error for log_level=%q, got: %v", level, err)
			}
			if cfg.LogLevel != level {
				t.Errorf("expected LogLevel %q, got %q", level, cfg.LogLevel)
			}
		})
	}
}