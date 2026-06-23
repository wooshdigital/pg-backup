//go:build integration
// +build integration

package dumper

import (
	"bytes"
	"context"
	"strings"
	"testing"
	"time"
)

// pg_dump plain-text output starts with this header comment.
const pgDumpPlainHeader = "PostgreSQL database dump"

// pg_dump custom format archives start with the magic bytes "PGDMP".
const pgDumpCustomMagic = "PGDMP"

func TestIntegration_PgDumper_PlainFormat(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
	defer cancel()

	pg := startPostgres(ctx, t)

	dumper := &PgDumper{
		PgDumpPath: "pg_dump",
		ExtraArgs:  []string{"--format=plain"},
		Runner:     DefaultExecRunner,
	}

	var buf bytes.Buffer
	result, err := dumper.Dump(ctx, pg.DSN, &buf)
	if err != nil {
		t.Fatalf("Dump failed: %v", err)
	}

	output := buf.String()
	if !strings.Contains(output, pgDumpPlainHeader) {
		t.Errorf("dump output does not contain expected header %q; got first 256 bytes: %q",
			pgDumpPlainHeader, truncate(output, 256))
	}

	if result.BytesWritten <= 0 {
		t.Errorf("expected BytesWritten > 0, got %d", result.BytesWritten)
	}
	if result.Duration <= 0 {
		t.Errorf("expected positive Duration, got %v", result.Duration)
	}
	if result.StartedAt.IsZero() {
		t.Error("StartedAt must not be zero")
	}

	t.Logf("dump: %d bytes in %v", result.BytesWritten, result.Duration)
}

func TestIntegration_PgDumper_CustomFormat(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
	defer cancel()

	pg := startPostgres(ctx, t)

	dumper := &PgDumper{
		PgDumpPath: "pg_dump",
		ExtraArgs:  []string{"--format=custom"},
		Runner:     DefaultExecRunner,
	}

	var buf bytes.Buffer
	result, err := dumper.Dump(ctx, pg.DSN, &buf)
	if err != nil {
		t.Fatalf("Dump failed: %v", err)
	}

	// Custom format archives begin with the 5-byte magic "PGDMP".
	if buf.Len() < 5 {
		t.Fatalf("dump output too short (%d bytes) to contain magic header", buf.Len())
	}
	magic := buf.String()[:5]
	if magic != pgDumpCustomMagic {
		t.Errorf("expected custom-format magic %q, got %q", pgDumpCustomMagic, magic)
	}

	if result.BytesWritten <= 0 {
		t.Errorf("expected BytesWritten > 0, got %d", result.BytesWritten)
	}

	t.Logf("custom dump: %d bytes in %v", result.BytesWritten, result.Duration)
}

func TestIntegration_PgDumper_ContextCancellation(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
	defer cancel()

	pg := startPostgres(ctx, t)

	// Cancel immediately after starting.
	dumpCtx, dumpCancel := context.WithCancel(ctx)
	dumpCancel()

	dumper := &PgDumper{
		PgDumpPath: "pg_dump",
		Runner:     DefaultExecRunner,
	}

	var buf bytes.Buffer
	_, err := dumper.Dump(dumpCtx, pg.DSN, &buf)
	if err == nil {
		t.Fatal("expected error due to cancelled context, got nil")
	}
	t.Logf("correctly got error on cancelled context: %v", err)
}

// truncate returns s truncated to at most n bytes.
func truncate(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return s[:n]
}