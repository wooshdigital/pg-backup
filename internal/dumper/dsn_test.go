package dumper

import (
	"testing"
)

func TestParseDSN(t *testing.T) {
	tests := []struct {
		name     string
		dsn      string
		wantHost string
		wantPort string
		wantUser string
		wantDB   string
	}{
		{
			name:     "full URI",
			dsn:      "postgres://alice:secret@db.example.com:5433/mydb?sslmode=require",
			wantHost: "db.example.com",
			wantPort: "5433",
			wantUser: "alice",
			wantDB:   "mydb",
		},
		{
			name:     "default port",
			dsn:      "postgres://postgres@localhost/testdb?sslmode=disable",
			wantHost: "localhost",
			wantPort: "5432",
			wantUser: "postgres",
			wantDB:   "testdb",
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			c, err := ParseDSN(tc.dsn)
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if c.Host != tc.wantHost {
				t.Errorf("host = %q, want %q", c.Host, tc.wantHost)
			}
			if c.Port != tc.wantPort {
				t.Errorf("port = %q, want %q", c.Port, tc.wantPort)
			}
			if c.User != tc.wantUser {
				t.Errorf("user = %q, want %q", c.User, tc.wantUser)
			}
			if c.Database != tc.wantDB {
				t.Errorf("database = %q, want %q", c.Database, tc.wantDB)
			}
		})
	}
}