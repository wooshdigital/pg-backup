package storage_test

import (
	"strings"
	"testing"

	"github.com/ssoready/conf/internal/storage"
)

func TestGenerateKey(t *testing.T) {
	key := storage.GenerateKeyForTest(".gz")
	if !strings.HasPrefix(key, "backups/") {
		t.Errorf("key should start with backups/, got %q", key)
	}
	if !strings.HasSuffix(key, ".sql.gz") {
		t.Errorf("key should end with .sql.gz, got %q", key)
	}
}