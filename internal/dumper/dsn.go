// Package dumper provides PostgreSQL dump functionality.
package dumper

import (
	"fmt"
	"net"
	"net/url"
	"strconv"
	"strings"
)

// ConnParams holds individual connection parameters extracted from a DSN.
type ConnParams struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
	Extra    map[string]string
}

// ParseDSN parses a PostgreSQL DSN (connection string) and returns individual
// connection parameters. It supports both URL format (postgres://...) and
// key=value format (host=... port=... ...).
func ParseDSN(dsn string) (*ConnParams, error) {
	dsn = strings.TrimSpace(dsn)
	if dsn == "" {
		return nil, fmt.Errorf("empty DSN")
	}

	if strings.HasPrefix(dsn, "postgres://") || strings.HasPrefix(dsn, "postgresql://") {
		return parseURLDSN(dsn)
	}

	return parseKeyValueDSN(dsn)
}

// parseURLDSN parses a postgres:// or postgresql:// URL.
func parseURLDSN(dsn string) (*ConnParams, error) {
	u, err := url.Parse(dsn)
	if err != nil {
		return nil, fmt.Errorf("invalid DSN URL: %w", err)
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

	// Database name (path starts with /)
	if u.Path != "" {
		params.DBName = strings.TrimPrefix(u.Path, "/")
	}

	// Query parameters
	q := u.Query()
	if sslmode := q.Get("sslmode"); sslmode != "" {
		params.SSLMode = sslmode
		q.Del("sslmode")
	}

	for k, vals := range q {
		if len(vals) > 0 {
			params.Extra[k] = vals[0]
		}
	}

	return params, nil
}

// parseKeyValueDSN parses a key=value style DSN string.
// Values can be quoted with single quotes; a literal single quote is escaped as \'.
func parseKeyValueDSN(dsn string) (*ConnParams, error) {
	params := &ConnParams{
		Extra: make(map[string]string),
	}

	kv, err := tokenizeKeyValue(dsn)
	if err != nil {
		return nil, fmt.Errorf("invalid key=value DSN: %w", err)
	}

	for k, v := range kv {
		switch k {
		case "host":
			params.Host = v
		case "port":
			params.Port = v
		case "user":
			params.User = v
		case "password":
			params.Password = v
		case "dbname":
			params.DBName = v
		case "sslmode":
			params.SSLMode = v
		default:
			params.Extra[k] = v
		}
	}

	// Apply defaults
	if params.Host == "" {
		params.Host = "localhost"
	}
	if params.Port == "" {
		params.Port = "5432"
	}

	if params.Port != "" {
		if _, err := strconv.Atoi(params.Port); err != nil {
			return nil, fmt.Errorf("invalid port %q in DSN: %w", params.Port, err)
		}
	}

	return params, nil
}

// tokenizeKeyValue parses a libpq-style key=value connection string.
// It handles single-quoted values and backslash escaping within quotes.
func tokenizeKeyValue(s string) (map[string]string, error) {
	result := make(map[string]string)
	i := 0
	n := len(s)

	for i < n {
		// Skip whitespace
		for i < n && isSpace(s[i]) {
			i++
		}
		if i >= n {
			break
		}

		// Read key
		keyStart := i
		for i < n && s[i] != '=' && !isSpace(s[i]) {
			i++
		}
		key := s[keyStart:i]
		if key == "" {
			return nil, fmt.Errorf("expected key at position %d", keyStart)
		}

		// Skip whitespace before '='
		for i < n && isSpace(s[i]) {
			i++
		}
		if i >= n || s[i] != '=' {
			return nil, fmt.Errorf("expected '=' after key %q at position %d", key, i)
		}
		i++ // consume '='

		// Skip whitespace before value
		for i < n && isSpace(s[i]) {
			i++
		}

		// Read value
		var value string
		if i < n && s[i] == '\'' {
			// Quoted value
			i++ // skip opening quote
			var sb strings.Builder
			for i < n {
				if s[i] == '\'' {
					i++ // skip closing quote
					break
				}
				if s[i] == '\\' && i+1 < n {
					i++
					sb.WriteByte(s[i])
					i++
					continue
				}
				sb.WriteByte(s[i])
				i++
			}
			value = sb.String()
		} else {
			// Unquoted value — read until whitespace
			valueStart := i
			for i < n && !isSpace(s[i]) {
				i++
			}
			value = s[valueStart:i]
		}

		result[key] = value
	}

	return result, nil
}

func isSpace(c byte) bool {
	return c == ' ' || c == '\t' || c == '\n' || c == '\r'
}

// BuildPgDumpArgs converts ConnParams into pg_dump command-line flags.
// The password is intentionally omitted (should be passed via PGPASSWORD env var).
func (p *ConnParams) BuildPgDumpArgs(dbname string) []string {
	var args []string

	if p.Host != "" {
		// If host looks like a socket directory path, use -h for that too.
		if strings.HasPrefix(p.Host, "/") || !isHostname(p.Host) {
			args = append(args, "-h", p.Host)
		} else {
			args = append(args, "-h", p.Host)
		}
	}

	if p.Port != "" && p.Port != "5432" {
		args = append(args, "-p", p.Port)
	} else if p.Port == "5432" {
		// Still pass it explicitly for clarity
		args = append(args, "-p", p.Port)
	}

	if p.User != "" {
		args = append(args, "-U", p.User)
	}

	// Use the provided dbname override if non-empty, otherwise fall back to parsed dbname
	target := dbname
	if target == "" {
		target = p.DBName
	}
	if target != "" {
		args = append(args, "-d", target)
	}

	return args
}

// isHostname returns true if the string looks like a hostname or IP rather than a path.
func isHostname(s string) bool {
	// If it parses as an IP, it's a host
	if net.ParseIP(s) != nil {
		return true
	}
	// If it contains dots or letters mixed with digits, treat as hostname
	return !strings.HasPrefix(s, "/")
}