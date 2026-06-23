package dumper

import (
	"fmt"
	"net"
	"net/url"
	"strconv"
	"strings"
)

// ConnParams holds the individual connection parameters extracted from a DSN.
type ConnParams struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
	// Extra holds any additional query parameters.
	Extra map[string]string
}

// ParseDSN parses a PostgreSQL connection string (URL or key=value format)
// and returns the individual connection parameters.
func ParseDSN(dsn string) (*ConnParams, error) {
	dsn = strings.TrimSpace(dsn)
	if dsn == "" {
		return nil, fmt.Errorf("dsn must not be empty")
	}

	if isURLFormat(dsn) {
		return parseURLDSN(dsn)
	}
	return parseKeyValueDSN(dsn)
}

// isURLFormat returns true if the DSN looks like a URL (postgres:// or postgresql://).
func isURLFormat(dsn string) bool {
	lower := strings.ToLower(dsn)
	return strings.HasPrefix(lower, "postgres://") || strings.HasPrefix(lower, "postgresql://")
}

// parseURLDSN parses a postgres:// or postgresql:// URL.
func parseURLDSN(dsn string) (*ConnParams, error) {
	u, err := url.Parse(dsn)
	if err != nil {
		return nil, fmt.Errorf("parsing DSN URL: %w", err)
	}

	params := &ConnParams{
		Extra: make(map[string]string),
	}

	// Host and port
	host := u.Hostname()
	port := u.Port()
	if host == "" {
		host = "localhost"
	}
	if port == "" {
		port = "5432"
	}
	params.Host = host
	params.Port = port

	// Validate port is numeric
	if _, err := strconv.Atoi(port); err != nil {
		return nil, fmt.Errorf("invalid port %q in DSN: %w", port, err)
	}

	// User info
	if u.User != nil {
		params.User = u.User.Username()
		params.Password, _ = u.User.Password()
	}

	// Database name (strip leading slash)
	params.DBName = strings.TrimPrefix(u.Path, "/")

	// Query parameters
	for key, vals := range u.Query() {
		if len(vals) == 0 {
			continue
		}
		val := vals[0]
		switch key {
		case "sslmode":
			params.SSLMode = val
		default:
			params.Extra[key] = val
		}
	}

	return params, nil
}

// parseKeyValueDSN parses a "key=value key=value ..." style DSN.
func parseKeyValueDSN(dsn string) (*ConnParams, error) {
	params := &ConnParams{
		Host:  "localhost",
		Port:  "5432",
		Extra: make(map[string]string),
	}

	tokens, err := tokenizeKeyValue(dsn)
	if err != nil {
		return nil, fmt.Errorf("parsing key=value DSN: %w", err)
	}

	for key, val := range tokens {
		switch key {
		case "host":
			params.Host = val
		case "port":
			if _, err := strconv.Atoi(val); err != nil {
				return nil, fmt.Errorf("invalid port %q: %w", val, err)
			}
			params.Port = val
		case "user":
			params.User = val
		case "password":
			params.Password = val
		case "dbname":
			params.DBName = val
		case "sslmode":
			params.SSLMode = val
		default:
			params.Extra[key] = val
		}
	}

	return params, nil
}

// tokenizeKeyValue splits a libpq-style key=value string, supporting
// single-quoted values with escape sequences.
func tokenizeKeyValue(dsn string) (map[string]string, error) {
	result := make(map[string]string)
	s := dsn

	for len(s) > 0 {
		// Skip leading whitespace
		s = strings.TrimLeft(s, " \t\n\r")
		if len(s) == 0 {
			break
		}

		// Read key
		eqIdx := strings.IndexByte(s, '=')
		if eqIdx < 0 {
			return nil, fmt.Errorf("expected key=value pair, got %q", s)
		}
		key := strings.TrimRight(s[:eqIdx], " \t")
		s = s[eqIdx+1:]

		// Skip whitespace before value
		s = strings.TrimLeft(s, " \t")

		// Read value
		var val string
		if len(s) > 0 && s[0] == '\'' {
			// Quoted value
			v, rest, err := readQuotedValue(s[1:])
			if err != nil {
				return nil, err
			}
			val = v
			s = rest
		} else {
			// Unquoted value: read until whitespace
			end := strings.IndexAny(s, " \t\n\r")
			if end < 0 {
				val = s
				s = ""
			} else {
				val = s[:end]
				s = s[end:]
			}
		}

		result[key] = val
	}

	return result, nil
}

// readQuotedValue reads a single-quoted value (after the opening quote).
// It handles \' and \\ escape sequences.
func readQuotedValue(s string) (value, rest string, err error) {
	var b strings.Builder
	i := 0
	for i < len(s) {
		ch := s[i]
		if ch == '\'' {
			return b.String(), s[i+1:], nil
		}
		if ch == '\\' {
			i++
			if i >= len(s) {
				return "", "", fmt.Errorf("unterminated escape in quoted value")
			}
			b.WriteByte(s[i])
			i++
			continue
		}
		b.WriteByte(ch)
		i++
	}
	return "", "", fmt.Errorf("unterminated quoted value")
}

// PgDumpArgs returns the command-line arguments for pg_dump derived from
// the connection parameters.
func (p *ConnParams) PgDumpArgs(extraArgs ...string) []string {
	args := []string{
		"--host", p.Host,
		"--port", p.Port,
		"--no-password", // never prompt; rely on PGPASSWORD env or pgpass file
	}
	if p.User != "" {
		args = append(args, "--username", p.User)
	}
	args = append(args, extraArgs...)
	if p.DBName != "" {
		args = append(args, p.DBName)
	}
	return args
}

// Env returns any environment variables that should be set when invoking
// pg_dump (currently just PGPASSWORD).
func (p *ConnParams) Env() []string {
	if p.Password != "" {
		return []string{"PGPASSWORD=" + p.Password}
	}
	return nil
}

// HostPort returns "host:port" suitable for net.Dial.
func (p *ConnParams) HostPort() string {
	return net.JoinHostPort(p.Host, p.Port)
}