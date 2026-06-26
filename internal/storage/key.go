package storage

import (
	"fmt"
	"os"
	"strings"
	"time"
)

// KeyData holds the values used to render an S3 key template.
type KeyData struct {
	// DB is the database name.
	DB string
	// Date is the UTC date formatted as YYYY-MM-DD.
	Date string
	// Timestamp is the UTC Unix timestamp as a decimal string.
	Timestamp string
	// Hostname is the machine hostname.
	Hostname string
}

// NewKeyData builds a KeyData snapshot from the current time and the given database name.
// The hostname is looked up from the OS; if unavailable it falls back to "unknown".
func NewKeyData(db string, t time.Time) KeyData {
	hostname, err := os.Hostname()
	if err != nil {
		hostname = "unknown"
	}
	return KeyData{
		DB:        db,
		Date:      t.UTC().Format("2006-01-02"),
		Timestamp: fmt.Sprintf("%d", t.UTC().Unix()),
		Hostname:  hostname,
	}
}

// RenderKey replaces the following placeholders in tmpl with the corresponding
// values from kd:
//
//	{db}        → database name
//	{date}      → UTC date, YYYY-MM-DD
//	{timestamp} → UTC Unix timestamp (seconds)
//	{hostname}  → machine hostname
//
// Any unknown placeholder is left unchanged so callers can detect mis-configured
// templates early (rather than silently producing incorrect keys).
func RenderKey(tmpl string, kd KeyData) string {
	replacer := strings.NewReplacer(
		"{db}", kd.DB,
		"{date}", kd.Date,
		"{timestamp}", kd.Timestamp,
		"{hostname}", kd.Hostname,
	)
	return replacer.Replace(tmpl)
}