package config_test

import (
	"os"
	"testing"

	"github.com/org/pg-s3-backup/internal/config"
)

// setEnv is a helper that sets environment variables for the duration of a
// test and restores the original values (or unsets them) via t.Cleanup.
func setEnv(t *testing.T, pairs map[string]string) {
	t.Helper()
	for k, v := range pairs {
		original, existed := os.LookupEnv(k)
		if err := os.Setenv(k, v); err != nil {
			t.Fatalf("setenv %s: %v", k, err)
		}
		t.Cleanup(func() {
			if existed {
				os.Setenv(k, original)
			} else {
				os.Unsetenv(k)
			}
		})
	}
}

// minimalEnv returns the minimum set of environment variables required to
// produce a valid Config.
func minimalEnv() map[string]string {
	return map[string]string{
		"BACKUP_DATABASE_DSN": "postgres://user:pass@localhost:5432/testdb?sslmode=disable",
		"BACKUP_S3_BUCKET":    "my-backup-bucket",
		"BACKUP_S3_REGION":    "us-east-1",
	}
}

func TestLoad_MinimalValidConfig(t *testing.T) {
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
		t.Fatalf("unexpected error: %v", err)
	}

	if cfg.S3Prefix != "backups/" {
		t.Errorf("expected default s3_prefix %q, got %q", "backups/", cfg.S3Prefix)
	}
	if cfg.Schedule != "0 2 * * *" {
		t.Errorf("expected default schedule %q, got %q", "0 2 * * *", cfg.Schedule)
	}
	if cfg.RetentionDays != 30 {
		t.Errorf("expected default retention_days 30, got %d", cfg.RetentionDays)
	}
	if cfg.LogLevel != "info" {
		t.Errorf("expected default log_level %q, got %q", "info", cfg.LogLevel)
	}
}

func TestLoad_EnvVarOverridesDefault(t *testing.T) {
	env := minimalEnv()
	env["BACKUP_S3_PREFIX"] = "custom/prefix/"
	env["BACKUP_SCHEDULE"] = "0 3 * * 0"
	env["BACKUP_RETENTION_DAYS"] = "7"
	env["BACKUP_LOG_LEVEL"] = "debug"
	setEnv(t, env)

	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if cfg.S3Prefix != "custom/prefix/" {
		t.Errorf("expected S3Prefix %q, got %q", "custom/prefix/", cfg.S3Prefix)
	}
	if cfg.Schedule != "0 3 * * 0" {
		t.Errorf("expected Schedule %q, got %q", "0 3 * * 0", cfg.Schedule)
	}
	if cfg.RetentionDays != 7 {
		t.Errorf("expected RetentionDays 7, got %d", cfg.RetentionDays)
	}
	if cfg.LogLevel != "debug" {
		t.Errorf("expected LogLevel %q, got %q", "debug", cfg.LogLevel)
	}
}

func TestLoad_MissingDatabaseDSN(t *testing.T) {
	env := minimalEnv()
	delete(env, "BACKUP_DATABASE_DSN")
	// Ensure it is not set from a previous test or the shell environment
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

func TestLoad_InvalidLogLevel(t *testing.T) {
	env := minimalEnv()
	env["BACKUP_LOG_LEVEL"] = "verbose" // not a valid zerolog level
	setEnv(t, env)

	_, err := config.Load()
	if err == nil {
		t.Fatal("expected error for invalid log_level, got nil")
	}
}

func TestLoad_NegativeRetentionDays(t *testing.T) {
	env := minimalEnv()
	env["BACKUP_RETENTION_DAYS"] = "-1"
	setEnv(t, env)

	_, err := config.Load()
	if err == nil {
		t.Fatal("expected error for negative retention_days, got nil")
	}
}

func TestLoad_ZeroRetentionDaysIsValid(t *testing.T) {
	env := minimalEnv()
	env["BACKUP_RETENTION_DAYS"] = "0"
	setEnv(t, env)

	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("expected no error for retention_days=0, got: %v", err)
	}
	if cfg.RetentionDays != 0 {
		t.Errorf("expected RetentionDays 0, got %d", cfg.RetentionDays)
	}
}

func TestLoad_AllLogLevelsValid(t *testing.T) {
	levels := []string{"trace", "debug", "info", "warn", "error", "fatal", "panic"}
	for _, level := range levels {
		t.Run(level, func(t *testing.T) {
			env := minimalEnv()
			env["BACKUP_LOG_LEVEL"] = level
			setEnv(t, env)

			_, err := config.Load()
			if err != nil {
				t.Errorf("expected log_level %q to be valid, got error: %v", level, err)
			}
		})
	}
}