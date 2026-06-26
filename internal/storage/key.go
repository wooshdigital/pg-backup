package storage

import (
	"fmt"
	"os"
	"strings"
	"time"
)

// KeyData holds the values used to expand a key template.
type KeyData struct {
	// DB is the database name (fills {db}).
	DB string

	// Timestamp is the point-in-time used for {date} and {timestamp}.
	// If zero, time.Now() is used at render time.
	Timestamp time.Time

	// Hostname fills {hostname}. If empty, os.Hostname() is called.
	Hostname string
}

// RenderKey expands the template string using the values in d.
//
// Supported placeholders:
//
//	{db}        – database name
//	{date}      – UTC date in YYYY-MM-DD format
//	{timestamp} – UTC datetime in YYYYMMDDTHHMMSSZ format
//	{hostname}  – machine hostname
//
// An unknown placeholder is left unchanged in the output so that caller
// templates are never silently corrupted.
func RenderKey(template string, d KeyData) (string, error) {
	ts := d.Timestamp
	if ts.IsZero() {
		ts = time.Now().UTC()
	} else {
		ts = ts.UTC()
	}

	hostname := d.Hostname
	if hostname == "" {
		var err error
		hostname, err = os.Hostname()
		if err != nil {
			return "", fmt.Errorf("storage: resolving hostname: %w", err)
		}
	}

	replacer := strings.NewReplacer(
		"{db}", sanitizeSegment(d.DB),
		"{date}", ts.Format("2006-01-02"),
		"{timestamp}", ts.Format("20060102T150405Z"),
		"{hostname}", sanitizeSegment(hostname),
	)

	return replacer.Replace(template), nil
}

// sanitizeSegment removes characters that are unsafe in S3 key segments.
// It keeps alphanumerics, hyphens, underscores, and dots.
func sanitizeSegment(s string) string {
	var b strings.Builder
	b.Grow(len(s))
	for _, r := range s {
		switch {
		case r >= 'a' && r <= 'z',
			r >= 'A' && r <= 'Z',
			r >= '0' && r <= '9',
			r == '-', r == '_', r == '.':
			b.WriteRune(r)
		default:
			b.WriteRune('_')
		}
	}
	return b.String()
}