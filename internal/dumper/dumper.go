package dumper

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"os/exec"
	"strings"
	"time"
)

// DumpResult contains metadata about a completed pg_dump operation.
type DumpResult struct {
	// StartTime is when the dump began.
	StartTime time.Time
	// Duration is how long the dump took.
	Duration time.Duration
	// BytesWritten is the number of bytes written to the output writer.
	BytesWritten int64
	// DatabaseName is the name of the database that was dumped.
	DatabaseName string
}

// Dumper is the interface for running PostgreSQL dumps.
type Dumper interface {
	// Dump runs pg_dump for the given DSN, writing output to w.
	// The context can be used to cancel the operation.
	Dump(ctx context.Context, dsn string, w io.Writer) (*DumpResult, error)
}

// ExecRunner is a function that creates an *exec.Cmd. It's abstracted for
// testing so we can swap in a fake pg_dump.
type ExecRunner func(ctx context.Context, name string, args ...string) *exec.Cmd

// PgDumper implements Dumper using the system pg_dump binary.
type PgDumper struct {
	// PgDumpPath is the path to the pg_dump binary. Defaults to "pg_dump".
	PgDumpPath string

	// ExtraArgs are additional arguments passed to pg_dump (e.g., "--format=c").
	ExtraArgs []string

	// runner is used to create exec.Cmd instances; defaults to exec.CommandContext.
	runner ExecRunner
}

// Option is a functional option for PgDumper.
type Option func(*PgDumper)

// WithPgDumpPath sets a custom path to the pg_dump binary.
func WithPgDumpPath(path string) Option {
	return func(p *PgDumper) {
		p.PgDumpPath = path
	}
}

// WithExtraArgs sets additional arguments to pass to pg_dump.
func WithExtraArgs(args ...string) Option {
	return func(p *PgDumper) {
		p.ExtraArgs = args
	}
}

// withExecRunner replaces the command runner (for testing only).
func withExecRunner(runner ExecRunner) Option {
	return func(p *PgDumper) {
		p.runner = runner
	}
}

// NewPgDumper creates a new PgDumper with the given options.
func NewPgDumper(opts ...Option) *PgDumper {
	d := &PgDumper{
		PgDumpPath: "pg_dump",
		runner:     exec.CommandContext,
	}
	for _, o := range opts {
		o(d)
	}
	return d
}

// Dump runs pg_dump for the database identified by dsn, writing the dump
// output to w. It streams stdout directly to w to avoid buffering the entire
// dump in memory. stderr is captured and included in any error message.
//
// The dump can be cancelled via ctx; if the context is cancelled, pg_dump is
// killed and Dump returns the context's error.
func (d *PgDumper) Dump(ctx context.Context, dsn string, w io.Writer) (*DumpResult, error) {
	params, err := ParseDSN(dsn)
	if err != nil {
		return nil, fmt.Errorf("dumper: failed to parse DSN: %w", err)
	}

	// Build pg_dump arguments
	args := params.BuildPgDumpArgs("")
	args = append(args, d.ExtraArgs...)

	pgDump := d.PgDumpPath
	if pgDump == "" {
		pgDump = "pg_dump"
	}

	cmd := d.runner(ctx, pgDump, args...)

	// If a password is present in the DSN, pass it via the environment variable.
	// This avoids it appearing in process listings.
	if params.Password != "" {
		cmd.Env = append(cmd.Environ(), "PGPASSWORD="+params.Password)
	}

	// Connect stdout to a counting writer that wraps w
	cw := &countingWriter{w: w}
	cmd.Stdout = cw

	// Capture stderr for error reporting
	var stderrBuf bytes.Buffer
	cmd.Stderr = &stderrBuf

	startTime := time.Now()

	if err := cmd.Start(); err != nil {
		return nil, fmt.Errorf("dumper: failed to start pg_dump: %w", err)
	}

	// Wait for the command to finish. If the context is cancelled, the
	// exec.CommandContext mechanism will kill the process.
	waitErr := cmd.Wait()
	duration := time.Since(startTime)

	if waitErr != nil {
		stderr := strings.TrimSpace(stderrBuf.String())
		if stderr != "" {
			return nil, fmt.Errorf("dumper: pg_dump failed: %w\nstderr: %s", waitErr, stderr)
		}
		// Check if it was context cancellation
		if ctx.Err() != nil {
			return nil, fmt.Errorf("dumper: pg_dump cancelled: %w", ctx.Err())
		}
		return nil, fmt.Errorf("dumper: pg_dump failed: %w", waitErr)
	}

	return &DumpResult{
		StartTime:    startTime,
		Duration:     duration,
		BytesWritten: cw.n,
		DatabaseName: params.DBName,
	}, nil
}

// Environ returns the command's environment, falling back to the inherited
// process environment if Env is nil.
func (cmd *exec.Cmd) Environ() []string {
	if cmd.Env != nil {
		return cmd.Env
	}
	return nil // exec package inherits env when Env is nil
}

// countingWriter wraps an io.Writer and counts bytes written.
type countingWriter struct {
	w io.Writer
	n int64
}

func (cw *countingWriter) Write(p []byte) (int, error) {
	n, err := cw.w.Write(p)
	cw.n += int64(n)
	return n, err
}