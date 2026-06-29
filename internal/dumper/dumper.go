package dumper

import (
	"context"
	"fmt"
	"io"
	"os/exec"
)

// Dumper is the interface for database dump implementations.
type Dumper interface {
	Dump(ctx context.Context, w io.Writer) error
}

// Config holds the configuration for the pg_dump-based dumper.
type Config struct {
	DSN string
}

// PgDumper invokes pg_dump to stream a database dump.
type PgDumper struct {
	cfg Config
}

// New returns a new PgDumper for the given config.
func New(cfg Config) (*PgDumper, error) {
	if cfg.DSN == "" {
		return nil, fmt.Errorf("DSN must not be empty")
	}
	return &PgDumper{cfg: cfg}, nil
}

// Dump runs pg_dump and streams its output to w.
func (p *PgDumper) Dump(ctx context.Context, w io.Writer) error {
	args := []string{
		"--no-password",
		"--format=custom",
		p.cfg.DSN,
	}

	cmd := exec.CommandContext(ctx, "pg_dump", args...)
	cmd.Stdout = w

	if err := cmd.Run(); err != nil {
		return fmt.Errorf("pg_dump: %w", err)
	}
	return nil
}