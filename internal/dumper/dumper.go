package dumper

import (
	"context"
	"io"

	"github.com/ssoready/conf/internal/config"
)

// Dumper is the interface that wraps pg_dump execution.
type Dumper interface {
	// Dump writes a PostgreSQL dump to w.
	Dump(ctx context.Context, w io.Writer) error
}

// New constructs a Dumper from the given configuration.
func New(cfg *config.Config) (Dumper, error) {
	dsn := cfg.Database.DSN
	if dsn == "" {
		dsn = buildDSNFromEnv()
	}
	return &pgDumper{dsn: dsn}, nil
}