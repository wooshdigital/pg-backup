package storage_test

import (
	"testing"
)

// S3 unit tests are kept minimal here; the integration test exercises the real
// S3 code path against LocalStack.
func TestS3Backend_Placeholder(t *testing.T) {
	t.Skip("S3 unit tests require LocalStack; use the integration test suite")
}