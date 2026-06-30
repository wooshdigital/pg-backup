package storage

import (
	"fmt"
	"time"
)

// GenerateKey creates a time-stamped storage key for a backup object.
// Format: backups/YYYY/MM/DD/backup-YYYYMMDD-HHMMSS.dump.gz
func GenerateKey(t time.Time) string {
	return fmt.Sprintf(
		"backups/%d/%02d/%02d/backup-%s.dump.gz",
		t.Year(), t.Month(), t.Day(),
		t.UTC().Format("20060102-150405"),
	)
}