// Package dumper provides utilities for invoking pg_dump and streaming
// its output to an arbitrary io.Writer.
package dumper

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"os"
	"os/exec"
	"time"
)

// DumpResult contains metadata about a completed dump operation.
type DumpResult struct {
	// StartedAt is when the dump began.
	StartedAt time.Time
	// Duration is how long the dump took.
	Duration time.Duration
	// BytesWritten is the number of bytes written to the destination writer.
	BytesWritten int64
}

// Dumper is the interface for running a database dump.
type Dumper interface {
	// Dump executes a pg_dump of the database described by dsn, writing the
	// output to w. It respects ctx for cancellation.
	Dump(ctx context.Context, dsn string, w io.Writer) (*DumpResult, error)
}

// ExecRunner abstracts os/exec so it can be replaced in tests.
type ExecRunner func(ctx context.Context, name string, args []string, env []string, stdout io.Writer, stderr io.Writer) error

// DefaultExecRunner is the production ExecRunner that uses os/exec.
func DefaultExecRunner(ctx context.Context, name string, args []string, env []string, stdout io.Writer, stderr io.Writer) error {
	cmd := exec.CommandContext(ctx, name, args...)
	// Inherit the current process environment, then append our overrides.
	cmd.Env = append(os.Environ(), env...)
	cmd.Stdout = stdout
	cmd.Stderr = stderr
	return cmd.Run()
}

// PgDumper implements Dumper using the pg_dump binary.
type PgDumper struct {
	// PgDumpPath is the path to the pg_dump executable.
	// If empty, "pg_dump" is looked up on PATH.
	PgDumpPath string

	// ExtraArgs are additional flags passed to pg_dump before the database name.
	// For example: []string{"--format=custom", "--compress=9"}
	ExtraArgs []string

	// Runner is the function used to invoke pg_dump. Defaults to
	// DefaultExecRunner when nil.
	Runner ExecRunner
}

// NewPgDumper returns a PgDumper with sensible defaults.
func NewPgDumper() *PgDumper {
	return &PgDumper{
		PgDumpPath: "pg_dump",
		Runner:     DefaultExecRunner,
	}
}

// Dump runs pg_dump for the given DSN and streams the output to w.
// It returns a DumpResult containing timing and byte-count metadata.
//
// The dump is cancelled if ctx is cancelled. If pg_dump exits with a
// non-zero status, Dump returns a DumpError containing the captured stderr.
func (d *PgDumper) Dump(ctx context.Context, dsn string, w io.Writer) (*DumpResult, error) {
	if ctx == nil {
		return nil, fmt.Errorf("context must not be nil")
	}
	if w == nil {
		return nil, fmt.Errorf("writer must not be nil")
	}

	params, err := ParseDSN(dsn)
	if err != nil {
		return nil, fmt.Errorf("invalid DSN: %w", err)
	}

	pgDumpPath := d.PgDumpPath
	if pgDumpPath == "" {
		pgDumpPath = "pg_dump"
	}

	runner := d.Runner
	if runner == nil {
		runner = DefaultExecRunner
	}

	args := params.PgDumpArgs(d.ExtraArgs...)
	env := params.Env()

	// Capture stderr separately so we can include it in error messages.
	var stderrBuf bytes.Buffer

	// Wrap w to count bytes written.
	cw := &countingWriter{w: w}

	startedAt := time.Now()

	if err := runner(ctx, pgDumpPath, args, env, cw, &stderrBuf); err != nil {
		// Check if the context was cancelled.
		if ctx.Err() != nil {
			return nil, &DumpError{
				Cause:  ctx.Err(),
				Stderr: stderrBuf.String(),
			}
		}
		return nil, &DumpError{
			Cause:  err,
			Stderr: stderrBuf.String(),
		}
	}

	duration := time.Since(startedAt)
	return &DumpResult{
		StartedAt:    startedAt,
		Duration:     duration,
		BytesWritten: cw.n,
	}, nil
}

// DumpError is returned when pg_dump exits with a non-zero status or the
// context is cancelled.
type DumpError struct {
	// Cause is the underlying error (exec error or context error).
	Cause error
	// Stderr contains the captured stderr output from pg_dump.
	Stderr string
}

func (e *DumpError) Error() string {
	if e.Stderr != "" {
		return fmt.Sprintf("pg_dump failed: %v\nstderr: %s", e.Cause, e.Stderr)
	}
	return fmt.Sprintf("pg_dump failed: %v", e.Cause)
}

func (e *DumpError) Unwrap() error {
	return e.Cause
}

// countingWriter wraps an io.Writer and counts the total bytes written.
type countingWriter struct {
	w io.Writer
	n int64
}

func (cw *countingWriter) Write(p []byte) (int, error) {
	n, err := cw.w.Write(p)
	cw.n += int64(n)
	return n, err
}