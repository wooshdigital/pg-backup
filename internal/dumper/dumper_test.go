package dumper

import (
	"bytes"
	"context"
	"errors"
	"io"
	"strings"
	"testing"
	"time"
)

// ---------------------------------------------------------------------------
// Unit tests with a mock exec runner
// ---------------------------------------------------------------------------

// mockCmd is a Cmd implementation that lets tests control stdout, stderr and
// the exit behaviour.
type mockCmd struct {
	stdoutData []byte
	stderrData []byte
	runErr     error

	stdout io.Writer
	stderr io.Writer
	env    []string
}

func (m *mockCmd) SetStdout(w io.Writer) { m.stdout = w }
func (m *mockCmd) SetStderr(w io.Writer) { m.stderr = w }
func (m *mockCmd) SetEnv(env []string)   { m.env = env }
func (m *mockCmd) Run() error {
	if m.stdout != nil && len(m.stdoutData) > 0 {
		_, _ = m.stdout.Write(m.stdoutData)
	}
	if m.stderr != nil && len(m.stderrData) > 0 {
		_, _ = m.stderr.Write(m.stderrData)
	}
	return m.runErr
}

func makeMockRunner(mc *mockCmd) ExecRunner {
	return func(_ context.Context, _ string, _ ...string) Cmd {
		return mc
	}
}

func TestPgDumper_Dump_Success(t *testing.T) {
	payload := []byte("PGDMP\x00mock dump data here")
	mc := &mockCmd{stdoutData: payload}

	d := NewPgDumper(withExecRunner(makeMockRunner(mc)))

	var buf bytes.Buffer
	result, err := d.Dump(context.Background(), "postgres://user:pass@localhost/db", &buf)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !bytes.Equal(buf.Bytes(), payload) {
		t.Errorf("output mismatch: got %q, want %q", buf.Bytes(), payload)
	}
	if result.BytesWritten != int64(len(payload)) {
		t.Errorf("BytesWritten: got %d, want %d", result.BytesWritten, len(payload))
	}
	if result.Duration < 0 {
		t.Errorf("Duration should be non-negative, got %v", result.Duration)
	}
	if result.StartedAt.IsZero() {
		t.Error("StartedAt should not be zero")
	}
}

func TestPgDumper_Dump_PgDumpError(t *testing.T) {
	mc := &mockCmd{
		stderrData: []byte("FATAL: database does not exist"),
		runErr:     errors.New("exit status 1"),
	}

	d := NewPgDumper(withExecRunner(makeMockRunner(mc)))

	var buf bytes.Buffer
	_, err := d.Dump(context.Background(), "postgres://user@localhost/missing", &buf)
	if err == nil {
		t.Fatal("expected error, got nil")
	}
	if !strings.Contains(err.Error(), "pg_dump failed") {
		t.Errorf("error should mention pg_dump failure, got: %v", err)
	}
	if !strings.Contains(err.Error(), "does not exist") {
		t.Errorf("error should contain stderr output, got: %v", err)
	}
}

func TestPgDumper_Dump_InvalidDSN(t *testing.T) {
	d := NewPgDumper()
	var buf bytes.Buffer
	_, err := d.Dump(context.Background(), "", &buf)
	if err == nil {
		t.Fatal("expected error for empty DSN, got nil")
	}
}

func TestPgDumper_Dump_PasswordInEnv(t *testing.T) {
	payload := []byte("dump data")
	var capturedEnv []string
	mc := &mockCmd{stdoutData: payload}
	runner := func(_ context.Context, _ string, _ ...string) Cmd {
		return &envCapturingCmd{mockCmd: mc, envDst: &capturedEnv}
	}

	d := NewPgDumper(withExecRunner(runner))
	var buf bytes.Buffer
	_, err := d.Dump(context.Background(), "postgres://alice:topsecret@localhost/db", &buf)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	found := false
	for _, e := range capturedEnv {
		if e == "PGPASSWORD=topsecret" {
			found = true
		}
		if strings.HasPrefix(e, "--password") {
			t.Error("password must not appear as a flag")
		}
	}
	if !found {
		t.Error("PGPASSWORD not found in command environment")
	}
}

func TestPgDumper_Dump_ContextCancellation(t *testing.T) {
	// Simulate a slow command by blocking on context in Run()
	blockingCmd := &contextAwareCmd{
		delay: 100 * time.Millisecond,
	}
	runner := func(ctx context.Context, _ string, _ ...string) Cmd {
		blockingCmd.ctx = ctx
		return blockingCmd
	}

	d := NewPgDumper(withExecRunner(runner))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Millisecond)
	defer cancel()

	var buf bytes.Buffer
	_, err := d.Dump(ctx, "postgres://user@localhost/db", &buf)
	if err == nil {
		t.Fatal("expected error due to context cancellation, got nil")
	}
}

func TestPgDumper_Dump_ExtraArgs(t *testing.T) {
	var capturedArgs []string
	mc := &mockCmd{stdoutData: []byte("data")}
	runner := func(_ context.Context, _ string, args ...string) Cmd {
		capturedArgs = args
		return mc
	}

	d := NewPgDumper(
		WithExtraArgs("--format=custom", "--compress=9"),
		withExecRunner(runner),
	)
	var buf bytes.Buffer
	_, err := d.Dump(context.Background(), "postgres://user@localhost/db", &buf)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	hasFormat := false
	hasCompress := false
	for _, a := range capturedArgs {
		if a == "--format=custom" {
			hasFormat = true
		}
		if a == "--compress=9" {
			hasCompress = true
		}
	}
	if !hasFormat {
		t.Error("expected --format=custom in args")
	}
	if !hasCompress {
		t.Error("expected --compress=9 in args")
	}
}

func TestPgDumper_CustomPgDumpPath(t *testing.T) {
	var capturedName string
	mc := &mockCmd{stdoutData: []byte("dump")}
	runner := func(_ context.Context, name string, _ ...string) Cmd {
		capturedName = name
		return mc
	}

	d := NewPgDumper(
		WithPgDumpPath("/usr/local/bin/pg_dump"),
		withExecRunner(runner),
	)
	var buf bytes.Buffer
	_, err := d.Dump(context.Background(), "postgres://user@localhost/db", &buf)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if capturedName != "/usr/local/bin/pg_dump" {
		t.Errorf("expected /usr/local/bin/pg_dump, got %q", capturedName)
	}
}

// ---------------------------------------------------------------------------
// Helper mock types
// ---------------------------------------------------------------------------

// envCapturingCmd wraps mockCmd and captures the environment.
type envCapturingCmd struct {
	*mockCmd
	envDst *[]string
}

func (e *envCapturingCmd) SetEnv(env []string) {
	*e.envDst = env
	e.mockCmd.SetEnv(env)
}

// contextAwareCmd simulates a long-running command that respects context
// cancellation.
type contextAwareCmd struct {
	ctx    context.Context
	delay  time.Duration
	stdout io.Writer
	stderr io.Writer
	env    []string
}

func (c *contextAwareCmd) SetStdout(w io.Writer) { c.stdout = w }
func (c *contextAwareCmd) SetStderr(w io.Writer) { c.stderr = w }
func (c *contextAwareCmd) SetEnv(env []string)   { c.env = env }
func (c *contextAwareCmd) Run() error {
	select {
	case <-time.After(c.delay):
		return nil
	case <-c.ctx.Done():
		return c.ctx.Err()
	}
}