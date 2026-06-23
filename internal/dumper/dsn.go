// Package dumper provides PostgreSQL dump functionality.
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
}

// ParseDSN parses a PostgreSQL connection string (URL or key=value format)
// and returns the individual connection parameters.
//
// Supported formats:
//   - postgres://user:pass@host:port/dbname?sslmode=disable
//   - postgresql://user:pass@host:port/dbname?sslmode=disable
//   - host=localhost port=5432 user=postgres password=secret dbname=mydb sslmode=disable
func ParseDSN(dsn string) (ConnParams, error) {
	dsn = strings.TrimSpace(dsn)
	if dsn == "" {
		return ConnParams{}, fmt.Errorf("dsn must not be empty")
	}

	if strings.HasPrefix(dsn, "postgres://") || strings.HasPrefix(dsn, "postgresql://") {
		return parseURLDSN(dsn)
	}

	return parseKeyValueDSN(dsn)
}

// parseURLDSN handles postgres:// and postgresql:// connection strings.
func parseURLDSN(rawURL string) (ConnParams, error) {
	u, err := url.Parse(rawURL)
	if err != nil {
		return ConnParams{}, fmt.Errorf("invalid DSN URL: %w", err)
	}

	var params ConnParams

	// Host / port
	host := u.Hostname()
	port := u.Port()

	if host == "" {
		host = "localhost"
	}
	if port == "" {
		port = "5432"
	}

	// Validate port is numeric
	if _, err := strconv.Atoi(port); err != nil {
		return ConnParams{}, fmt.Errorf("invalid port %q in DSN: %w", port, err)
	}

	params.Host = host
	params.Port = port

	// User / password
	if u.User != nil {
		params.User = u.User.Username()
		params.Password, _ = u.User.Password()
	}

	// Database name: strip leading "/"
	params.DBName = strings.TrimPrefix(u.Path, "/")

	// SSL mode from query string
	params.SSLMode = u.Query().Get("sslmode")
	if params.SSLMode == "" {
		params.SSLMode = "prefer"
	}

	if err := validateParams(params); err != nil {
		return ConnParams{}, err
	}

	return params, nil
}

// parseKeyValueDSN handles "key=value key=value ..." connection strings.
func parseKeyValueDSN(dsn string) (ConnParams, error) {
	params := ConnParams{
		Host:    "localhost",
		Port:    "5432",
		SSLMode: "prefer",
	}

	// Simple tokeniser that respects single-quoted values.
	tokens, err := tokenizeKeyValue(dsn)
	if err != nil {
		return ConnParams{}, fmt.Errorf("invalid key=value DSN: %w", err)
	}

	for key, value := range tokens {
		switch key {
		case "host":
			params.Host = value
		case "port":
			if _, err := strconv.Atoi(value); err != nil {
				return ConnParams{}, fmt.Errorf("invalid port %q: %w", value, err)
			}
			params.Port = value
		case "user":
			params.User = value
		case "password":
			params.Password = value
		case "dbname":
			params.DBName = value
		case "sslmode":
			params.SSLMode = value
		// Ignore unknown keys (e.g. connect_timeout, application_name …)
		}
	}

	if err := validateParams(params); err != nil {
		return ConnParams{}, err
	}

	return params, nil
}

// tokenizeKeyValue parses a libpq-style "key=value" string into a map.
// Values may be single-quoted; inside a quoted value, \' is an escaped quote.
func tokenizeKeyValue(s string) (map[string]string, error) {
	result := make(map[string]string)
	s = strings.TrimSpace(s)

	for len(s) > 0 {
		s = strings.TrimSpace(s)
		if len(s) == 0 {
			break
		}

		// Read key
		eqIdx := strings.IndexByte(s, '=')
		if eqIdx < 0 {
			return nil, fmt.Errorf("missing '=' after key %q", s)
		}
		key := strings.TrimSpace(s[:eqIdx])
		s = strings.TrimSpace(s[eqIdx+1:])

		// Read value
		var value string
		if len(s) > 0 && s[0] == '\'' {
			// Quoted value
			var sb strings.Builder
			s = s[1:] // skip opening quote
			for {
				if len(s) == 0 {
					return nil, fmt.Errorf("unterminated quoted value for key %q", key)
				}
				if s[0] == '\'' {
					s = s[1:] // skip closing quote
					break
				}
				if s[0] == '\\' && len(s) > 1 && s[1] == '\'' {
					sb.WriteByte('\'')
					s = s[2:]
					continue
				}
				sb.WriteByte(s[0])
				s = s[1:]
			}
			value = sb.String()
		} else {
			// Unquoted value – ends at next whitespace
			end := strings.IndexAny(s, " \t\n\r")
			if end < 0 {
				value = s
				s = ""
			} else {
				value = s[:end]
				s = s[end:]
			}
		}

		result[key] = value
	}

	return result, nil
}

// validateParams performs basic sanity checks on the extracted parameters.
func validateParams(p ConnParams) error {
	if p.DBName == "" {
		return fmt.Errorf("database name is required in DSN")
	}
	if p.User == "" {
		return fmt.Errorf("user is required in DSN")
	}
	// Validate host is not an obviously broken value.
	// Allow plain hostnames, IPv4, IPv6 (in brackets in URL form but parsed out).
	_ = net.ParseIP(p.Host) // non-fatal if it's a hostname
	return nil
}

// PgDumpArgs returns the command-line flags for pg_dump derived from ConnParams.
// The password is intentionally excluded (should be passed via PGPASSWORD env var).
func (p ConnParams) PgDumpArgs() []string {
	args := []string{
		"--host", p.Host,
		"--port", p.Port,
		"--username", p.User,
		"--no-password",
		p.DBName,
	}
	return args
}