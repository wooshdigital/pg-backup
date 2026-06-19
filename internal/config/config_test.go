package config_test

import (
	"testing"

	"github.com/org/pg-s3-backup/internal/config"
	"github.com/spf13/viper"
)

// newViper returns a fresh Viper instance that does NOT read any config files,
// ensuring tests are fully isolated from the developer's local config.yaml.
func newViper(t *testing.T) *viper.Viper {
	t.Helper()
	v := viper.New()
	// Disable config file reading for unit tests
	v.SetConfigFile("/dev/null")
	return v
}

// applyMinimalValid sets the minimum required fields on a Viper instance so
// that Load succeeds without any errors, serving as a baseline for tests that
// only care about one specific aspect of validation.
func applyMinimalValid(v *viper.Viper) {
	v.Set("database_dsn", "postgres://user:pass@localhost:5432/testdb?sslmode=disable")
	v.Set("s3_bucket", "my-backup-bucket")
	v.Set("s3_region", "us-east-1")
	v.Set("schedule", "0 2 * * *")
	v.Set("retention_days", 30)
	v.Set("log_level", "info")
}

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

func TestLoad_ValidConfig(t *testing.T) {
	v := newViper(t)
	applyMinimalValid(v)

	cfg, err := config.LoadWithViper(v)
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
	if cfg.Schedule != "0 2 * * *" {
		t.Errorf("unexpected Schedule: %q", cfg.Schedule)
	}
	if cfg.RetentionDays != 30 {
		t.Errorf("unexpected RetentionDays: %d", cfg.RetentionDays)
	}
	if cfg.LogLevel != "info" {
		t.Errorf("unexpected LogLevel: %q", cfg.LogLevel)
	}
}

func TestLoad_Defaults(t *testing.T) {
	v := newViper(t)
	applyMinimalValid(v)

	// Override only the required fields; let defaults apply for the rest.
	v.Set("s3_prefix", "")     // clear so we can check the default
	v.Set("log_level", "info") // must be valid

	// We need to set a known s3_prefix default — remove override, rely on setDefaults
	// which is called inside LoadWithViper.
	v2 := viper.New()
	v2.Set("database_dsn", "postgres://user:pass@localhost/db")
	v2.Set("s3_bucket", "bucket")
	// intentionally omit s3_region, schedule, retention_days, log_level

	cfg, err := config.LoadWithViper(v2)
	if err != nil {
		t.Fatalf("expected defaults to satisfy validation, got: %v", err)
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
	if cfg.S3Region != "us-east-1" {
		t.Errorf("expected default s3_region 'us-east-1', got %q", cfg.S3Region)
	}
}

// ---------------------------------------------------------------------------
// Env var override tests
// ---------------------------------------------------------------------------

func TestLoad_EnvVarOverride(t *testing.T) {
	t.Setenv("BACKUP_DATABASE_DSN", "postgres://envuser:envpass@envhost:5432/envdb")
	t.Setenv("BACKUP_S3_BUCKET", "env-bucket")
	t.Setenv("BACKUP_S3_REGION", "eu-west-1")
	t.Setenv("BACKUP_SCHEDULE", "30 3 * * *")
	t.Setenv("BACKUP_RETENTION_DAYS", "14")
	t.Setenv("BACKUP_LOG_LEVEL", "debug")

	v := viper.New()
	cfg, err := config.LoadWithViper(v)
	if err != nil {
		t.Fatalf("expected no error with env vars set, got: %v", err)
	}

	if cfg.DatabaseDSN != "postgres://envuser:envpass@envhost:5432/envdb" {
		t.Errorf("env var BACKUP_DATABASE_DSN not applied, got: %q", cfg.DatabaseDSN)
	}
	if cfg.S3Bucket != "env-bucket" {
		t.Errorf("env var BACKUP_S3_BUCKET not applied, got: %q", cfg.S3Bucket)
	}
	if cfg.S3Region != "eu-west-1" {
		t.Errorf("env var BACKUP_S3_REGION not applied, got: %q", cfg.S3Region)
	}
	if cfg.Schedule != "30 3 * * *" {
		t.Errorf("env var BACKUP_SCHEDULE not applied, got: %q", cfg.Schedule)
	}
	if cfg.RetentionDays != 14 {
		t.Errorf("env var BACKUP_RETENTION_DAYS not applied, got: %d", cfg.RetentionDays)
	}
	if cfg.LogLevel != "debug" {
		t.Errorf("env var BACKUP_LOG_LEVEL not applied, got: %q", cfg.LogLevel)
	}
}

// ---------------------------------------------------------------------------
// Validation failure tests
// ---------------------------------------------------------------------------

func TestLoad_MissingDatabaseDSN(t *testing.T) {
	v := newViper(t)
	applyMinimalValid(v)
	v.Set("database_dsn", "")

	_, err := config.LoadWithViper(v)
	if err == nil {
		t.Fatal("expected error for missing database_dsn, got nil")
	}
}

func TestLoad_MissingS3Bucket(t *testing.T) {
	v := newViper(t)
	applyMinimalValid(v)
	v.Set("s3_bucket", "")

	_, err := config.LoadWithViper(v)
	if err == nil {
		t.Fatal("expected error for missing s3_bucket, got nil")
	}
}

func TestLoad_MissingS3Region(t *testing.T) {
	v := newViper(t)
	applyMinimalValid(v)
	v.Set("s3_region", "")

	_, err := config.LoadWithViper(v)
	if err == nil {
		t.Fatal("expected error for missing s3_region, got nil")
	}
}

func TestLoad_InvalidRetentionDays_Zero(t *testing.T) {
	v := newViper(t)
	applyMinimalValid(v)
	v.Set("retention_days", 0)

	_, err := config.LoadWithViper(v)
	if err == nil {
		t.Fatal("expected error for retention_days=0, got nil")
	}
}

func TestLoad_InvalidRetentionDays_Negative(t *testing.T) {
	v := newViper(t)
	applyMinimalValid(v)
	v.Set("retention_days", -5)

	_, err := config.LoadWithViper(v)
	if err == nil {
		t.Fatal("expected error for retention_days=-5, got nil")
	}
}

func TestLoad_InvalidLogLevel(t *testing.T) {
	v := newViper(t)
	applyMinimalValid(v)
	v.Set("log_level", "verbose") // not a valid zerolog level

	_, err := config.LoadWithViper(v)
	if err == nil {
		t.Fatal("expected error for invalid log_level, got nil")
	}
}

func TestLoad_ValidLogLevels(t *testing.T) {
	levels := []string{"trace", "debug", "info", "warn", "error", "fatal", "panic"}

	for _, level := range levels {
		t.Run(level, func(t *testing.T) {
			v := newViper(t)
			applyMinimalValid(v)
			v.Set("log_level", level)

			_, err := config.LoadWithViper(v)
			if err != nil {
				t.Errorf("log_level %q should be valid, got error: %v", level, err)
			}
		})
	}
}

func TestLoad_MultipleErrors(t *testing.T) {
	v := newViper(t)
	// Provide NO required fields whatsoever
	v.Set("retention_days", -1)
	v.Set("log_level", "badlevel")

	_, err := config.LoadWithViper(v)
	if err == nil {
		t.Fatal("expected multiple validation errors, got nil")
	}
	// The error message should mention at least one field
	errMsg := err.Error()
	for _, expectedSubstr := range []string{"database_dsn", "s3_bucket"} {
		if !containsSubstring(errMsg, expectedSubstr) {
			t.Errorf("expected error to mention %q, but got: %v", expectedSubstr, errMsg)
		}
	}
}

func containsSubstring(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr ||
		len(s) > 0 && containsSubstringHelper(s, substr))
}

func containsSubstringHelper(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}