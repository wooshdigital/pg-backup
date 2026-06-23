package dumper

import (
	"fmt"
	"net/url"
	"strconv"
	"strings"
)

// ConnParams holds individual connection parameters extracted from a DSN.
type ConnParams struct {
	Host     string
	Port     int
	User     string
	Password string
	DBName   string
	SSLMode  string
	// Extra key=value options not explicitly mapped above
	Extra map[string]string
}

// DefaultPort is the default PostgreSQL port.
const DefaultPort = 5432

// ParseDSN parses a PostgreSQL connection string (URL or key=value format)
// and returns a ConnParams struct.
//
// Supported formats:
//
//	postgres://user:pass@host:port/dbname?sslmode=disable
//	postgresql://user:pass@host:port/dbname?sslmode=disable
//	host=localhost port=5432 user=postgres password=secret dbname=mydb sslmode=disable
func ParseDSN(dsn string) (ConnParams, error) {
	dsn = strings.TrimSpace(dsn)
	if dsn == "" {
		return ConnParams{}, fmt.Errorf("dsn is empty")
	}

	if strings.HasPrefix(dsn, "postgres://") || strings.HasPrefix(dsn, "postgresql://") {
		return parseURLDSN(dsn)
	}
	return parseKVDSN(dsn)
}

func parseURLDSN(dsn string) (ConnParams, error) {
	u, err := url.Parse(dsn)
	if err != nil {
		return ConnParams{}, fmt.Errorf("parsing DSN URL: %w", err)
	}

	params := ConnParams{
		Host:  u.Hostname(),
		Extra: make(map[string]string),
	}

	if params.Host == "" {
		params.Host = "localhost"
	}

	// Port
	portStr := u.Port()
	if portStr == "" {
		params.Port = DefaultPort
	} else {
		port, err := strconv.Atoi(portStr)
		if err != nil {
			return ConnParams{}, fmt.Errorf("invalid port %q: %w", portStr, err)
		}
		params.Port = port
	}

	// User info
	if u.User != nil {
		params.User = u.User.Username()
		params.Password, _ = u.User.Password()
	}

	// Database name: strip leading "/"
	params.DBName = strings.TrimPrefix(u.Path, "/")

	// Query params
	for key, vals := range u.Query() {
		if len(vals) == 0 {
			continue
		}
		val := vals[0]
		switch strings.ToLower(key) {
		case "sslmode":
			params.SSLMode = val
		default:
			params.Extra[key] = val
		}
	}

	return params, nil
}

func parseKVDSN(dsn string) (ConnParams, error) {
	params := ConnParams{
		Host:  "localhost",
		Port:  DefaultPort,
		Extra: make(map[string]string),
	}

	// Tokenise respecting single-quoted values
	tokens, err := tokenizeKV(dsn)
	if err != nil {
		return ConnParams{}, fmt.Errorf("tokenizing DSN: %w", err)
	}

	for _, token := range tokens {
		idx := strings.IndexByte(token, '=')
		if idx < 0 {
			return ConnParams{}, fmt.Errorf("invalid key=value token %q", token)
		}
		key := strings.TrimSpace(token[:idx])
		val := strings.TrimSpace(token[idx+1:])
		// Strip surrounding single quotes
		if len(val) >= 2 && val[0] == '\'' && val[len(val)-1] == '\'' {
			val = val[1 : len(val)-1]
			val = strings.ReplaceAll(val, `\'`, `'`)
			val = strings.ReplaceAll(val, `\\`, `\`)
		}

		switch key {
		case "host":
			params.Host = val
		case "port":
			port, err := strconv.Atoi(val)
			if err != nil {
				return ConnParams{}, fmt.Errorf("invalid port %q: %w", val, err)
			}
			params.Port = port
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

// tokenizeKV splits a libpq key=value connection string into individual
// key=value tokens, respecting single-quoted values that may contain spaces.
func tokenizeKV(s string) ([]string, error) {
	var tokens []string
	var cur strings.Builder
	inQuote := false
	i := 0
	for i < len(s) {
		ch := s[i]
		switch {
		case ch == '\'' && !inQuote:
			inQuote = true
			cur.WriteByte(ch)
			i++
		case ch == '\'' && inQuote:
			// Check for escaped quote
			if i+1 < len(s) && s[i+1] == '\'' {
				cur.WriteString(`\'`)
				i += 2
			} else {
				inQuote = false
				cur.WriteByte(ch)
				i++
			}
		case (ch == ' ' || ch == '\t' || ch == '\n') && !inQuote:
			if cur.Len() > 0 {
				tokens = append(tokens, cur.String())
				cur.Reset()
			}
			i++
		default:
			cur.WriteByte(ch)
			i++
		}
	}
	if inQuote {
		return nil, fmt.Errorf("unterminated single quote in DSN")
	}
	if cur.Len() > 0 {
		tokens = append(tokens, cur.String())
	}
	return tokens, nil
}

// ToPgDumpArgs converts ConnParams into command-line flags suitable for pg_dump.
// The password is intentionally excluded (should be passed via PGPASSWORD env var).
func (p ConnParams) ToPgDumpArgs(extraArgs ...string) []string {
	args := []string{
		"--host", p.Host,
		"--port", strconv.Itoa(p.Port),
	}
	if p.User != "" {
		args = append(args, "--username", p.User)
	}
	if p.DBName != "" {
		args = append(args, "--dbname", p.DBName)
	}
	// No --password flag; pg_dump reads PGPASSWORD from environment.
	args = append(args, extraArgs...)
	return args
}