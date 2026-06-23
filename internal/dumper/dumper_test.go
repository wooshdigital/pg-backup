package dumper

import (
	"bytes"
	"context"
	"fmt"
	"os"
	"os/exec"
	"strings"
	"testing"
	"time"
)

// --------------------------------------------------------------------------
// Unit tests using a mock exec runner
// --------------------------------------------------------------------------

// fakeCommand creates an exec.Cmd that runs the current test binary with
// a special flag, which causes it to behave as a mock pg_dump.
//
// This is the standard Go technique for testing code that shells out.
func fakeCommand(output string, exitCode int) ExecRunner {
	return func(ctx context.Context, name string, args ...string) *exec.Cmd {
		cs := []string{"-test.run=TestFakeProcess", "--", name}
		cs = append(cs, args...)
		cmd := exec.CommandContext(ctx, os.Args[0], cs...)
		cmd.Env = append(os.Environ(),
			"FAKE_PROCESS=1",
			fmt.Sprintf("FAKE_OUTPUT=%s", output),
			fmt.Sprintf("FAKE_EXIT=%d", exitCode),
		)
		return cmd
	}
}

// TestFakeProcess is not a real test; it's used by fakeCommand to simulate
// an external process. It prints FAKE_OUTPUT to stdout and exits with FAKE_EXIT.
func TestFakeProcess(t *testing.T) {
	if os.Getenv("FAKE_PROCESS") != "1" {
		return
	}
	output := os.Getenv("FAKE_OUTPUT")
	exitCode := 0
	fmt.Sscanf(os.Getenv("FAKE_EXIT"), "%d", &exitCode)

	fmt.Fprint(os.Stdout, output)
	os.Exit(exitCode)
}

func TestPgDumper_Dump_Success(t *testing.T) {
	const fakeOutput = "PGDMP\x00\x00\x00\x00\x00\x00\x00this is a fake dump"

	dumper := NewPgDumper(
		withExecRunner(fakeCommand(fakeOutput, 0)),
	)

	var buf bytes.Buffer
	result, err := dumper.Dump(context.Background(), "postgres://user:pass@localhost/testdb", &buf)
	if err != nil {
		t.Fatalf("Dump() unexpected error: %v", err)
	}

	if buf.String() != fakeOutput {
		t.Errorf("Dump() output = %q, want %q", buf.String(), fakeOutput)
	}
	if result.BytesWritten != int64(len(fakeOutput)) {
		t.Errorf("BytesWritten = %d, want %d", result.BytesWritten, len(fakeOutput))
	}
	if result.DatabaseName != "testdb" {
		t.Errorf("DatabaseName = %q, want %q", result.DatabaseName, "testdb")
	}
	if result.Duration <= 0 {
		t.Error("Duration should be positive")
	}
	if result.StartTime.IsZero() {
		t.Error("StartTime should not be zero")
	}
}

func TestPgDumper_Dump_Failure(t *testing.T) {
	dumper := NewPgDumper(
		withExecRunner(fakeCommand("", 1)),
	)

	var buf bytes.Buffer
	_, err := dumper.Dump(context.Background(), "postgres://user:pass@localhost/testdb", &buf)
	if err == nil {
		t.Fatal("Dump() expected error, got nil")
	}
	if !strings.Contains(err.Error(), "pg_dump failed") {
		t.Errorf("Dump() error = %q, want it to mention 'pg_dump failed'", err.Error())
	}
}

func TestPgDumper_Dump_ContextCancellation(t *testing.T) {
	// Use a runner that sleeps for a while (simulate long dump)
	sleepRunner := func(ctx context.Context, name string, args ...string) *exec.Cmd {
		return exec.CommandContext(ctx, "sleep", "30")
	}

	dumper := NewPgDumper(withExecRunner(sleepRunner))

	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Millisecond)
	defer cancel()

	var buf bytes.Buffer
	_, err := dumper.Dump(ctx, "postgres://user:pass@localhost/testdb", &buf)
	if err == nil {
		t.Fatal("Dump() expected error from context cancellation, got nil")
	}
}

func TestPgDumper_Dump_InvalidDSN(t *testing.T) {
	dumper := NewPgDumper()

	var buf bytes.Buffer
	_, err := dumper.Dump(context.Background(), "", &buf)
	if err == nil {
		t.Fatal("Dump() expected error for empty DSN, got nil")
	}
	if !strings.Contains(err.Error(), "parse DSN") {
		t.Errorf("expected DSN parse error, got: %v", err)
	}
}

func TestPgDumper_Dump_KeyValueDSN(t *testing.T) {
	const fakeOutput = "PGDMP fake"

	dumper := NewPgDumper(
		withExecRunner(fakeCommand(fakeOutput, 0)),
	)

	var buf bytes.Buffer
	result, err := dumper.Dump(
		context.Background(),
		"host=localhost port=5432 user=alice password=secret dbname=mydb",
		&buf,
	)
	if err != nil {
		t.Fatalf("Dump() unexpected error: %v", err)
	}
	if result.DatabaseName != "mydb" {
		t.Errorf("DatabaseName = %q, want %q", result.DatabaseName, "mydb")
	}
}

func TestPgDumper_Dump_ExtraArgs(t *testing.T) {
	var capturedArgs []string

	captureRunner := func(ctx context.Context, name string, args ...string) *exec.Cmd {
		capturedArgs = args
		// Return a command that immediately succeeds with empty output
		return exec.CommandContext(ctx, "true")
	}

	dumper := NewPgDumper(
		withExecRunner(captureRunner),
		WithExtraArgs("--format=c", "--compress=6"),
	)

	var buf bytes.Buffer
	_, _ = dumper.Dump(context.Background(), "postgres://user@localhost/db", &buf)

	found := false
	for _, a := range capturedArgs {
		if a == "--format=c" {
			found = true
			break
		}
	}
	if !found {
		t.Errorf("ExtraArgs not forwarded to pg_dump; got args: %v", capturedArgs)
	}
}

// --------------------------------------------------------------------------
// Integration test using testcontainers-go
// --------------------------------------------------------------------------

// TestIntegration_PgDump_RealPostgres starts a real Postgres container and
// runs an actual pg_dump against it, verifying the output starts with the
// pg_dump plain-text or custom-format header.
//
// This test is skipped if Docker is not available or if INTEGRATION_TESTS is
// not set to "1".
func TestIntegration_PgDump_RealPostgres(t *testing.T) {
	if os.Getenv("INTEGRATION_TESTS") != "1" {
		t.Skip("skipping integration test; set INTEGRATION_TESTS=1 to enable")
	}

	// Check pg_dump is available
	if _, err := exec.LookPath("pg_dump"); err != nil {
		t.Skip("pg_dump not found in PATH; skipping integration test")
	}

	ctx := context.Background()

	// Import testcontainers lazily via a helper to avoid import cycle
	// and keep the test compilable when testcontainers is not available.
	dsn, cleanup, err := startPostgresContainer(ctx)
	if err != nil {
		t.Fatalf("failed to start postgres container: %v", err)
	}
	defer cleanup()

	dumper := NewPgDumper()

	var buf bytes.Buffer
	result, err := dumper.Dump(ctx, dsn, &buf)
	if err != nil {
		t.Fatalf("Dump() error: %v", err)
	}

	t.Logf("Dump result: bytes=%d, duration=%s, db=%s",
		result.BytesWritten, result.Duration, result.DatabaseName)

	// pg_dump plain-text format starts with "--\n-- PostgreSQL database dump\n"
	output := buf.String()
	if !strings.Contains(output, "PostgreSQL database dump") {
		// Also accept custom format magic bytes: PGDMP
		if !bytes.HasPrefix(buf.Bytes(), []byte("PGDMP")) {
			t.Errorf("dump output does not look like a valid pg_dump archive.\nFirst 256 bytes: %q",
				truncate(output, 256))
		}
	}

	if result.BytesWritten == 0 {
		t.Error("BytesWritten should be > 0")
	}
}

func truncate(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return s[:n]
}