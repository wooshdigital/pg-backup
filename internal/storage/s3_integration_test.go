//go:build integration

package storage_test

// Integration tests requiring a live LocalStack instance are in s3_test.go
// (they auto-skip when Docker is unavailable).
// This file exists as a build tag anchor for CI pipelines that want to
// explicitly enable integration tests: go test -tags=integration ./internal/storage/...