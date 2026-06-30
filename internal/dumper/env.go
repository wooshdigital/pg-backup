package dumper

import (
	"fmt"
	"os"
)

// buildDSNFromEnv constructs a Postgres DSN from individual PG* environment
// variables that pg_dump itself honours. This mirrors the libpq precedence.
func buildDSNFromEnv() string {
	host := envOrDefault("PGHOST", "localhost")
	port := envOrDefault("PGPORT", "5432")
	user := envOrDefault("PGUSER", "postgres")
	pass := os.Getenv("PGPASSWORD")
	db := envOrDefault("PGDATABASE", "postgres")
	sslmode := envOrDefault("PGSSLMODE", "disable")

	if pass != "" {
		return fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=%s", user, pass, host, port, db, sslmode)
	}
	return fmt.Sprintf("postgres://%s@%s:%s/%s?sslmode=%s", user, host, port, db, sslmode)
}

func envOrDefault(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}