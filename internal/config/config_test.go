package config_test

import (
	"os"
	"testing"

	"github.com/org/pg-s3-backup/internal/config"
)

// setEnv is a helper that sets an environment variable and registers a cleanup
// function to restore the original value after the test.
func setEnv(t *testing.T, key, value string) {
	t.Helper()
	original, existed := os.LookupEnv(key)
	if err := os.Setenv(key, value); err != nil {
		t.Fatalf("setenv %s: %v", key, err)
	}
	t.Cleanup(func() {
		if existed {
			_ = os.Setenv(key, original)
		} else {
			_ = os.Unsetenv(key)
		}
	})
}

// unsetEnv unsets an env var and restores it after the test.
func unsetEnv(t *testing.T, key string) {
	t.Helper()
	original, existed := os.LookupEnv(key)
	_ = os.Unsetenv(key)
	t.Cleanup(func() {
		if existed {
			_ = os.Setenv(key, original)
		}
	})
}

// minimalEnv sets the three required environment variables and returns a
// cleanup that removes them.
func minimalEnv(t *testing.T) {
	t.Helper()
	setEnv(t, "BACKUP_DATABASE_DSN", "postgres://user:pass@localhost:5432/testdb?sslmode=disable")
	setEnv(t, "BACKUP_S3_BUCKET", "my-backups")
	setEnv(t, "BACKUP_S3_REGION", "us-east-1")
}

// TestLoad_Defaults verifies that default values are applied when only the
// mandatory fields are supplied.
func TestLoad_Defaults(t *testing.T) {
	minimalEnv(t)

	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
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
	if cfg.S3Prefix != "backups/" {
		t.Errorf("expected default s3_prefix 'backups/', got %q", cfg.S3Prefix)
	}
}

// TestLoad_EnvOverride verifies that BACKUP_* env vars override defaults.
func TestLoad_EnvOverride(t *testing.T) {
	minimalEnv(t)
	setEnv(t, "BACKUP_SCHEDULE", "0 3 * * *")
	setEnv(t, "BACKUP_RETENTION_DAYS", "7")
	setEnv(t, "BACKUP_LOG_LEVEL", "debug")
	setEnv(t, "BACKUP_S3_PREFIX", "prod/")

	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if cfg.Schedule != "0 3 * * *" {
		t.Errorf("expected schedule '0 3 * * *', got %q", cfg.Schedule)
	}
	if cfg.RetentionDays != 7 {
		t.Errorf("expected retention_days 7, got %d", cfg.RetentionDays)
	}
	if cfg.LogLevel != "debug" {
		t.Errorf("expected log_level 'debug', got %q", cfg.LogLevel)
	}
	if cfg.S3Prefix != "prod/" {
		t.Errorf("expected s3_prefix 'prod/', got %q", cfg.S3Prefix)
	}
}

// TestLoad_MissingDSN verifies that omitting database_dsn is rejected.
func TestLoad_MissingDSN(t *testing.T) {
	minimalEnv(t)
	unsetEnv(t, "BACKUP_DATABASE_DSN")

	_, err := config.Load()
	if err == nil {
		t.Fatal("expected error when database_dsn is missing, got nil")
	}
}

// TestLoad_MissingBucket verifies that omitting s3_bucket is rejected.
func TestLoad_MissingBucket(t *testing.T) {
	minimalEnv(t)
	unsetEnv(t, "BACKUP_S3_BUCKET")

	_, err := config.Load()
	if err == nil {
		t.Fatal("expected error when s3_bucket is missing, got nil")
	}
}

// TestLoad_MissingRegion verifies that omitting s3_region is rejected.
func TestLoad_MissingRegion(t *testing.T) {
	minimalEnv(t)
	unsetEnv(t, "BACKUP_S3_REGION")

	_, err := config.Load()
	if err == nil {
		t.Fatal("expected error when s3_region is missing, got nil")
	}
}

// TestLoad_InvalidRetentionDays verifies that a non-positive retention_days
// is rejected.
func TestLoad_InvalidRetentionDays(t *testing.T) {
	minimalEnv(t)
	setEnv(t, "BACKUP_RETENTION_DAYS", "0")

	_, err := config.Load()
	if err == nil {
		t.Fatal("expected error when retention_days is 0, got nil")
	}
}

// TestLoad_InvalidLogLevel verifies that an unknown log level is rejected.
func TestLoad_InvalidLogLevel(t *testing.T) {
	minimalEnv(t)
	setEnv(t, "BACKUP_LOG_LEVEL", "verbose")

	_, err := config.Load()
	if err == nil {
		t.Fatal("expected error for invalid log_level 'verbose', got nil")
	}
}

// TestLoad_AllValidLogLevels checks that every supported log level is accepted.
func TestLoad_AllValidLogLevels(t *testing.T) {
	levels := []string{"trace", "debug", "info", "warn", "error", "fatal", "panic"}
	for _, level := range levels {
		t.Run(level, func(t *testing.T) {
			minimalEnv(t)
			setEnv(t, "BACKUP_LOG_LEVEL", level)

			_, err := config.Load()
			if err != nil {
				t.Errorf("expected no error for log_level %q, got: %v", level, err)
			}
		})
	}
}

// TestLoad_MandatoryFields verifies all mandatory fields are populated from env.
func TestLoad_MandatoryFields(t *testing.T) {
	minimalEnv(t)

	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if cfg.DatabaseDSN == "" {
		t.Error("DatabaseDSN should not be empty")
	}
	if cfg.S3Bucket == "" {
		t.Error("S3Bucket should not be empty")
	}
	if cfg.S3Region == "" {
		t.Error("S3Region should not be empty")
	}
}