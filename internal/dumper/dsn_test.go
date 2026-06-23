package dumper

import (
	"testing"
)

func TestParseDSN(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name        string
		dsn         string
		want        ConnParams
		wantErr     bool
		errContains string
	}{
		{
			name: "full URL with explicit port",
			dsn:  "postgres://alice:secret@db.example.com:5433/mydb?sslmode=require",
			want: ConnParams{
				Host:     "db.example.com",
				Port:     "5433",
				User:     "alice",
				Password: "secret",
				DBName:   "mydb",
				SSLMode:  "require",
			},
		},
		{
			name: "postgresql scheme",
			dsn:  "postgresql://bob:pass@localhost/testdb",
			want: ConnParams{
				Host:     "localhost",
				Port:     "5432",
				User:     "bob",
				Password: "pass",
				DBName:   "testdb",
				SSLMode:  "prefer",
			},
		},
		{
			name: "URL default host and port",
			dsn:  "postgres://carol:pw@/mydb",
			want: ConnParams{
				Host:     "localhost",
				Port:     "5432",
				User:     "carol",
				Password: "pw",
				DBName:   "mydb",
				SSLMode:  "prefer",
			},
		},
		{
			name: "key=value basic",
			dsn:  "host=pg.local port=5432 user=pguser password=pgpass dbname=pgdb sslmode=disable",
			want: ConnParams{
				Host:     "pg.local",
				Port:     "5432",
				User:     "pguser",
				Password: "pgpass",
				DBName:   "pgdb",
				SSLMode:  "disable",
			},
		},
		{
			name: "key=value quoted password with space",
			dsn:  "host=localhost user=u password='my secret' dbname=db",
			want: ConnParams{
				Host:     "localhost",
				Port:     "5432",
				User:     "u",
				Password: "my secret",
				DBName:   "db",
				SSLMode:  "prefer",
			},
		},
		{
			name: "key=value quoted password with escaped quote",
			dsn:  `host=localhost user=u password='it\'s fine' dbname=db`,
			want: ConnParams{
				Host:     "localhost",
				Port:     "5432",
				User:     "u",
				Password: "it's fine",
				DBName:   "db",
				SSLMode:  "prefer",
			},
		},
		{
			name: "key=value defaults applied",
			dsn:  "user=admin dbname=admindb",
			want: ConnParams{
				Host:     "localhost",
				Port:     "5432",
				User:     "admin",
				Password: "",
				DBName:   "admindb",
				SSLMode:  "prefer",
			},
		},
		// Error cases
		{
			name:        "empty DSN",
			dsn:         "",
			wantErr:     true,
			errContains: "empty",
		},
		{
			name:        "URL missing dbname",
			dsn:         "postgres://user:pw@localhost/",
			wantErr:     true,
			errContains: "database name",
		},
		{
			name:        "URL missing user",
			dsn:         "postgres://localhost/mydb",
			wantErr:     true,
			errContains: "user",
		},
		{
			name:        "key=value missing dbname",
			dsn:         "user=u",
			wantErr:     true,
			errContains: "database name",
		},
		{
			name:        "key=value invalid port",
			dsn:         "host=h port=abc user=u dbname=d",
			wantErr:     true,
			errContains: "port",
		},
		{
			name:        "key=value missing equals sign",
			dsn:         "host=h user dbname=d",
			wantErr:     true,
			errContains: "missing '='",
		},
		{
			name:        "key=value unterminated quoted value",
			dsn:         "host=h user=u password='oops dbname=d",
			wantErr:     true,
			errContains: "unterminated",
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			got, err := ParseDSN(tc.dsn)
			if tc.wantErr {
				if err == nil {
					t.Fatalf("expected error containing %q, got nil", tc.errContains)
				}
				if tc.errContains != "" && !containsString(err.Error(), tc.errContains) {
					t.Fatalf("expected error %q to contain %q", err.Error(), tc.errContains)
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if got != tc.want {
				t.Errorf("ParseDSN(%q)\n got  %+v\n want %+v", tc.dsn, got, tc.want)
			}
		})
	}
}

func TestConnParams_PgDumpArgs(t *testing.T) {
	t.Parallel()

	p := ConnParams{
		Host:     "myhost",
		Port:     "5433",
		User:     "myuser",
		Password: "should-not-appear",
		DBName:   "mydb",
	}

	args := p.PgDumpArgs()

	// Password must never appear in the args slice.
	for _, a := range args {
		if a == p.Password {
			t.Errorf("PgDumpArgs must not include the password, but found it in args: %v", args)
		}
	}

	// Check required flags are present.
	checkContainsSequence(t, args, "--host", "myhost")
	checkContainsSequence(t, args, "--port", "5433")
	checkContainsSequence(t, args, "--username", "myuser")

	// Last element should be the database name.
	if args[len(args)-1] != "mydb" {
		t.Errorf("last arg should be dbname %q, got %q", "mydb", args[len(args)-1])
	}
}

// checkContainsSequence asserts that flag and value appear consecutively in args.
func checkContainsSequence(t *testing.T, args []string, flag, value string) {
	t.Helper()
	for i := 0; i < len(args)-1; i++ {
		if args[i] == flag && args[i+1] == value {
			return
		}
	}
	t.Errorf("args %v should contain %q %q consecutively", args, flag, value)
}

func containsString(s, sub string) bool {
	return len(s) >= len(sub) && (s == sub || len(sub) == 0 ||
		func() bool {
			for i := 0; i+len(sub) <= len(s); i++ {
				if s[i:i+len(sub)] == sub {
					return true
				}
			}
			return false
		}())
}