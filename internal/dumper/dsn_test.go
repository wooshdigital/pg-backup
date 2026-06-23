package dumper

import (
	"testing"
)

func TestParseDSN_URL(t *testing.T) {
	tests := []struct {
		name     string
		dsn      string
		want     *ConnParams
		wantErr  bool
	}{
		{
			name: "full URL",
			dsn:  "postgres://alice:secret@db.example.com:5433/mydb?sslmode=require",
			want: &ConnParams{
				Host:     "db.example.com",
				Port:     "5433",
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
			want: &ConnParams{
				Host:     "localhost",
				Port:     "5432",
				User:     "bob",
				Password: "",
				DBName:   "testdb",
				SSLMode:  "",
				Extra:    map[string]string{},
			},
		},
		{
			name: "minimal URL with defaults",
			dsn:  "postgres:///mydb",
			want: &ConnParams{
				Host:     "localhost",
				Port:     "5432",
				User:     "",
				Password: "",
				DBName:   "mydb",
				SSLMode:  "",
				Extra:    map[string]string{},
			},
		},
		{
			name: "URL with extra query params",
			dsn:  "postgres://user:pass@host/db?sslmode=disable&connect_timeout=10",
			want: &ConnParams{
				Host:     "host",
				Port:     "5432",
				User:     "user",
				Password: "pass",
				DBName:   "db",
				SSLMode:  "disable",
				Extra:    map[string]string{"connect_timeout": "10"},
			},
		},
		{
			name:    "empty DSN",
			dsn:     "",
			wantErr: true,
		},
		{
			name:    "invalid URL",
			dsn:     "postgres://[::1]:namedport/db",
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
			assertConnParamsEqual(t, tt.want, got)
		})
	}
}

func TestParseDSN_KeyValue(t *testing.T) {
	tests := []struct {
		name    string
		dsn     string
		want    *ConnParams
		wantErr bool
	}{
		{
			name: "full key=value",
			dsn:  "host=db.example.com port=5433 user=alice password=secret dbname=mydb sslmode=require",
			want: &ConnParams{
				Host:     "db.example.com",
				Port:     "5433",
				User:     "alice",
				Password: "secret",
				DBName:   "mydb",
				SSLMode:  "require",
				Extra:    map[string]string{},
			},
		},
		{
			name: "defaults applied",
			dsn:  "dbname=mydb user=alice",
			want: &ConnParams{
				Host:   "localhost",
				Port:   "5432",
				User:   "alice",
				DBName: "mydb",
				Extra:  map[string]string{},
			},
		},
		{
			name: "quoted value with space",
			dsn:  "host=localhost dbname=mydb password='my secret'",
			want: &ConnParams{
				Host:     "localhost",
				Port:     "5432",
				Password: "my secret",
				DBName:   "mydb",
				Extra:    map[string]string{},
			},
		},
		{
			name: "quoted value with escaped quote",
			dsn:  `host=localhost dbname=mydb password='it\'s a secret'`,
			want: &ConnParams{
				Host:     "localhost",
				Port:     "5432",
				Password: "it's a secret",
				DBName:   "mydb",
				Extra:    map[string]string{},
			},
		},
		{
			name: "extra unknown keys go to Extra",
			dsn:  "host=localhost dbname=mydb connect_timeout=10",
			want: &ConnParams{
				Host:   "localhost",
				Port:   "5432",
				DBName: "mydb",
				Extra:  map[string]string{"connect_timeout": "10"},
			},
		},
		{
			name:    "empty DSN",
			dsn:     "",
			wantErr: true,
		},
		{
			name:    "missing equals sign",
			dsn:     "host",
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
			assertConnParamsEqual(t, tt.want, got)
		})
	}
}

func TestConnParams_BuildPgDumpArgs(t *testing.T) {
	tests := []struct {
		name   string
		params *ConnParams
		dbname string
		want   []string
	}{
		{
			name: "full params",
			params: &ConnParams{
				Host:  "db.example.com",
				Port:  "5433",
				User:  "alice",
				Extra: map[string]string{},
			},
			dbname: "mydb",
			want:   []string{"-h", "db.example.com", "-p", "5433", "-U", "alice", "-d", "mydb"},
		},
		{
			name: "use params dbname when override is empty",
			params: &ConnParams{
				Host:   "localhost",
				Port:   "5432",
				User:   "bob",
				DBName: "testdb",
				Extra:  map[string]string{},
			},
			dbname: "",
			want:   []string{"-h", "localhost", "-p", "5432", "-U", "bob", "-d", "testdb"},
		},
		{
			name: "override dbname takes precedence",
			params: &ConnParams{
				Host:   "localhost",
				Port:   "5432",
				DBName: "original",
				Extra:  map[string]string{},
			},
			dbname: "override",
			want:   []string{"-h", "localhost", "-p", "5432", "-d", "override"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := tt.params.BuildPgDumpArgs(tt.dbname)
			if len(got) != len(tt.want) {
				t.Fatalf("BuildPgDumpArgs() = %v, want %v", got, tt.want)
			}
			for i := range got {
				if got[i] != tt.want[i] {
					t.Errorf("BuildPgDumpArgs()[%d] = %q, want %q", i, got[i], tt.want[i])
				}
			}
		})
	}
}

func assertConnParamsEqual(t *testing.T, want, got *ConnParams) {
	t.Helper()
	if want.Host != got.Host {
		t.Errorf("Host: want %q, got %q", want.Host, got.Host)
	}
	if want.Port != got.Port {
		t.Errorf("Port: want %q, got %q", want.Port, got.Port)
	}
	if want.User != got.User {
		t.Errorf("User: want %q, got %q", want.User, got.User)
	}
	if want.Password != got.Password {
		t.Errorf("Password: want %q, got %q", want.Password, got.Password)
	}
	if want.DBName != got.DBName {
		t.Errorf("DBName: want %q, got %q", want.DBName, got.DBName)
	}
	if want.SSLMode != got.SSLMode {
		t.Errorf("SSLMode: want %q, got %q", want.SSLMode, got.SSLMode)
	}
	for k, wv := range want.Extra {
		if gv, ok := got.Extra[k]; !ok || gv != wv {
			t.Errorf("Extra[%q]: want %q, got %q", k, wv, gv)
		}
	}
	for k := range got.Extra {
		if _, ok := want.Extra[k]; !ok {
			t.Errorf("Extra has unexpected key %q", k)
		}
	}
}