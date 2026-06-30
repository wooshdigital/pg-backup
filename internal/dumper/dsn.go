package dumper

import (
	"fmt"
	"net/url"
)

// ParseDSN extracts individual components from a Postgres connection string.
// It accepts both URI (postgres://...) and key=value formats.
type DSNComponents struct {
	Host     string
	Port     string
	User     string
	Password string
	Database string
	SSLMode  string
}

// ParseDSN parses a DSN string into its components.
func ParseDSN(dsn string) (*DSNComponents, error) {
	u, err := url.Parse(dsn)
	if err != nil {
		return nil, fmt.Errorf("invalid DSN: %w", err)
	}

	host := u.Hostname()
	port := u.Port()
	if port == "" {
		port = "5432"
	}

	var pass string
	if u.User != nil {
		pass, _ = u.User.Password()
	}

	sslmode := u.Query().Get("sslmode")
	if sslmode == "" {
		sslmode = "disable"
	}

	db := ""
	if len(u.Path) > 1 {
		db = u.Path[1:] // strip leading /
	}

	return &DSNComponents{
		Host:     host,
		Port:     port,
		User:     u.User.Username(),
		Password: pass,
		Database: db,
		SSLMode:  sslmode,
	}, nil
}

// ToArgs converts DSN components to pg_dump command-line arguments.
func (d *DSNComponents) ToArgs() []string {
	args := []string{
		"-h", d.Host,
		"-p", d.Port,
		"-U", d.User,
		"-d", d.Database,
		"--no-password",
	}
	return args
}