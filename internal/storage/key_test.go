package storage

import (
	"testing"
	"time"
)

func TestRenderKey(t *testing.T) {
	fixedTime := time.Date(2024, 3, 15, 10, 30, 0, 0, time.UTC)

	tests := []struct {
		name     string
		tmpl     string
		kd       KeyData
		expected string
	}{
		{
			name: "all placeholders",
			tmpl: "backups/{db}/{date}/{timestamp}-dump.sql.gz",
			kd: KeyData{
				DB:        "mydb",
				Date:      "2024-03-15",
				Timestamp: "1710498600",
				Hostname:  "web-01",
			},
			expected: "backups/mydb/2024-03-15/1710498600-dump.sql.gz",
		},
		{
			name: "hostname placeholder",
			tmpl: "{hostname}/{db}/{date}.gz",
			kd: KeyData{
				DB:        "production",
				Date:      "2024-03-15",
				Timestamp: "1710498600",
				Hostname:  "db-host",
			},
			expected: "db-host/production/2024-03-15.gz",
		},
		{
			name: "no placeholders – static key",
			tmpl: "static/path/backup.sql.gz",
			kd: KeyData{
				DB:        "mydb",
				Date:      "2024-03-15",
				Timestamp: "1710498600",
				Hostname:  "web-01",
			},
			expected: "static/path/backup.sql.gz",
		},
		{
			name: "unknown placeholder is preserved",
			tmpl: "backups/{db}/{unknown}/dump.gz",
			kd: KeyData{
				DB:        "mydb",
				Date:      "2024-03-15",
				Timestamp: "1710498600",
				Hostname:  "web-01",
			},
			expected: "backups/mydb/{unknown}/dump.gz",
		},
		{
			name: "empty template",
			tmpl: "",
			kd: KeyData{
				DB:        "mydb",
				Date:      "2024-03-15",
				Timestamp: "1710498600",
				Hostname:  "web-01",
			},
			expected: "",
		},
		{
			name: "repeated placeholders",
			tmpl: "{db}/{db}/{date}",
			kd: KeyData{
				DB:        "mydb",
				Date:      "2024-03-15",
				Timestamp: "1710498600",
				Hostname:  "web-01",
			},
			expected: "mydb/mydb/2024-03-15",
		},
		{
			name: "timestamp only",
			tmpl: "{timestamp}.sql.gz",
			kd: KeyData{
				DB:        "mydb",
				Date:      "2024-03-15",
				Timestamp: "1710498600",
				Hostname:  "web-01",
			},
			expected: "1710498600.sql.gz",
		},
		{
			name: "db with special characters",
			tmpl: "backups/{db}/{date}.gz",
			kd: KeyData{
				DB:        "my-special_db.v2",
				Date:      "2024-03-15",
				Timestamp: "1710498600",
				Hostname:  "web-01",
			},
			expected: "backups/my-special_db.v2/2024-03-15.gz",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := RenderKey(tt.tmpl, tt.kd)
			if got != tt.expected {
				t.Errorf("RenderKey(%q, ...) = %q, want %q", tt.tmpl, got, tt.expected)
			}
		})
	}
}

func TestNewKeyData(t *testing.T) {
	fixedTime := time.Date(2024, 3, 15, 10, 30, 0, 0, time.UTC)
	kd := NewKeyData("testdb", fixedTime)

	if kd.DB != "testdb" {
		t.Errorf("DB = %q, want %q", kd.DB, "testdb")
	}
	if kd.Date != "2024-03-15" {
		t.Errorf("Date = %q, want %q", kd.Date, "2024-03-15")
	}
	if kd.Timestamp != "1710498600" {
		t.Errorf("Timestamp = %q, want %q", kd.Timestamp, "1710498600")
	}
	if kd.Hostname == "" {
		t.Error("Hostname should not be empty")
	}
}