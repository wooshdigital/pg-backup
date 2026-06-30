package storage_test

import (
	"strings"
	"testing"
	"time"

	"github.com/sdreger/cmd-worker/internal/storage"
)

func TestGenerateKey(t *testing.T) {
	t.Parallel()

	ts := time.Date(2025, 6, 15, 10, 30, 45, 0, time.UTC)
	key := storage.GenerateKey(ts)

	tests := []struct {
		name    string
		contain string
	}{
		{"year", "2025"},
		{"month", "06"},
		{"day", "15"},
		{"prefix", "backups/"},
		{"filename prefix", "backup-"},
		{"extension", ".dump.gz"},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			if !strings.Contains(key, tc.contain) {
				t.Errorf("key %q does not contain %q", key, tc.contain)
			}
		})
	}
}