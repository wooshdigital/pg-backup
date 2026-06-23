package dumper

import (
	"testing"
)

func TestParseDSN_URL(t *testing.T) {
	tests := []struct {
		name     string
		dsn      string
		want     ConnParams
		wantErr  bool
	}{
		{
			name: "full URL",
			dsn:  "postgres://alice:secret@db.example.com:5433/mydb?sslmode=require",
			want: ConnParams{
				Host:     "db.example.com",
				Port:     5433,
				User:     "alice",
				Password: "secret",
				DBName:   "mydb",
				SSLMode:  "require",
				Extra:    map[string]string{},
			},
		},
		{
			name: "postgresql scheme",
			dsn:  "postgresql://bob@localhost/testdb",
			want: ConnParams{
				Host:   "localhost",
				Port:   DefaultPort,
				User:   "bob",
				DBName: "testdb",
				Extra:  map[string]string{},
			},
		},
		{
			name: "minimal URL – no user, no db",
			dsn:  "postgres://localhost",
			want: ConnParams{
				Host:  "localhost",
				Port:  DefaultPort,
				Extra: map[string]string{},
			},
		},
		{
			name: "default port when omitted",
			dsn:  "postgres://user@host/db",
			want: ConnParams{
				Host:   "host",
				Port:   DefaultPort,
				User:   "user",
				DBName: "db",
				Extra:  map[string]string{},
			},
		},
		{
			name: "extra query params land in Extra",
			dsn:  "postgres://localhost/db?connect_timeout=10&sslmode=disable",
			want: ConnParams{
				Host:    "localhost",
				Port:    DefaultPort,
				DBName:  "db",
				SSLMode: "disable",
				Extra:   map[string]string{"connect_timeout": "10"},
			},
		},
		{
			name:    "empty DSN",
			dsn:     "",
			wantErr: true,
		},
		{
			name:    "invalid port in URL",
			dsn:     "postgres://localhost:abc/db",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := ParseDSN(tt.dsn)
			if (err != nil) != tt.wantErr {
				t.Fatalf("ParseDSN(%q) error = %v, wantErr %v", tt.dsn, err, tt.wantErr)
			}
			if tt.wantErr {
				return
			}
			assertConnParams(t, tt.want, got)
		})
	}
}

func TestParseDSN_KV(t *testing.T) {
	tests := []struct {
		name    string
		dsn     string
		want    ConnParams
		wantErr bool
	}{
		{
			name: "full key=value",
			dsn:  "host=myhost port=5433 user=carol password=s3cr3t dbname=prod sslmode=verify-full",
			want: ConnParams{
				Host:     "myhost",
				Port:     5433,
				User:     "carol",
				Password: "s3cr3t",
				DBName:   "prod",
				SSLMode:  "verify-full",
				Extra:    map[string]string{},
			},
		},
		{
			name: "minimal key=value",
			dsn:  "dbname=simple",
			want: ConnParams{
				Host:   "localhost",
				Port:   DefaultPort,
				DBName: "simple",
				Extra:  map[string]string{},
			},
		},
		{
			name: "quoted password with spaces",
			dsn:  "host=localhost user=dave password='my secret pass' dbname=db",
			want: ConnParams{
				Host:     "localhost",
				Port:     DefaultPort,
				User:     "dave",
				Password: "my secret pass",
				DBName:   "db",
				Extra:    map[string]string{},
			},
		},
		{
			name: "extra unknown keys go to Extra",
			dsn:  "host=localhost dbname=db connect_timeout=5",
			want: ConnParams{
				Host:   "localhost",
				Port:   DefaultPort,
				DBName: "db",
				Extra:  map[string]string{"connect_timeout": "5"},
			},
		},
		{
			name:    "invalid port in kv",
			dsn:     "port=notanumber",
			wantErr: true,
		},
		{
			name:    "unterminated quote",
			dsn:     "password='unclosed",
			wantErr: true,
		},
		{
			name:    "token without equals",
			dsn:     "host=localhost badtoken dbname=db",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := ParseDSN(tt.dsn)
			if (err != nil) != tt.wantErr {
				t.Fatalf("ParseDSN(%q) error = %v, wantErr %v", tt.dsn, err, tt.wantErr)
			}
			if tt.wantErr {
				return
			}
			assertConnParams(t, tt.want, got)
		})
	}
}

func TestConnParams_ToPgDumpArgs(t *testing.T) {
	p := ConnParams{
		Host:   "db.local",
		Port:   5432,
		User:   "admin",
		DBName: "warehouse",
	}
	args := p.ToPgDumpArgs("--format=custom")
	wantArgs := []string{
		"--host", "db.local",
		"--port", "5432",
		"--username", "admin",
		"--dbname", "warehouse",
		"--format=custom",
	}
	if len(args) != len(wantArgs) {
		t.Fatalf("ToPgDumpArgs: got %v, want %v", args, wantArgs)
	}
	for i := range args {
		if args[i] != wantArgs[i] {
			t.Errorf("arg[%d]: got %q, want %q", i, args[i], wantArgs[i])
		}
	}
	// Password must NOT appear in args
	for _, a := range args {
		if a == "--password" || a == "-W" {
			t.Errorf("password flag must not appear in pg_dump args")
		}
	}
}

// assertConnParams is a helper that compares two ConnParams structs field by field.
func assertConnParams(t *testing.T, want, got ConnParams) {
	t.Helper()
	if got.Host != want.Host {
		t.Errorf("Host: got %q, want %q", got.Host, want.Host)
	}
	if got.Port != want.Port {
		t.Errorf("Port: got %d, want %d", got.Port, want.Port)
	}
	if got.User != want.User {
		t.Errorf("User: got %q, want %q", got.User, want.User)
	}
	if got.Password != want.Password {
		t.Errorf("Password: got %q, want %q", got.Password, want.Password)
	}
	if got.DBName != want.DBName {
		t.Errorf("DBName: got %q, want %q", got.DBName, want.DBName)
	}
	if got.SSLMode != want.SSLMode {
		t.Errorf("SSLMode: got %q, want %q", got.SSLMode, want.SSLMode)
	}
	for k, wv := range want.Extra {
		if gv, ok := got.Extra[k]; !ok || gv != wv {
			t.Errorf("Extra[%q]: got %q, want %q", k, gv, wv)
		}
	}
	for k := range got.Extra {
		if _, ok := want.Extra[k]; !ok {
			t.Errorf("Extra has unexpected key %q", k)
		}
	}
}