package dumper

import (
	"fmt"
	"net/url"
	"strings"
)

// buildPgDumpArgs converts a DSN into pg_dump CLI arguments.
// It supports both URI-style (postgres://...) and key=value style DSNs.
func buildPgDumpArgs(dsn string) ([]string, error) {
	if strings.HasPrefix(dsn, "postgres://") || strings.HasPrefix(dsn, "postgresql://") {
		return buildArgsFromURI(dsn)
	}
	// For key=value DSNs, pass them via PGPASSWORD env and use --dbname.
	return []string{"--format=plain", "--no-password", "--dbname=" + dsn}, nil
}

func buildArgsFromURI(dsn string) ([]string, error) {
	u, err := url.Parse(dsn)
	if err != nil {
		return nil, fmt.Errorf("parsing DSN as URI: %w", err)
	}

	args := []string{"--format=plain", "--no-password"}

	if host := u.Hostname(); host != "" {
		args = append(args, "--host="+host)
	}
	if port := u.Port(); port != "" {
		args = append(args, "--port="+port)
	}
	if user := u.User.Username(); user != "" {
		args = append(args, "--username="+user)
	}
	if db := strings.TrimPrefix(u.Path, "/"); db != "" {
		args = append(args, "--dbname="+db)
	}

	return args, nil
}

// pgDumpEnv returns the environment for the pg_dump process,
// injecting PGPASSWORD if a password is present in the DSN.
func pgDumpEnv(dsn string, base []string) []string {
	if strings.HasPrefix(dsn, "postgres://") || strings.HasPrefix(dsn, "postgresql://") {
		if u, err := url.Parse(dsn); err == nil {
			if pw, ok := u.User.Password(); ok && pw != "" {
				return append(base, "PGPASSWORD="+pw)
			}
		}
	}
	return base
}