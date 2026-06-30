package dumper

import (
	"context"
	"fmt"
	"io"
	"os/exec"
)

// Dumper produces a PostgreSQL dump.
type Dumper interface {
	Dump(ctx context.Context, w io.Writer) error
}

// PgDumper invokes the pg_dump binary to stream a database dump.
type PgDumper struct {
	dsn string
}

// New creates a PgDumper for the given DSN.
func New(dsn string) (*PgDumper, error) {
	if dsn == "" {
		return nil, fmt.Errorf("DSN must not be empty")
	}
	return &PgDumper{dsn: dsn}, nil
}

// Dump runs pg_dump and writes its output to w.
func (d *PgDumper) Dump(ctx context.Context, w io.Writer) error {
	// pg_dump accepts a DSN directly as the positional argument.
	cmd := exec.CommandContext(ctx, "pg_dump",
		"--no-password",
		"--format=custom",
		d.dsn,
	)
	cmd.Stdout = w

	stderrPipe, err := cmd.StderrPipe()
	if err != nil {
		return fmt.Errorf("stderr pipe: %w", err)
	}

	if err = cmd.Start(); err != nil {
		return fmt.Errorf("start pg_dump: %w", err)
	}

	stderrBytes, _ := io.ReadAll(stderrPipe)

	if err = cmd.Wait(); err != nil {
		if len(stderrBytes) > 0 {
			return fmt.Errorf("pg_dump: %w: %s", err, stderrBytes)
		}
		return fmt.Errorf("pg_dump: %w", err)
	}
	return nil
}