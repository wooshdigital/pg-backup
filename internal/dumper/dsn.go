package dumper

import (
	"fmt"
	"net/url"
)

// ParseDSN validates and normalises a Postgres connection DSN.
// Both URI format (postgres://…) and DSN keyword format are accepted.
func ParseDSN(dsn string) (string, error) {
	if dsn == "" {
		return "", fmt.Errorf("DSN must not be empty")
	}

	u, err := url.Parse(dsn)
	if err != nil {
		return "", fmt.Errorf("invalid DSN: %w", err)
	}

	switch u.Scheme {
	case "postgres", "postgresql":
		// valid URI format – return as-is
		return dsn, nil
	case "":
		// keyword=value format – pass through unchecked
		return dsn, nil
	default:
		return "", fmt.Errorf("unsupported DSN scheme %q (expected postgres or postgresql)", u.Scheme)
	}
}