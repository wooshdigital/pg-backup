package dumper

import (
	"context"
	"fmt"
	"io"
	"log/slog"
	"os/exec"
)

// Dumper produces a pg_dump byte stream for a Postgres database.
type Dumper interface {
	Dump(ctx context.Context) (io.Reader, error)
}

// PGDumper invokes the pg_dump binary.
type PGDumper struct {
	dsn string
	env []string
}

// New creates a PGDumper for the given DSN.
func New(dsn string) (*PGDumper, error) {
	if dsn == "" {
		return nil, fmt.Errorf("dsn must not be empty")
	}
	env, err := dsnToEnv(dsn)
	if err != nil {
		return nil, fmt.Errorf("parse dsn: %w", err)
	}
	return &PGDumper{dsn: dsn, env: env}, nil
}

// Dump runs pg_dump and returns a reader over its stdout.
func (d *PGDumper) Dump(ctx context.Context) (io.Reader, error) {
	args := pgDumpArgs(d.env)
	slog.Debug("running pg_dump", "args", args)

	cmd := exec.CommandContext(ctx, "pg_dump", args...)
	cmd.Env = append(inheritEnv(), d.env...)

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return nil, fmt.Errorf("stdout pipe: %w", err)
	}

	if err := cmd.Start(); err != nil {
		return nil, fmt.Errorf("start pg_dump: %w", err)
	}

	// Return a reader that also waits for the process to finish.
	return &cmdReader{ReadCloser: stdout, cmd: cmd}, nil
}

// cmdReader wraps the stdout pipe of a running command and calls cmd.Wait()
// when the stream is exhausted.
type cmdReader struct {
	io.ReadCloser
	cmd    *exec.Cmd
	waited bool
}

func (r *cmdReader) Read(p []byte) (int, error) {
	n, err := r.ReadCloser.Read(p)
	if err == io.EOF && !r.waited {
		r.waited = true
		if waitErr := r.cmd.Wait(); waitErr != nil {
			return n, fmt.Errorf("pg_dump exited with error: %w", waitErr)
		}
	}
	return n, err
}