package config_test

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/org/pg-s3-backup/internal/config"
)

// setEnv sets multiple environment variables for the duration of a test and
// restores them (or unsets them) when the test completes.
func setEnv(t *testing.T, pairs map[string]string) {
	t.Helper()
	for k, v := range pairs {
		prev, existed := os.LookupEnv(k)
		if err := os.Setenv(k, v); err != nil {
			t.Fatalf("setenv %s: %v", k, err)
		}
		t.Cleanup(func() {
			if existed {
				_ = os.Setenv(k, prev)
			} else {
				_ = os.Unsetenv(k)
			}
		})
	}
}

// minimalEnv returns the smallest set of env vars that makes Load() succeed.
func minimalEnv() map[string]string {
	return map[string]string{
		"BACKUP_DATABASE_DSN": "postgres://user:pass@localhost:5432/testdb?sslmode=disable",
		"BACKUP_S3_BUCKET":    "my-backup-bucket",
		"BACKUP_S3_REGION":    "us-east-1",
	}
}

// TestLoad_EnvVarsOnly verifies that a valid config can be loaded purely from
// environment variables with no config file present.
func TestLoad_EnvVarsOnly(t *testing.T) {
	setEnv(t, minimalEnv())

	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("Load() returned unexpected error: %v", err)
	}

	if cfg.DatabaseDSN != "postgres://user:pass@localhost:5432/testdb?sslmode=disable" {
		t.Errorf("DatabaseDSN = %q; want postgres://...", cfg.DatabaseDSN)
	}
	if cfg.S3Bucket != "my-backup-bucket" {
		t.Errorf("S3Bucket = %q; want my-backup-bucket", cfg.S3Bucket)
	}
	if cfg.S3Region != "us-east-1" {
		t.Errorf("S3Region = %q; want us-east-1", cfg.S3Region)
	}
}

// TestLoad_Defaults verifies that optional fields receive their default values.
func TestLoad_Defaults(t *testing.T) {
	setEnv(t, minimalEnv())

	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("Load() returned unexpected error: %v", err)
	}

	if cfg.S3Prefix != "backups/" {
		t.Errorf("S3Prefix = %q; want backups/", cfg.S3Prefix)
	}
	if cfg.Schedule != "0 2 * * *" {
		t.Errorf("Schedule = %q; want 0 2 * * *", cfg.Schedule)
	}
	if cfg.RetentionDays != 30 {
		t.Errorf("RetentionDays = %d; want 30", cfg.RetentionDays)
	}
	if cfg.LogLevel != "info" {
		t.Errorf("LogLevel = %q; want info", cfg.LogLevel)
	}
}

// TestLoad_EnvOverridesDefaults ensures that env vars properly override
// built-in defaults.
func TestLoad_EnvOverridesDefaults(t *testing.T) {
	env := minimalEnv()
	env["BACKUP_S3_PREFIX"] = "custom/prefix/"
	env["BACKUP_SCHEDULE"] = "30 3 * * 0"
	env["BACKUP_RETENTION_DAYS"] = "7"
	env["BACKUP_LOG_LEVEL"] = "debug"
	setEnv(t, env)

	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("Load() returned unexpected error: %v", err)
	}

	if cfg.S3Prefix != "custom/prefix/" {
		t.Errorf("S3Prefix = %q; want custom/prefix/", cfg.S3Prefix)
	}
	if cfg.Schedule != "30 3 * * 0" {
		t.Errorf("Schedule = %q; want 30 3 * * 0", cfg.Schedule)
	}
	if cfg.RetentionDays != 7 {
		t.Errorf("RetentionDays = %d; want 7", cfg.RetentionDays)
	}
	if cfg.LogLevel != "debug" {
		t.Errorf("LogLevel = %q; want debug", cfg.LogLevel)
	}
}

// TestLoad_MissingRequired verifies that missing required fields produce a
// descriptive error.
func TestLoad_MissingRequired(t *testing.T) {
	// Ensure none of the required vars are set.
	for _, k := range []string{"BACKUP_DATABASE_DSN", "BACKUP_S3_BUCKET", "BACKUP_S3_REGION"} {
		_ = os.Unsetenv(k)
		t.Cleanup(func() { _ = os.Unsetenv(k) })
	}

	_, err := config.Load()
	if err == nil {
		t.Fatal("Load() should have failed with missing required fields but returned nil error")
	}
}

// TestLoad_MissingDatabaseDSN verifies that an absent database DSN is caught.
func TestLoad_MissingDatabaseDSN(t *testing.T) {
	env := minimalEnv()
	delete(env, "BACKUP_DATABASE_DSN")
	setEnv(t, env)
	// Ensure the var really is absent.
	_ = os.Unsetenv("BACKUP_DATABASE_DSN")

	_, err := config.Load()
	if err == nil {
		t.Fatal("expected error for missing database_dsn, got nil")
	}
}

// TestLoad_MissingS3Bucket verifies that an absent S3 bucket is caught.
func TestLoad_MissingS3Bucket(t *testing.T) {
	env := minimalEnv()
	delete(env, "BACKUP_S3_BUCKET")
	setEnv(t, env)
	_ = os.Unsetenv("BACKUP_S3_BUCKET")

	_, err := config.Load()
	if err == nil {
		t.Fatal("expected error for missing s3_bucket, got nil")
	}
}

// TestLoad_MissingS3Region verifies that an absent S3 region is caught.
func TestLoad_MissingS3Region(t *testing.T) {
	env := minimalEnv()
	delete(env, "BACKUP_S3_REGION")
	setEnv(t, env)
	_ = os.Unsetenv("BACKUP_S3_REGION")

	_, err := config.Load()
	if err == nil {
		t.Fatal("expected error for missing s3_region, got nil")
	}
}

// TestLoad_InvalidLogLevel verifies that an unrecognised log level is rejected.
func TestLoad_InvalidLogLevel(t *testing.T) {
	env := minimalEnv()
	env["BACKUP_LOG_LEVEL"] = "verbose" // not a valid zerolog level
	setEnv(t, env)

	_, err := config.Load()
	if err == nil {
		t.Fatal("expected error for invalid log_level, got nil")
	}
}

// TestLoad_InvalidRetentionDays verifies that retention_days < 1 is rejected.
func TestLoad_InvalidRetentionDays(t *testing.T) {
	env := minimalEnv()
	env["BACKUP_RETENTION_DAYS"] = "0"
	setEnv(t, env)

	_, err := config.Load()
	if err == nil {
		t.Fatal("expected error for retention_days=0, got nil")
	}
}

// TestLoad_YAMLConfigFile verifies that values from a YAML config file are
// picked up correctly.
func TestLoad_YAMLConfigFile(t *testing.T) {
	// Write a temporary config.yaml and change to that directory.
	dir := t.TempDir()
	content := []byte(`
database_dsn: "postgres://yaml-user:yaml-pass@db:5432/prod"
s3_bucket: "yaml-bucket"
s3_region: "eu-west-1"
s3_prefix: "yaml/prefix/"
schedule: "0 4 * * *"
retention_days: 14
log_level: "warn"
`)
	if err := os.WriteFile(filepath.Join(dir, "config.yaml"), content, 0o600); err != nil {
		t.Fatalf("writing temp config: %v", err)
	}

	// Change working directory so Viper can discover the file.
	orig, _ := os.Getwd()
	t.Cleanup(func() { _ = os.Chdir(orig) })
	if err := os.Chdir(dir); err != nil {
		t.Fatalf("chdir: %v", err)
	}

	// Unset env vars that might shadow the file values.
	for _, k := range []string{
		"BACKUP_DATABASE_DSN", "BACKUP_S3_BUCKET", "BACKUP_S3_REGION",
		"BACKUP_S3_PREFIX", "BACKUP_SCHEDULE", "BACKUP_RETENTION_DAYS", "BACKUP_LOG_LEVEL",
	} {
		_ = os.Unsetenv(k)
		t.Cleanup(func() { _ = os.Unsetenv(k) })
	}

	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("Load() returned unexpected error: %v", err)
	}

	tests := []struct {
		name string
		got  interface{}
		want interface{}
	}{
		{"DatabaseDSN", cfg.DatabaseDSN, "postgres://yaml-user:yaml-pass@db:5432/prod"},
		{"S3Bucket", cfg.S3Bucket, "yaml-bucket"},
		{"S3Region", cfg.S3Region, "eu-west-1"},
		{"S3Prefix", cfg.S3Prefix, "yaml/prefix/"},
		{"Schedule", cfg.Schedule, "0 4 * * *"},
		{"RetentionDays", cfg.RetentionDays, 14},
		{"LogLevel", cfg.LogLevel, "warn"},
	}
	for _, tt := range tests {
		if tt.got != tt.want {
			t.Errorf("%s = %v; want %v", tt.name, tt.got, tt.want)
		}
	}
}

// TestLoad_EnvOverridesYAML verifies that env vars take precedence over file
// values (core Viper contract).
func TestLoad_EnvOverridesYAML(t *testing.T) {
	dir := t.TempDir()
	content := []byte(`
database_dsn: "postgres://file-user:file-pass@db:5432/prod"
s3_bucket: "file-bucket"
s3_region: "us-west-2"
`)
	if err := os.WriteFile(filepath.Join(dir, "config.yaml"), content, 0o600); err != nil {
		t.Fatalf("writing temp config: %v", err)
	}

	orig, _ := os.Getwd()
	t.Cleanup(func() { _ = os.Chdir(orig) })
	if err := os.Chdir(dir); err != nil {
		t.Fatalf("chdir: %v", err)
	}

	// Override the bucket via env var.
	setEnv(t, map[string]string{
		"BACKUP_S3_BUCKET": "env-bucket",
	})

	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("Load() returned unexpected error: %v", err)
	}

	if cfg.S3Bucket != "env-bucket" {
		t.Errorf("S3Bucket = %q; want env-bucket (env should override file)", cfg.S3Bucket)
	}
	// File-sourced value should still be present for other keys.
	if cfg.S3Region != "us-west-2" {
		t.Errorf("S3Region = %q; want us-west-2 (from config file)", cfg.S3Region)
	}
}