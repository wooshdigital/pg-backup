package dumper

import (
	"bytes"
	"fmt"
	"os"
)

// dsnToEnv converts a postgres DSN into environment variables suitable
// for passing to pg_dump.
func dsnToEnv(dsn string) ([]string, error) {
	parsed, err := parseDSN(dsn)
	if err != nil {
		return nil, err
	}

	env := os.Environ()

	if parsed.host != "" {
		env = append(env, fmt.Sprintf("PGHOST=%s", parsed.host))
	}
	if parsed.port != "" {
		env = append(env, fmt.Sprintf("PGPORT=%s", parsed.port))
	}
	if parsed.user != "" {
		env = append(env, fmt.Sprintf("PGUSER=%s", parsed.user))
	}
	if parsed.password != "" {
		env = append(env, fmt.Sprintf("PGPASSWORD=%s", parsed.password))
	}
	if parsed.dbname != "" {
		env = append(env, fmt.Sprintf("PGDATABASE=%s", parsed.dbname))
	}
	if parsed.sslmode != "" {
		env = append(env, fmt.Sprintf("PGSSLMODE=%s", parsed.sslmode))
	}

	return env, nil
}

// Ensure bytes is available for the dumper.go file.
var _ = bytes.NewBuffer