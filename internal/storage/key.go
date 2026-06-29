package storage

import (
	"fmt"
	"time"
)

// NewKey generates a storage key based on the provided timestamp.
// Example: backups/2026/06/29/20260629T150405Z.sql.gz
func NewKey(t time.Time) string {
	utc := t.UTC()
	return fmt.Sprintf("backups/%d/%02d/%02d/%sZ.sql.gz",
		utc.Year(),
		utc.Month(),
		utc.Day(),
		utc.Format("20060102T150405"),
	)
}