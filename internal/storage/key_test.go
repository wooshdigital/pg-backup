package storage

import (
	"testing"
	"time"
)

func TestRenderKey(t *testing.T) {
	// Fixed reference time for deterministic tests.
	ref := time.Date(2024, 3, 15, 10, 30, 0, 0, time.UTC)

	tests := []struct {
		name     string
		template string
		params   KeyParams
		want     string
		wantErr  bool
	}{
		{
			name:     "all placeholders",
			template: "backups/{db}/{date}/{db}-{timestamp}.sql.gz",
			params:   KeyParams{DB: "mydb", T: ref, Hostname: "web-01"},
			want:     "backups/mydb/2024-03-15/mydb-1710495000.sql.gz",
		},
		{
			name:     "hostname placeholder",
			template: "{hostname}/{db}-{date}.sql.gz",
			params:   KeyParams{DB: "testdb", T: ref, Hostname: "host-1"},
			want:     "host-1/testdb-2024-03-15.sql.gz",
		},
		{
			name:     "no placeholders – literal key",
			template: "static/backup.sql.gz",
			params:   KeyParams{DB: "db", T: ref, Hostname: "h"},
			want:     "static/backup.sql.gz",
		},
		{
			name:     "leading slash stripped",
			template: "/backups/{db}.sql.gz",
			params:   KeyParams{DB: "db", T: ref, Hostname: "h"},
			want:     "backups/db.sql.gz",
		},
		{
			name:     "db name with special chars sanitised",
			template: "backups/{db}/{date}.sql.gz",
			params:   KeyParams{DB: "my db@prod!", T: ref, Hostname: "h"},
			want:     "backups/my_db_prod_/2024-03-15.sql.gz",
		},
		{
			name:     "hostname with special chars sanitised",
			template: "{hostname}/{db}.sql.gz",
			params:   KeyParams{DB: "db", T: ref, Hostname: "my host!"},
			want:     "my_host_/db.sql.gz",
		},
		{
			name:     "empty template returns error",
			template: "",
			params:   KeyParams{DB: "db", T: ref, Hostname: "h"},
			wantErr:  true,
		},
		{
			name:     "template renders to empty after trimming",
			template: "   ",
			params:   KeyParams{DB: "db", T: ref, Hostname: "h"},
			wantErr:  true,
		},
		{
			name:     "zero time uses current time (non-empty)",
			template: "backups/{db}/{date}.sql.gz",
			params:   KeyParams{DB: "db", T: time.Time{}, Hostname: "h"},
			wantErr:  false,
			// We cannot assert the exact value since it uses time.Now(),
			// but we verify no error is returned.
			want: "", // checked separately below
		},
		{
			name:     "only timestamp placeholder",
			template: "{timestamp}.sql.gz",
			params:   KeyParams{DB: "db", T: ref, Hostname: "h"},
			want:     "1710495000.sql.gz",
		},
		{
			name:     "nested path with all placeholders",
			template: "{hostname}/db/{db}/year/{date}/{timestamp}.tar.gz",
			params:   KeyParams{DB: "orders", T: ref, Hostname: "prod-db-1"},
			want:     "prod-db-1/db/orders/year/2024-03-15/1710495000.tar.gz",
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			got, err := RenderKey(tc.template, tc.params)
			if tc.wantErr {
				if err == nil {
					t.Errorf("expected error but got nil (key=%q)", got)
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			// Skip exact assertion for zero-time test.
			if tc.want == "" {
				if got == "" {
					t.Errorf("expected non-empty key but got empty string")
				}
				return
			}
			if got != tc.want {
				t.Errorf("RenderKey(%q, ...) = %q, want %q", tc.template, got, tc.want)
			}
		})
	}
}

func TestSanitise(t *testing.T) {
	tests := []struct {
		input string
		want  string
	}{
		{"simple", "simple"},
		{"my-db_1.0", "my-db_1.0"},
		{"db name", "db_name"},
		{"db@host!prod", "db_host_prod"},
		{"path/to/key", "path/to/key"},
		{"", ""},
		{"ALL_CAPS-123", "ALL_CAPS-123"},
	}
	for _, tc := range tests {
		got := sanitise(tc.input)
		if got != tc.want {
			t.Errorf("sanitise(%q) = %q, want %q", tc.input, got, tc.want)
		}
	}
}