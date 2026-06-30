//go:build integration

package backup_test

// This file intentionally left minimal. Integration helpers (container setup,
// DSN extraction, etc.) live in docker-compose.test.yml and are driven by
// environment variables consumed by integration_test.go.