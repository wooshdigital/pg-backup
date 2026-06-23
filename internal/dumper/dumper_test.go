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

// --------------------------------------------------------------------------
// Unit tests with a mock ExecRunner
// --------------------------------------------------------------------------

func TestPgDumper_Dump_Success(t *testing.T) {
	const fakeOutput = "PGDMP fake dump data"

	dumper := &PgDumper{
		PgDumpPath: "pg_dump",
		Runner: func(_ context.Context, name string, args []string, env []string, stdout io.Writer, _ io.Writer) error {
			// Verify the binary name is correct.
			if name != "pg_dump" {
				t.Errorf("unexpected binary: %q", name)
			}
			// Write fake dump output.
			_, err := io.WriteString(stdout, fakeOutput)
			return err
		},
	}

	var buf bytes.Buffer
	result, err := dumper.Dump(context.Background(), "postgres://user:pass@localhost/mydb", &buf)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if buf.String() != fakeOutput {
		t.Errorf("output mismatch: got %q, want %q", buf.String(), fakeOutput)
	}
	if result.BytesWritten != int64(len(fakeOutput)) {
		t.Errorf("BytesWritten: got %d, want %d", result.BytesWritten, len(fakeOutput))
	}
	if result.Duration < 0 {
		t.Errorf("Duration should be non-negative, got %v", result.Duration)
	}
	if result.StartedAt.IsZero() {
		t.Error("StartedAt should not be zero")
	}
}

func TestPgDumper_Dump_PgDumpFailure(t *testing.T) {
	fakeErr := errors.New("exit status 1")
	const fakeStderr = "pg_dump: error: connection failed"

	dumper := &PgDumper{
		Runner: func(_ context.Context, _ string, _ []string, _ []string, _ io.Writer, stderr io.Writer) error {
			_, _ = io.WriteString(stderr, fakeStderr)
			return fakeErr
		},
	}

	var buf bytes.Buffer
	_, err := dumper.Dump(context.Background(), "postgres://localhost/mydb", &buf)
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	var dumpErr *DumpError
	if !errors.As(err, &dumpErr) {
		t.Fatalf("expected *DumpError, got %T: %v", err, err)
	}
	if !errors.Is(dumpErr.Cause, fakeErr) {
		t.Errorf("Cause mismatch: got %v, want %v", dumpErr.Cause, fakeErr)
	}
	if dumpErr.Stderr != fakeStderr {
		t.Errorf("Stderr mismatch: got %q, want %q", dumpErr.Stderr, fakeStderr)
	}
	if !strings.Contains(dumpErr.Error(), fakeStderr) {
		t.Errorf("Error() should contain stderr, got: %q", dumpErr.Error())
	}
}

func TestPgDumper_Dump_ContextCancelled(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	cancel() // cancel immediately

	dumper := &PgDumper{
		Runner: func(ctx context.Context, _ string, _ []string, _ []string, _ io.Writer, _ io.Writer) error {
			// Simulate pg_dump respecting context cancellation.
			select {
			case <-ctx.Done():
				return ctx.Err()
			case <-time.After(5 * time.Second):
				return nil
			}
		},
	}

	var buf bytes.Buffer
	_, err := dumper.Dump(ctx, "postgres://localhost/mydb", &buf)
	if err == nil {
		t.Fatal("expected error for cancelled context, got nil")
	}

	var dumpErr *DumpError
	if !errors.As(err, &dumpErr) {
		t.Fatalf("expected *DumpError, got %T", err)
	}
	if !errors.Is(dumpErr.Cause, context.Canceled) {
		t.Errorf("expected context.Canceled cause, got %v", dumpErr.Cause)
	}
}

func TestPgDumper_Dump_NilContext(t *testing.T) {
	dumper := NewPgDumper()
	//nolint:staticcheck // intentionally passing nil ctx to test guard
	_, err := dumper.Dump(nil, "postgres://localhost/db", &bytes.Buffer{})
	if err == nil {
		t.Fatal("expected error for nil context")
	}
}

func TestPgDumper_Dump_NilWriter(t *testing.T) {
	dumper := NewPgDumper()
	_, err := dumper.Dump(context.Background(), "postgres://localhost/db", nil)
	if err == nil {
		t.Fatal("expected error for nil writer")
	}
}

func TestPgDumper_Dump_InvalidDSN(t *testing.T) {
	dumper := NewPgDumper()
	_, err := dumper.Dump(context.Background(), "", &bytes.Buffer{})
	if err == nil {
		t.Fatal("expected error for empty DSN")
	}
}

func TestPgDumper_Dump_ExtraArgs(t *testing.T) {
	dumper := &PgDumper{
		ExtraArgs: []string{"--format=custom", "--compress=9"},
		Runner: func(_ context.Context, _ string, args []string, _ []string, stdout io.Writer, _ io.Writer) error {
			// Verify extra args are present.
			found := 0
			for _, a := range args {
				if a == "--format=custom" || a == "--compress=9" {
					found++
				}
			}
			if found != 2 {
				t.Errorf("extra args not passed through; got args: %v", args)
			}
			_, err := io.WriteString(stdout, "data")
			return err
		},
	}

	var buf bytes.Buffer
	_, err := dumper.Dump(context.Background(), "postgres://localhost/mydb", &buf)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestPgDumper_Dump_PasswordInEnv(t *testing.T) {
	dumper := &PgDumper{
		Runner: func(_ context.Context, _ string, _ []string, env []string, stdout io.Writer, _ io.Writer) error {
			found := false
			for _, e := range env {
				if e == "PGPASSWORD=mysecret" {
					found = true
				}
			}
			if !found {
				t.Errorf("PGPASSWORD not in env: %v", env)
			}
			_, err := io.WriteString(stdout, "data")
			return err
		},
	}

	var buf bytes.Buffer
	_, err := dumper.Dump(context.Background(), "postgres://user:mysecret@localhost/db", &buf)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestDumpError_Unwrap(t *testing.T) {
	cause := errors.New("root cause")
	de := &DumpError{Cause: cause}
	if !errors.Is(de, cause) {
		t.Error("errors.Is should find the cause via Unwrap")
	}
}

func TestCountingWriter(t *testing.T) {
	var buf bytes.Buffer
	cw := &countingWriter{w: &buf}

	n, err := cw.Write([]byte("hello"))
	if err != nil {
		t.Fatal(err)
	}
	if n != 5 {
		t.Errorf("Write returned %d, want 5", n)
	}
	if cw.n != 5 {
		t.Errorf("counter = %d, want 5", cw.n)
	}

	_, _ = cw.Write([]byte(" world"))
	if cw.n != 11 {
		t.Errorf("counter = %d, want 11", cw.n)
	}
	if buf.String() != "hello world" {
		t.Errorf("underlying writer got %q", buf.String())
	}
}