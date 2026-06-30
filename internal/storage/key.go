package storage

import (
	"fmt"
	"time"
)

// GenerateKey creates a time-stamped object key for a backup file.
// Format: backups/2006-01-02T150405Z.sql.gz
func GenerateKey(ext string) string {
	ts := time.Now().UTC().Format("2006-01-02T150405Z")
	return fmt.Sprintf("backups/%s.sql%s", ts, ext)
}