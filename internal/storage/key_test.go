package storage

import (
	"strings"
	"testing"
	"time"
)

func TestRenderKey(t *testing.T) {
	fixedTime := time.Date(2024, 3, 15, 10, 30, 45, 0, time.UTC)

	tests := []struct {
		name     string
		template string
		data     KeyData
		want     string
		wantErr  bool
	}{
		{
			name:     "all placeholders",
			template: "backups/{hostname}/{db}/{date}/{timestamp}.sql.gz",
			data: KeyData{
				DB:        "mydb",
				Timestamp: fixedTime,
				Hostname:  "web-01",
			},
			want: "backups/web-01/mydb/2024-03-15/20240315T103045Z.sql.gz",
		},
		{
			name:     "only date",
			template: "{date}/backup.sql.gz",
			data: KeyData{
				Timestamp: fixedTime,
				Hostname:  "host",
			},
			want: "2024-03-15/backup.sql.gz",
		},
		{
			name:     "only timestamp",
			template: "dumps/{timestamp}.tar.gz",
			data: KeyData{
				Timestamp: fixedTime,
				Hostname:  "host",
			},
			want: "dumps/20240315T103045Z.tar.gz",
		},
		{
			name:     "no placeholders",
			template: "static/key/backup.sql.gz",
			data: KeyData{
				DB:        "mydb",
				Timestamp: fixedTime,
				Hostname:  "host",
			},
			want: "static/key/backup.sql.gz",
		},
		{
			name:     "unknown placeholder preserved",
			template: "backups/{unknown}/file.gz",
			data: KeyData{
				Timestamp: fixedTime,
				Hostname:  "host",
			},
			want: "backups/{unknown}/file.gz",
		},
		{
			name:     "db with special chars sanitized",
			template: "{db}/backup.gz",
			data: KeyData{
				DB:        "my database!",
				Timestamp: fixedTime,
				Hostname:  "host",
			},
			want: "my_database_/backup.gz",
		},
		{
			name:     "hostname with special chars sanitized",
			template: "{hostname}/backup.gz",
			data: KeyData{
				DB:        "db",
				Timestamp: fixedTime,
				Hostname:  "my host:8080",
			},
			want: "my_host_8080/backup.gz",
		},
		{
			name:     "empty db placeholder",
			template: "{db}/{timestamp}.gz",
			data: KeyData{
				DB:        "",
				Timestamp: fixedTime,
				Hostname:  "host",
			},
			// empty db produces empty segment
			want: "/20240315T103045Z.gz",
		},
		{
			name:     "repeated placeholder",
			template: "{db}/{db}-{timestamp}.gz",
			data: KeyData{
				DB:        "mydb",
				Timestamp: fixedTime,
				Hostname:  "host",
			},
			want: "mydb/mydb-20240315T103045Z.gz",
		},
		{
			name:     "timestamp uses UTC",
			template: "{timestamp}",
			data: KeyData{
				// Provide a time in a non-UTC zone; output must be UTC.
				Timestamp: time.Date(2024, 1, 2, 12, 0, 0, 0, time.FixedZone("EST", -5*3600)),
				Hostname:  "host",
			},
			// 12:00 EST = 17:00 UTC
			want: "20240102T170000Z",
		},
		{
			name:     "db with allowed special chars",
			template: "{db}.gz",
			data: KeyData{
				DB:        "my-db_v2.0",
				Timestamp: fixedTime,
				Hostname:  "host",
			},
			want: "my-db_v2.0.gz",
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			got, err := RenderKey(tc.template, tc.data)
			if (err != nil) != tc.wantErr {
				t.Fatalf("RenderKey() error = %v, wantErr %v", err, tc.wantErr)
			}
			if got != tc.want {
				t.Errorf("RenderKey() = %q, want %q", got, tc.want)
			}
		})
	}
}

// TestRenderKeyDefaultTimestamp verifies that a zero Timestamp is replaced
// with time.Now() without error, and that the output contains a date segment.
func TestRenderKeyDefaultTimestamp(t *testing.T) {
	got, err := RenderKey("{date}/{db}.gz", KeyData{
		DB:       "mydb",
		Hostname: "host",
		// Timestamp is zero — should default to now
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	// We cannot know the exact date, but it must end with /mydb.gz
	if !strings.HasSuffix(got, "/mydb.gz") {
		t.Errorf("unexpected key %q: expected suffix /mydb.gz", got)
	}
	parts := strings.SplitN(got, "/", 2)
	if len(parts) != 2 || len(parts[0]) != 10 {
		t.Errorf("unexpected date segment in %q (expected YYYY-MM-DD)", got)
	}
}

func TestSanitizeSegment(t *testing.T) {
	tests := []struct {
		input string
		want  string
	}{
		{"hello", "hello"},
		{"hello-world", "hello-world"},
		{"hello_world", "hello_world"},
		{"hello.world", "hello.world"},
		{"hello world", "hello_world"},
		{"hello/world", "hello_world"},
		{"hello:world", "hello_world"},
		{"UPPER", "UPPER"},
		{"123", "123"},
		{"", ""},
		{"a!b@c#d", "a_b_c_d"},
	}

	for _, tc := range tests {
		t.Run(tc.input, func(t *testing.T) {
			got := sanitizeSegment(tc.input)
			if got != tc.want {
				t.Errorf("sanitizeSegment(%q) = %q, want %q", tc.input, got, tc.want)
			}
		})
	}
}