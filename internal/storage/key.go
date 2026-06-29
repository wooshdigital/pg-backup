package storage

import (
	"fmt"
	"time"
)

// GenerateKey produces a time-based object key for a backup file.
// Format: backups/YYYY/MM/DD/backup-YYYYMMDD-HHMMSS.dump.gz
func GenerateKey(t time.Time) string {
	return fmt.Sprintf(
		"backups/%04d/%02d/%02d/backup-%04d%02d%02d-%02d%02d%02d.dump.gz",
		t.Year(), t.Month(), t.Day(),
		t.Year(), t.Month(), t.Day(),
		t.Hour(), t.Minute(), t.Second(),
	)
}