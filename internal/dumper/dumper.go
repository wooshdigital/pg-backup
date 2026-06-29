package dumper

import (
	"context"
	"fmt"
	"io"
	"os/exec"
)

// Dumper defines the interface for database dumpers.
type Dumper interface {
	// Dump writes a database dump to w.
	Dump(ctx context.Context, w io.Writer) error
}

// PgDumper implements Dumper using pg_dump.
type PgDumper struct {
	dsn string
	env []string
}

// New creates a new PgDumper for the given DSN.
func New(dsn string) (*PgDumper, error) {
	if dsn == "" {
		return nil, fmt.Errorf("DSN must not be empty")
	}
	env, err := dsnToEnv(dsn)
	if err != nil {
		return nil, fmt.Errorf("parse DSN: %w", err)
	}
	return &PgDumper{dsn: dsn, env: env}, nil
}

// Dump runs pg_dump and writes the output to w.
func (d *PgDumper) Dump(ctx context.Context, w io.Writer) error {
	cmd := exec.CommandContext(ctx, "pg_dump", "--no-password")
	cmd.Env = d.env
	cmd.Stdout = w

	var stderr bytes.Buffer
	cmd.Stderr = &stderr

	if err := cmd.Run(); err != nil {
		return fmt.Errorf("pg_dump: %w: %s", err, stderr.String())
	}
	return nil
}