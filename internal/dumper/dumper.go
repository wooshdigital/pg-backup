package dumper

import (
	"context"
	"fmt"
	"io"
	"os/exec"
)

// Dumper can stream a database dump to an io.Writer.
type Dumper interface {
	Dump(ctx context.Context, w io.Writer) error
}

// pgDumper implements Dumper using the pg_dump CLI tool.
type pgDumper struct {
	dsn string
}

// New returns a Dumper that wraps pg_dump for the given DSN.
func New(dsn string) (Dumper, error) {
	if dsn == "" {
		return nil, fmt.Errorf("DSN must not be empty")
	}
	return &pgDumper{dsn: dsn}, nil
}

// Dump executes pg_dump and streams its stdout to w.
func (d *pgDumper) Dump(ctx context.Context, w io.Writer) error {
	cmd := exec.CommandContext(ctx, "pg_dump", d.dsn)
	cmd.Stdout = w

	var stderr strings.Builder
	cmd.Stderr = &stderr

	if err := cmd.Run(); err != nil {
		msg := strings.TrimSpace(stderr.String())
		if msg != "" {
			return fmt.Errorf("pg_dump: %w: %s", err, msg)
		}
		return fmt.Errorf("pg_dump: %w", err)
	}
	return nil
}