package dumper

import (
	"testing"
)

func TestParseDSN_URLFormat(t *testing.T) {
	tests := []struct {
		name        string
		dsn         string
		wantHost    string
		wantPort    string
		wantUser    string
		wantPass    string
		wantDB      string
		wantSSL     string
		wantErr     bool
	}{
		{
			name:     "full URL",
			dsn:      "postgres://alice:secret@db.example.com:5433/mydb?sslmode=require",
			wantHost: "db.example.com",
			wantPort: "5433",
			wantUser: "alice",
			wantPass: "secret",
			wantDB:   "mydb",
			wantSSL:  "require",
		},
		{
			name:     "minimal URL no auth",
			dsn:      "postgres://localhost/testdb",
			wantHost: "localhost",
			wantPort: "5432",
			wantUser: "",
			wantPass: "",
			wantDB:   "testdb",
		},
		{
			name:     "postgresql scheme",
			dsn:      "postgresql://bob@127.0.0.1:5432/bobdb",
			wantHost: "127.0.0.1",
			wantPort: "5432",
			wantUser: "bob",
			wantPass: "",
			wantDB:   "bobdb",
		},
		{
			name:     "URL with no path defaults to empty dbname",
			dsn:      "postgres://localhost",
			wantHost: "localhost",
			wantPort: "5432",
			wantDB:   "",
		},
		{
			name:     "URL with special characters in password",
			dsn:      "postgres://user:p%40ss%23word@localhost/db",
			wantHost: "localhost",
			wantPort: "5432",
			wantUser: "user",
			wantPass: "p@ss#word",
			wantDB:   "db",
		},
		{
			name:    "empty DSN",
			dsn:     "",
			wantErr: true,
		},
		{
			name:    "malformed URL",
			dsn:     "postgres://[::1]:namedport/db",
			wantErr: true,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			p, err := ParseDSN(tc.dsn)
			if tc.wantErr {
				if err == nil {
					t.Fatalf("expected error, got nil (params=%+v)", p)
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if p.Host != tc.wantHost {
				t.Errorf("Host: got %q, want %q", p.Host, tc.wantHost)
			}
			if p.Port != tc.wantPort {
				t.Errorf("Port: got %q, want %q", p.Port, tc.wantPort)
			}
			if p.User != tc.wantUser {
				t.Errorf("User: got %q, want %q", p.User, tc.wantUser)
			}
			if p.Password != tc.wantPass {
				t.Errorf("Password: got %q, want %q", p.Password, tc.wantPass)
			}
			if p.DBName != tc.wantDB {
				t.Errorf("DBName: got %q, want %q", p.DBName, tc.wantDB)
			}
			if p.SSLMode != tc.wantSSL {
				t.Errorf("SSLMode: got %q, want %q", p.SSLMode, tc.wantSSL)
			}
		})
	}
}

func TestParseDSN_KeyValueFormat(t *testing.T) {
	tests := []struct {
		name     string
		dsn      string
		wantHost string
		wantPort string
		wantUser string
		wantPass string
		wantDB   string
		wantSSL  string
		wantErr  bool
	}{
		{
			name:     "full key-value",
			dsn:      "host=db.example.com port=5433 user=alice password=secret dbname=mydb sslmode=require",
			wantHost: "db.example.com",
			wantPort: "5433",
			wantUser: "alice",
			wantPass: "secret",
			wantDB:   "mydb",
			wantSSL:  "require",
		},
		{
			name:     "defaults applied",
			dsn:      "dbname=mydb",
			wantHost: "localhost",
			wantPort: "5432",
			wantDB:   "mydb",
		},
		{
			name:     "quoted password with spaces",
			dsn:      "host=localhost dbname=db user=u password='my secret pass'",
			wantHost: "localhost",
			wantPort: "5432",
			wantUser: "u",
			wantPass: "my secret pass",
			wantDB:   "db",
		},
		{
			name:     "quoted password with escaped quote",
			dsn:      `host=localhost dbname=db password='it\'s me'`,
			wantHost: "localhost",
			wantDB:   "db",
			wantPass: "it's me",
		},
		{
			name:    "invalid port",
			dsn:     "host=localhost port=abc dbname=db",
			wantErr: true,
		},
		{
			name:    "empty DSN",
			dsn:     "",
			wantErr: true,
		},
		{
			name:    "missing equals sign",
			dsn:     "hostlocalhost",
			wantErr: true,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			p, err := ParseDSN(tc.dsn)
			if tc.wantErr {
				if err == nil {
					t.Fatalf("expected error, got nil (params=%+v)", p)
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if p.Host != tc.wantHost {
				t.Errorf("Host: got %q, want %q", p.Host, tc.wantHost)
			}
			if p.Port != tc.wantPort {
				t.Errorf("Port: got %q, want %q", p.Port, tc.wantPort)
			}
			if p.User != tc.wantUser {
				t.Errorf("User: got %q, want %q", p.User, tc.wantUser)
			}
			if p.Password != tc.wantPass {
				t.Errorf("Password: got %q, want %q", p.Password, tc.wantPass)
			}
			if p.DBName != tc.wantDB {
				t.Errorf("DBName: got %q, want %q", p.DBName, tc.wantDB)
			}
			if p.SSLMode != tc.wantSSL {
				t.Errorf("SSLMode: got %q, want %q", p.SSLMode, tc.wantSSL)
			}
		})
	}
}

func TestConnParams_PgDumpArgs(t *testing.T) {
	p := &ConnParams{
		Host:   "db.example.com",
		Port:   "5433",
		User:   "alice",
		DBName: "mydb",
	}
	args := p.PgDumpArgs("--format=custom")
	expected := []string{
		"--host", "db.example.com",
		"--port", "5433",
		"--no-password",
		"--username", "alice",
		"--format=custom",
		"mydb",
	}
	if len(args) != len(expected) {
		t.Fatalf("arg count mismatch: got %v, want %v", args, expected)
	}
	for i, a := range args {
		if a != expected[i] {
			t.Errorf("arg[%d]: got %q, want %q", i, a, expected[i])
		}
	}
}

func TestConnParams_Env(t *testing.T) {
	p := &ConnParams{Password: "supersecret"}
	env := p.Env()
	if len(env) != 1 || env[0] != "PGPASSWORD=supersecret" {
		t.Errorf("unexpected env: %v", env)
	}

	p2 := &ConnParams{}
	env2 := p2.Env()
	if len(env2) != 0 {
		t.Errorf("expected empty env, got %v", env2)
	}
}