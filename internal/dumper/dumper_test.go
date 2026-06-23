package dumper

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"strings"
	"testing"
)

// -------------------------------------------------------------------------
// Mock ExecRunner / Commander
// -------------------------------------------------------------------------

// mockRunner is an ExecRunner whose behaviour is defined per-test.
type mockRunner struct {
	// newCmd is called each time CommandContext is invoked.
	newCmd func(ctx context.Context, name string, args []string) Commander
}

func (m *mockRunner) CommandContext(ctx context.Context, name string, args ...string) Commander {
	return m.newCmd(ctx, name, args)
}

// mockCmd simulates a Commander.
type mockCmd struct {
	stdout io.Writer
	stderr io.Writer
	env    []string
	// runFn is called when Run() is invoked; it may write to stdout/stderr.
	runFn func(stdout, stderr io.Writer) error
}

func (c *mockCmd) SetStdout(w io.Writer) { c.stdout = w }
func (c *mockCmd) SetStderr(w io.Writer) { c.stderr = w }
func (c *mockCmd) SetEnv(env []string)   { c.env = env }
func (c *mockCmd) Run() error            { return c.runFn(c.stdout, c.stderr) }

// -------------------------------------------------------------------------
// Unit tests
// -------------------------------------------------------------------------

func TestPgDumper_Dump_Success(t *testing.T) {
	t.Parallel()

	const fakeOutput = "PGDMP fake dump content"

	runner := &mockRunner{
		newCmd: func(ctx context.Context, name string, args []string) Commander {
			return &mockCmd{
				runFn: func(stdout, _ io.Writer) error {
					_, err := fmt.Fprint(stdout, fakeOutput)
					return err
				},
			}
		},
	}

	d := NewPgDumper(withRunner(runner))

	var buf bytes.Buffer
	result, err := d.Dump(
		context.Background(),
		"postgres://alice:secret@localhost/testdb",
		&buf,
	)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if buf.String() != fakeOutput {
		t.Errorf("output mismatch: got %q want %q", buf.String(), fakeOutput)
	}
	if result.BytesWritten != int64(len(fakeOutput)) {
		t.Errorf("BytesWritten = %d, want %d", result.BytesWritten, len(fakeOutput))
	}
	if result.Duration <= 0 {
		t.Errorf("Duration should be > 0, got %v", result.Duration)
	}
}

func TestPgDumper_Dump_CommandFailure(t *testing.T) {
	t.Parallel()

	const stderrMsg = "pg_dump: connection refused"

	runner := &mockRunner{
		newCmd: func(ctx context.Context, name string, args []string) Commander {
			return &mockCmd{
				runFn: func(_, stderr io.Writer) error {
					fmt.Fprint(stderr, stderrMsg)
					return fmt.Errorf("exit status 1")
				},
			}
		},
	}

	d := NewPgDumper(withRunner(runner))

	var buf bytes.Buffer
	_, err := d.Dump(
		context.Background(),
		"postgres://u:p@localhost/db",
		&buf,
	)
	if err == nil {
		t.Fatal("expected error, got nil")
	}
	if !strings.Contains(err.Error(), stderrMsg) {
		t.Errorf("error should contain stderr output %q, got: %v", stderrMsg, err)
	}
}

func TestPgDumper_Dump_CommandFailure_NoStderr(t *testing.T) {
	t.Parallel()

	runner := &mockRunner{
		newCmd: func(ctx context.Context, name string, args []string) Commander {
			return &mockCmd{
				runFn: func(_, _ io.Writer) error {
					return fmt.Errorf("exit status 2")
				},
			}
		},
	}

	d := NewPgDumper(withRunner(runner))
	var buf bytes.Buffer
	_, err := d.Dump(context.Background(), "postgres://u:p@localhost/db", &buf)
	if err == nil {
		t.Fatal("expected error, got nil")
	}
}

func TestPgDumper_Dump_BadDSN(t *testing.T) {
	t.Parallel()

	d := NewPgDumper()
	_, err := d.Dump(context.Background(), "", new(bytes.Buffer))
	if err == nil {
		t.Fatal("expected error for empty DSN")
	}
}

func TestPgDumper_Dump_PasswordNotInArgs(t *testing.T) {
	t.Parallel()

	const password = "super-secret-password"
	var capturedArgs []string
	var capturedEnv []string

	runner := &mockRunner{
		newCmd: func(ctx context.Context, name string, args []string) Commander {
			capturedArgs = args
			return &mockCmd{
				runFn: func(stdout, _ io.Writer) error {
					// capture env via SetEnv callback
					return nil
				},
				// env is set via SetEnv; we capture it in the Commander.
			}
		},
	}

	// Custom commander to capture env
	type envCapture struct {
		mockCmd
		envRef *[]string
	}
	runner2 := &mockRunner{
		newCmd: func(ctx context.Context, name string, args []string) Commander {
			capturedArgs = args
			cmd := &struct {
				mockCmd
			}{
				mockCmd: mockCmd{
					runFn: func(_, _ io.Writer) error { return nil },
				},
			}
			_ = cmd
			// We'll use a different approach: override SetEnv
			return &envCaptureCmd{
				runFn:  func(_, _ io.Writer) error { return nil },
				envRef: &capturedEnv,
			}
		},
	}

	d := NewPgDumper(withRunner(runner2))
	dsn := fmt.Sprintf("postgres://user:%s@localhost/db", password)
	_, err := d.Dump(context.Background(), dsn, new(bytes.Buffer))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// Password must not appear in args.
	for _, a := range capturedArgs {
		if strings.Contains(a, password) {
			t.Errorf("password found in args: %v", capturedArgs)
		}
	}

	// Password MUST appear in PGPASSWORD env var.
	found := false
	for _, e := range capturedEnv {
		if e == "PGPASSWORD="+password {
			found = true
			break
		}
	}
	if !found {
		t.Errorf("PGPASSWORD not set in env; got: %v", capturedEnv)
	}
}

// envCaptureCmd is a Commander that captures the env set via SetEnv.
type envCaptureCmd struct {
	stdout io.Writer
	stderr io.Writer
	envRef *[]string
	runFn  func(stdout, stderr io.Writer) error
}

func (c *envCaptureCmd) SetStdout(w io.Writer) { c.stdout = w }
func (c *envCaptureCmd) SetStderr(w io.Writer) { c.stderr = w }
func (c *envCaptureCmd) SetEnv(env []string)   { *c.envRef = env }
func (c *envCaptureCmd) Run() error            { return c.runFn(c.stdout, c.stderr) }

func TestPgDumper_Dump_ContextCancellation(t *testing.T) {
	t.Parallel()

	ctx, cancel := context.WithCancel(context.Background())
	cancel() // cancel immediately

	runner := &mockRunner{
		newCmd: func(ctx context.Context, name string, args []string) Commander {
			return &mockCmd{
				runFn: func(_, _ io.Writer) error {
					// Check if context is done
					select {
					case <-ctx.Done():
						return ctx.Err()
					default:
						return nil
					}
				},
			}
		},
	}

	d := NewPgDumper(withRunner(runner))
	_, err := d.Dump(ctx, "postgres://u:p@localhost/db", new(bytes.Buffer))
	// With a pre-cancelled context the mock returns ctx.Err() which is non-nil.
	if err == nil {
		t.Fatal("expected error due to cancelled context")
	}
}

func TestPgDumper_ExtraArgs(t *testing.T) {
	t.Parallel()

	var capturedArgs []string

	runner := &mockRunner{
		newCmd: func(ctx context.Context, name string, args []string) Commander {
			capturedArgs = args
			return &mockCmd{
				runFn: func(_, _ io.Writer) error { return nil },
			}
		},
	}

	d := NewPgDumper(
		withRunner(runner),
		WithExtraArgs("--format=custom", "--compress=6"),
	)

	_, err := d.Dump(context.Background(), "postgres://u:p@localhost/db", new(bytes.Buffer))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if !containsString(strings.Join(capturedArgs, " "), "--format=custom") {
		t.Errorf("expected --format=custom in args %v", capturedArgs)
	}
	if !containsString(strings.Join(capturedArgs, " "), "--compress=6") {
		t.Errorf("expected --compress=6 in args %v", capturedArgs)
	}
}

func TestPgDumper_CustomBinaryPath(t *testing.T) {
	t.Parallel()

	var capturedName string

	runner := &mockRunner{
		newCmd: func(ctx context.Context, name string, args []string) Commander {
			capturedName = name
			return &mockCmd{
				runFn: func(_, _ io.Writer) error { return nil },
			}
		},
	}

	d := NewPgDumper(
		withRunner(runner),
		WithPgDumpPath("/usr/lib/postgresql/15/bin/pg_dump"),
	)

	_, err := d.Dump(context.Background(), "postgres://u:p@localhost/db", new(bytes.Buffer))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if capturedName != "/usr/lib/postgresql/15/bin/pg_dump" {
		t.Errorf("expected custom binary path, got %q", capturedName)
	}
}