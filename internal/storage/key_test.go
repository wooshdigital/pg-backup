package storage

import (
	"testing"
	"time"
)

// fixed reference time: 2024-03-15 10:30:00 UTC  →  Unix 1710498600
var refTime = time.Date(2024, 3, 15, 10, 30, 0, 0, time.UTC)

func TestKeyRenderer_Render(t *testing.T) {
	tests := []struct {
		name     string
		template string
		db       string
		want     string
	}{
		{
			name:     "all placeholders",
			template: "backups/{db}/{date}/{timestamp}.sql.gz",
			db:       "mydb",
			want:     "backups/mydb/2024-03-15/1710498600.sql.gz",
		},
		{
			name:     "no placeholders",
			template: "static/key.sql.gz",
			db:       "mydb",
			want:     "static/key.sql.gz",
		},
		{
			name:     "empty template",
			template: "",
			db:       "mydb",
			want:     "",
		},
		{
			name:     "only db placeholder",
			template: "{db}.dump",
			db:       "production",
			want:     "production.dump",
		},
		{
			name:     "db with special chars is sanitized",
			template: "{db}/backup.gz",
			db:       "my/db:name",
			want:     "my_db_name/backup.gz",
		},
		{
			name:     "multiple occurrences of same placeholder",
			template: "{db}/{db}/{date}",
			db:       "testdb",
			want:     "testdb/testdb/2024-03-15",
		},
		{
			name:     "unknown placeholder left as-is",
			template: "{db}/{unknown}/file.gz",
			db:       "mydb",
			want:     "mydb/{unknown}/file.gz",
		},
		{
			name:     "date placeholder only",
			template: "dumps/{date}/backup.gz",
			db:       "",
			want:     "dumps/2024-03-15/backup.gz",
		},
		{
			name:     "timestamp placeholder only",
			template: "dumps/{timestamp}.gz",
			db:       "x",
			want:     "dumps/1710498600.gz",
		},
		{
			name:     "empty db is sanitized to empty string",
			template: "prefix/{db}/file",
			db:       "",
			want:     "prefix//file",
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			kr := NewKeyRenderer(tc.template)
			got := kr.Render(tc.db, refTime)
			if got != tc.want {
				t.Errorf("Render(%q, %q) = %q; want %q", tc.db, tc.template, got, tc.want)
			}
		})
	}
}

func TestKeyRenderer_Template(t *testing.T) {
	tmpl := "some/{db}/template"
	kr := NewKeyRenderer(tmpl)
	if kr.Template() != tmpl {
		t.Errorf("Template() = %q; want %q", kr.Template(), tmpl)
	}
}

func TestSanitize(t *testing.T) {
	tests := []struct {
		input string
		want  string
	}{
		{"hello", "hello"},
		{"hello-world", "hello-world"},
		{"hello_world", "hello_world"},
		{"hello.world", "hello.world"},
		{"hello/world", "hello_world"},
		{"hello world", "hello_world"},
		{"my:db@host", "my_db_host"},
		{"", ""},
		{"ABC123", "ABC123"},
	}

	for _, tc := range tests {
		got := sanitize(tc.input)
		if got != tc.want {
			t.Errorf("sanitize(%q) = %q; want %q", tc.input, got, tc.want)
		}
	}
}