// Package dumper provides functionality for invoking pg_dump and streaming
// its output to an io.Writer.
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

// ExecRunner abstracts how a command is created, allowing tests to inject a
// mock runner without spawning a real subprocess.
type ExecRunner func(ctx context.Context, name string, args ...string) Cmd

// Cmd is the minimal interface over *exec.Cmd that Dumper needs.
type Cmd interface {
	// SetStdout sets the writer that receives the command's standard output.
	SetStdout(w io.Writer)
	// SetStderr sets the writer that receives the command's standard error.
	SetStderr(w io.Writer)
	// SetEnv sets the complete environment for the command.
	SetEnv(env []string)
	// Run starts the command and waits for it to exit.
	Run() error
}

// DumpResult contains metadata about a completed dump operation.
type DumpResult struct {
	// StartedAt is the wall-clock time at which the dump began.
	StartedAt time.Time
	// Duration is how long the dump took.
	Duration time.Duration
	// BytesWritten is the number of bytes streamed to the destination writer.
	BytesWritten int64
}

// Dumper is the public interface for running a database dump.
type Dumper interface {
	// Dump executes pg_dump for the given DSN and writes the output to dst.
	// The context may be used to cancel the dump mid-stream.
	Dump(ctx context.Context, dsn string, dst io.Writer) (DumpResult, error)
}

// PgDumper implements Dumper by invoking the pg_dump binary.
type PgDumper struct {
	// PgDumpPath is the path to the pg_dump executable.
	// If empty, "pg_dump" is resolved via PATH.
	PgDumpPath string

	// ExtraArgs are appended verbatim to the pg_dump invocation.
	// Example: []string{"--format=custom", "--compress=9"}
	ExtraArgs []string

	// runner creates Cmd instances. Defaults to defaultExecRunner when nil.
	runner ExecRunner
}

// Option is a functional option for configuring PgDumper.
type Option func(*PgDumper)

// WithPgDumpPath overrides the path to the pg_dump binary.
func WithPgDumpPath(path string) Option {
	return func(d *PgDumper) { d.PgDumpPath = path }
}

// WithExtraArgs appends extra command-line arguments to pg_dump.
func WithExtraArgs(args ...string) Option {
	return func(d *PgDumper) { d.ExtraArgs = append(d.ExtraArgs, args...) }
}

// withExecRunner injects a custom runner (used in tests).
func withExecRunner(r ExecRunner) Option {
	return func(d *PgDumper) { d.runner = r }
}

// NewPgDumper constructs a PgDumper with the provided options.
func NewPgDumper(opts ...Option) *PgDumper {
	d := &PgDumper{}
	for _, o := range opts {
		o(d)
	}
	return d
}

// Dump implements Dumper. It:
//  1. Parses the DSN.
//  2. Builds pg_dump arguments.
//  3. Streams stdout to dst via a counting writer.
//  4. Captures stderr for error messages.
//  5. Returns a DumpResult with timing and byte-count metadata.
func (d *PgDumper) Dump(ctx context.Context, dsn string, dst io.Writer) (DumpResult, error) {
	params, err := ParseDSN(dsn)
	if err != nil {
		return DumpResult{}, fmt.Errorf("dumper: parsing DSN: %w", err)
	}

	pgDumpBin := d.PgDumpPath
	if pgDumpBin == "" {
		pgDumpBin = "pg_dump"
	}

	args := params.ToPgDumpArgs(d.ExtraArgs...)

	runner := d.runner
	if runner == nil {
		runner = defaultExecRunner
	}

	cmd := runner(ctx, pgDumpBin, args...)

	// Password via environment variable to avoid appearing in process list.
	env := os.Environ()
	if params.Password != "" {
		env = append(env, "PGPASSWORD="+params.Password)
	}
	cmd.SetEnv(env)

	// Count bytes written to dst.
	cw := &countWriter{dst: dst}
	cmd.SetStdout(cw)

	// Capture stderr for error reporting.
	var stderrBuf bytes.Buffer
	cmd.SetStderr(&stderrBuf)

	startedAt := time.Now()

	if err := cmd.Run(); err != nil {
		stderr := stderrBuf.String()
		return DumpResult{
			StartedAt:    startedAt,
			Duration:     time.Since(startedAt),
			BytesWritten: cw.n,
		}, fmt.Errorf("dumper: pg_dump failed: %w\nstderr: %s", err, stderr)
	}

	return DumpResult{
		StartedAt:    startedAt,
		Duration:     time.Since(startedAt),
		BytesWritten: cw.n,
	}, nil
}

// countWriter wraps an io.Writer and tracks how many bytes have been written.
type countWriter struct {
	dst io.Writer
	n   int64
}

func (cw *countWriter) Write(p []byte) (int, error) {
	n, err := cw.dst.Write(p)
	cw.n += int64(n)
	return n, err
}

// --- default exec runner ---

// defaultExecRunner is the production ExecRunner that creates real *exec.Cmd
// instances.
func defaultExecRunner(ctx context.Context, name string, args ...string) Cmd {
	return &realCmd{cmd: exec.CommandContext(ctx, name, args...)}
}

// realCmd adapts *exec.Cmd to the Cmd interface.
type realCmd struct {
	cmd *exec.Cmd
}

func (r *realCmd) SetStdout(w io.Writer) { r.cmd.Stdout = w }
func (r *realCmd) SetStderr(w io.Writer) { r.cmd.Stderr = w }
func (r *realCmd) SetEnv(env []string)   { r.cmd.Env = env }
func (r *realCmd) Run() error            { return r.cmd.Run() }