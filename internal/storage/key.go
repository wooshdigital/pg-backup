package storage

import (
	"fmt"
	"os"
	"strings"
	"time"
)

// Placeholders supported in the key template.
const (
	placeholderDB        = "{db}"
	placeholderDate      = "{date}"
	placeholderTimestamp = "{timestamp}"
	placeholderHostname  = "{hostname}"
)

// KeyParams holds the values used to render a key template.
type KeyParams struct {
	// DB is the database name.
	DB string
	// At is the point-in-time for the backup (used to fill date/timestamp).
	// Defaults to time.Now() if zero.
	At time.Time
}

// RenderKey substitutes all known placeholders in template with values
// derived from p and returns the final S3 key string.
//
// Supported placeholders:
//
//	{db}        – the database name
//	{date}      – UTC date in YYYY-MM-DD format
//	{timestamp} – UTC Unix timestamp (seconds)
//	{hostname}  – the machine hostname (falls back to "unknown" on error)
func RenderKey(template string, p KeyParams) (string, error) {
	if template == "" {
		return "", fmt.Errorf("storage: key template must not be empty")
	}
	if p.DB == "" {
		return "", fmt.Errorf("storage: DB name must not be empty")
	}

	t := p.At
	if t.IsZero() {
		t = time.Now().UTC()
	} else {
		t = t.UTC()
	}

	hostname, err := os.Hostname()
	if err != nil {
		hostname = "unknown"
	}

	result := template
	result = strings.ReplaceAll(result, placeholderDB, p.DB)
	result = strings.ReplaceAll(result, placeholderDate, t.Format("2006-01-02"))
	result = strings.ReplaceAll(result, placeholderTimestamp, fmt.Sprintf("%d", t.Unix()))
	result = strings.ReplaceAll(result, placeholderHostname, hostname)

	return result, nil
}