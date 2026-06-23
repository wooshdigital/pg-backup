// Package dumper provides PostgreSQL database dump functionality using pg_dump.
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

// Dumper is the interface for creating PostgreSQL dumps.
type Dumper interface {
	// Dump writes a pg_dump archive of the database described by dsn to w.
	// It returns a DumpResult with metadata about the operation.
	Dump(ctx context.Context, dsn string, w io.Writer) (DumpResult, error)
}

// DumpResult contains metadata about a completed dump operation.
type DumpResult struct {
	// StartedAt is when the dump began.
	StartedAt time.Time
	// Duration is the elapsed wall-clock time of the dump.
	Duration time.Duration
	// BytesWritten is the number of bytes written to the output writer.
	BytesWritten int64
}

// ExecRunner abstracts os/exec so the dumper can be unit-tested without
// spawning a real pg_dump process.
type ExecRunner interface {
	// CommandContext creates a command with the given context, name, and args.
	// The returned Cmd is ready for the caller to configure pipes and then Start.
	CommandContext(ctx context.Context, name string, args ...string) Commander
}

// Commander abstracts *exec.Cmd so it can be mocked in tests.
type Commander interface {
	// SetStdout sets the command's stdout.
	SetStdout(w io.Writer)
	// SetStderr sets the command's stderr.
	SetStderr(w io.Writer)
	// SetEnv sets the command's environment.
	SetEnv(env []string)
	// Run starts the command and waits for it to finish.
	Run() error
}

// -------------------------------------------------------------------------
// Real implementation backed by os/exec
// -------------------------------------------------------------------------

// osExecRunner is the production ExecRunner that delegates to os/exec.
type osExecRunner struct{}

func (osExecRunner) CommandContext(ctx context.Context, name string, args ...string) Commander {
	return &execCmd{cmd: exec.CommandContext(ctx, name, args...)}
}

// execCmd wraps *exec.Cmd and satisfies the Commander interface.
type execCmd struct {
	cmd *exec.Cmd
}

func (c *execCmd) SetStdout(w io.Writer) { c.cmd.Stdout = w }
func (c *execCmd) SetStderr(w io.Writer) { c.cmd.Stderr = w }
func (c *execCmd) SetEnv(env []string)   { c.cmd.Env = env }
func (c *execCmd) Run() error            { return c.cmd.Run() }

// -------------------------------------------------------------------------
// PgDumper
// -------------------------------------------------------------------------

// PgDumper implements the Dumper interface by invoking the pg_dump binary.
type PgDumper struct {
	// PgDumpPath is the path to the pg_dump binary.
	// Defaults to "pg_dump" (looked up in PATH) when empty.
	PgDumpPath string

	// ExtraArgs are additional arguments forwarded verbatim to pg_dump
	// (e.g. []string{"--format=custom", "--compress=9"}).
	ExtraArgs []string

	// runner is used for exec; defaults to the real os/exec implementation.
	runner ExecRunner
}

// NewPgDumper creates a PgDumper ready for use.
func NewPgDumper(opts ...Option) *PgDumper {
	d := &PgDumper{
		PgDumpPath: "pg_dump",
		runner:     osExecRunner{},
	}
	for _, o := range opts {
		o(d)
	}
	return d
}

// Option is a functional option for PgDumper.
type Option func(*PgDumper)

// WithPgDumpPath overrides the pg_dump binary path.
func WithPgDumpPath(path string) Option {
	return func(d *PgDumper) { d.PgDumpPath = path }
}

// WithExtraArgs appends extra arguments to every pg_dump invocation.
func WithExtraArgs(args ...string) Option {
	return func(d *PgDumper) { d.ExtraArgs = append(d.ExtraArgs, args...) }
}

// withRunner replaces the exec runner (used in unit tests).
func withRunner(r ExecRunner) Option {
	return func(d *PgDumper) { d.runner = r }
}

// Dump invokes pg_dump and streams its stdout to w.
//
// The DSN password (if any) is passed to pg_dump via the PGPASSWORD
// environment variable so it never appears on the command line.
//
// The dump can be cancelled at any time through the provided context.
func (d *PgDumper) Dump(ctx context.Context, dsn string, w io.Writer) (DumpResult, error) {
	params, err := ParseDSN(dsn)
	if err != nil {
		return DumpResult{}, fmt.Errorf("dumper: parse DSN: %w", err)
	}

	// Build pg_dump argument list.
	pgDumpBin := d.PgDumpPath
	if pgDumpBin == "" {
		pgDumpBin = "pg_dump"
	}

	args := append(params.PgDumpArgs(), d.ExtraArgs...)

	cmd := d.runner.CommandContext(ctx, pgDumpBin, args...)

	// Count bytes written to w via a tee.
	cw := &countingWriter{w: w}
	cmd.SetStdout(cw)

	// Capture stderr so we can include it in error messages.
	var stderrBuf bytes.Buffer
	cmd.SetStderr(&stderrBuf)

	// Pass the password via the environment to avoid it appearing in ps output.
	env := buildEnv(params.Password)
	cmd.SetEnv(env)

	start := time.Now()

	if err := cmd.Run(); err != nil {
		stderr := strings.TrimSpace(stderrBuf.String())
		if stderr != "" {
			return DumpResult{}, fmt.Errorf("dumper: pg_dump failed: %w\nstderr: %s", err, stderr)
		}
		return DumpResult{}, fmt.Errorf("dumper: pg_dump failed: %w", err)
	}

	result := DumpResult{
		StartedAt:    start,
		Duration:     time.Since(start),
		BytesWritten: cw.n,
	}

	return result, nil
}

// -------------------------------------------------------------------------
// helpers
// -------------------------------------------------------------------------

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

// buildEnv constructs the environment for the pg_dump process.
// It inherits the current process environment and, if a password is provided,
// injects PGPASSWORD.
func buildEnv(password string) []string {
	// Start from the current process environment so PATH etc. are available.
	env := append([]string(nil), currentEnv()...)

	if password != "" {
		env = append(env, "PGPASSWORD="+password)
	}
	return env
}