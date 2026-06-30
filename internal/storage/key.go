package storage

import (
	"fmt"
	"strings"
	"time"
)

// GenerateKey returns a time-stamped object key under the given prefix.
// Example: "backups/2026-06-30T12-00-00Z.sql.gz"
func GenerateKey(prefix string) string {
	ts := time.Now().UTC().Format("2006-01-02T15-04-05Z")
	name := fmt.Sprintf("%s.sql.gz", ts)
	if prefix == "" {
		return name
	}
	return strings.TrimSuffix(prefix, "/") + "/" + name
}