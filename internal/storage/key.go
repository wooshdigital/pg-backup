package storage

import (
	"fmt"
	"os"
	"strings"
	"time"
)

// KeyRenderer builds S3 (or local) object keys from a template string.
//
// Supported placeholders:
//
//	{db}        – database name
//	{date}      – UTC date in YYYY-MM-DD format
//	{timestamp} – UTC Unix timestamp (seconds)
//	{hostname}  – machine hostname (falls back to "unknown")
type KeyRenderer struct {
	template string
}

// NewKeyRenderer creates a KeyRenderer that uses the given template.
// An empty template is valid and will produce an empty key.
func NewKeyRenderer(template string) *KeyRenderer {
	return &KeyRenderer{template: template}
}

// Render returns the key produced by substituting all known placeholders in
// the template.  t is the reference time used for {date} and {timestamp};
// pass time.Now() for production use.
func (kr *KeyRenderer) Render(db string, t time.Time) string {
	hostname, err := os.Hostname()
	if err != nil || hostname == "" {
		hostname = "unknown"
	}

	r := kr.template
	r = strings.ReplaceAll(r, "{db}", sanitize(db))
	r = strings.ReplaceAll(r, "{date}", t.UTC().Format("2006-01-02"))
	r = strings.ReplaceAll(r, "{timestamp}", fmt.Sprintf("%d", t.UTC().Unix()))
	r = strings.ReplaceAll(r, "{hostname}", sanitize(hostname))
	return r
}

// Template returns the raw template string.
func (kr *KeyRenderer) Template() string {
	return kr.template
}

// sanitize replaces characters that are illegal or problematic in S3 keys /
// filesystem paths with an underscore.  It is intentionally conservative.
func sanitize(s string) string {
	var b strings.Builder
	b.Grow(len(s))
	for _, c := range s {
		switch {
		case c >= 'a' && c <= 'z',
			c >= 'A' && c <= 'Z',
			c >= '0' && c <= '9',
			c == '-', c == '_', c == '.':
			b.WriteRune(c)
		default:
			b.WriteRune('_')
		}
	}
	return b.String()
}