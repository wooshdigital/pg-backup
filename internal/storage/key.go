package storage

import (
	"fmt"
	"os"
	"strings"
	"time"
)

// KeyParams holds the values used to expand a key template.
type KeyParams struct {
	// DB is the database name.
	DB string
	// T is the time used for {date} and {timestamp} placeholders.
	// If zero, time.Now() is used.
	T time.Time
	// Hostname overrides the machine hostname. If empty, os.Hostname() is used.
	Hostname string
}

// RenderKey expands a key template using the provided parameters.
//
// Supported placeholders:
//
//	{db}        – database name (URL-safe characters only)
//	{date}      – date formatted as YYYY-MM-DD
//	{timestamp} – Unix timestamp in seconds (decimal)
//	{hostname}  – machine hostname
//
// Example template: "backups/{db}/{date}/{db}-{timestamp}.sql.gz"
func RenderKey(template string, p KeyParams) (string, error) {
	if template == "" {
		return "", fmt.Errorf("key template must not be empty")
	}

	t := p.T
	if t.IsZero() {
		t = time.Now().UTC()
	}

	hostname := p.Hostname
	if hostname == "" {
		var err error
		hostname, err = os.Hostname()
		if err != nil {
			hostname = "unknown"
		}
	}
	// Sanitise hostname: replace characters that are not safe in S3 keys.
	hostname = sanitise(hostname)

	db := sanitise(p.DB)

	replacer := strings.NewReplacer(
		"{db}", db,
		"{date}", t.Format("2006-01-02"),
		"{timestamp}", fmt.Sprintf("%d", t.Unix()),
		"{hostname}", hostname,
	)

	key := replacer.Replace(template)

	// Basic validation: key must not be empty after rendering.
	if strings.TrimSpace(key) == "" {
		return "", fmt.Errorf("rendered key is empty")
	}
	// S3 keys must not start with a slash.
	key = strings.TrimPrefix(key, "/")

	return key, nil
}

// sanitise replaces characters that are problematic in S3 object keys with
// underscores. We allow alphanumerics, hyphens, underscores, dots, and
// forward slashes (path separators).
func sanitise(s string) string {
	var b strings.Builder
	b.Grow(len(s))
	for _, r := range s {
		switch {
		case r >= 'a' && r <= 'z':
			b.WriteRune(r)
		case r >= 'A' && r <= 'Z':
			b.WriteRune(r)
		case r >= '0' && r <= '9':
			b.WriteRune(r)
		case r == '-' || r == '_' || r == '.' || r == '/':
			b.WriteRune(r)
		default:
			b.WriteRune('_')
		}
	}
	return b.String()
}