package storage_test

import (
	"os"
	"strings"
	"testing"
	"time"

	"github.com/yourorg/dbworker/internal/storage"
)

func TestRenderKey(t *testing.T) {
	// Fixed reference time for deterministic tests.
	refTime := time.Date(2024, 3, 15, 12, 30, 0, 0, time.UTC)

	hostname, _ := os.Hostname()
	if hostname == "" {
		hostname = "unknown"
	}

	tests := []struct {
		name        string
		template    string
		params      storage.KeyParams
		wantContain []string
		wantExact   string
		wantErr     bool
	}{
		{
			name:      "empty template returns error",
			template:  "",
			params:    storage.KeyParams{DB: "mydb", At: refTime},
			wantErr:   true,
		},
		{
			name:      "empty DB returns error",
			template:  "backups/{db}/{date}.sql.gz",
			params:    storage.KeyParams{DB: "", At: refTime},
			wantErr:   true,
		},
		{
			name:      "all placeholders substituted",
			template:  "backups/{db}/{date}/{timestamp}/{hostname}/dump.sql.gz",
			params:    storage.KeyParams{DB: "mydb", At: refTime},
			wantExact: "backups/mydb/2024-03-15/1710505800/" + hostname + "/dump.sql.gz",
		},
		{
			name:      "only db placeholder",
			template:  "dumps/{db}.sql.gz",
			params:    storage.KeyParams{DB: "orders", At: refTime},
			wantExact: "dumps/orders.sql.gz",
		},
		{
			name:      "only date placeholder",
			template:  "daily/{date}/backup.gz",
			params:    storage.KeyParams{DB: "mydb", At: refTime},
			wantExact: "daily/2024-03-15/backup.gz",
		},
		{
			name:     "no placeholders – static path",
			template: "static/path/backup.gz",
			params:   storage.KeyParams{DB: "mydb", At: refTime},
			wantExact: "static/path/backup.gz",
		},
		{
			name:     "zero time uses current time",
			template: "backups/{db}/{timestamp}.gz",
			params:   storage.KeyParams{DB: "mydb"},
			// We can't assert the exact timestamp, just that it is numeric.
			wantContain: []string{"backups/mydb/"},
		},
		{
			name:     "db name with special chars",
			template: "backups/{db}/{date}.gz",
			params:   storage.KeyParams{DB: "my-db_v2", At: refTime},
			wantExact: "backups/my-db_v2/2024-03-15.gz",
		},
		{
			name:      "hostname placeholder",
			template:  "{hostname}/{db}/{date}.gz",
			params:    storage.KeyParams{DB: "app", At: refTime},
			wantContain: []string{"app/2024-03-15.gz"},
		},
		{
			name:      "repeated placeholders",
			template:  "{db}/{db}/{date}-{date}.gz",
			params:    storage.KeyParams{DB: "x", At: refTime},
			wantExact: "x/x/2024-03-15-2024-03-15.gz",
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			got, err := storage.RenderKey(tc.template, tc.params)
			if tc.wantErr {
				if err == nil {
					t.Fatalf("expected error, got nil (result: %q)", got)
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}

			if tc.wantExact != "" && got != tc.wantExact {
				t.Errorf("RenderKey() = %q, want %q", got, tc.wantExact)
			}

			for _, sub := range tc.wantContain {
				if !strings.Contains(got, sub) {
					t.Errorf("RenderKey() = %q, expected to contain %q", got, sub)
				}
			}
		})
	}
}