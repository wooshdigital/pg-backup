//go:build integration

package dumper

import (
	"bytes"
	"context"
	"strings"
	"testing"

	"github.com/yourorg/pgdumper/internal/tempfile"
)

// pg_dump plain-text output begins with a header comment.
// pg_dump custom format starts with the magic bytes "PGDMP".
const pgDumpPlainHeader = "-- PostgreSQL database dump"
const pgDumpCustomMagic = "PGDMP"

// TestIntegration_Dump_PlainFormat verifies that PgDumper can stream a plain
// SQL dump from a live Postgres instance.
func TestIntegration_Dump_PlainFormat(t *testing.T) {
	ctx := context.Background()
	pg := startPostgres(ctx, t)

	d := NewPgDumper(
		WithExtraArgs("--format=plain", "--no-owner", "--no-acl"),
	)

	var buf bytes.Buffer
	result, err := d.Dump(ctx, pg.dsn, &buf)
	if err != nil {
		t.Fatalf("Dump failed: %v", err)
	}

	output := buf.String()
	if !strings.Contains(output, pgDumpPlainHeader) {
		t.Errorf("expected pg_dump plain header %q in output, got first 200 bytes: %q",
			pgDumpPlainHeader, truncate(output, 200))
	}

	if result.BytesWritten <= 0 {
		t.Errorf("expected BytesWritten > 0, got %d", result.BytesWritten)
	}
	if result.BytesWritten != int64(buf.Len()) {
		t.Errorf("BytesWritten mismatch: result=%d buf.Len=%d", result.BytesWritten, buf.Len())
	}
	if result.StartedAt.IsZero() {
		t.Error("StartedAt should not be zero")
	}
	if result.Duration <= 0 {
		t.Error("Duration should be positive")
	}

	t.Logf("Dump completed: %d bytes in %v", result.BytesWritten, result.Duration)
}

// TestIntegration_Dump_CustomFormat verifies that the custom format archive
// header magic bytes are present when --format=custom is used.
func TestIntegration_Dump_CustomFormat(t *testing.T) {
	ctx := context.Background()
	pg := startPostgres(ctx, t)

	d := NewPgDumper(
		WithExtraArgs("--format=custom", "--no-owner", "--no-acl"),
	)

	var buf bytes.Buffer
	result, err := d.Dump(ctx, pg.dsn, &buf)
	if err != nil {
		t.Fatalf("Dump failed: %v", err)
	}

	// Custom format starts with magic bytes "PGDMP"
	got := buf.Bytes()
	if len(got) < len(pgDumpCustomMagic) {
		t.Fatalf("output too short (%d bytes) to contain magic header", len(got))
	}
	if string(got[:len(pgDumpCustomMagic)]) != pgDumpCustomMagic {
		t.Errorf("expected magic bytes %q, got %q", pgDumpCustomMagic, got[:len(pgDumpCustomMagic)])
	}

	t.Logf("Custom dump: %d bytes in %v", result.BytesWritten, result.Duration)
}

// TestIntegration_Dump_ToTempFile verifies that streaming to a temp file works
// and the file can be read back with the expected content.
func TestIntegration_Dump_ToTempFile(t *testing.T) {
	ctx := context.Background()
	pg := startPostgres(ctx, t)

	tf, err := tempfile.New("pgdump-*.sql")
	if err != nil {
		t.Fatalf("failed to create temp file: %v", err)
	}
	defer tf.CleanupWithLog(func(msg string) { t.Log(msg) })

	d := NewPgDumper(
		WithExtraArgs("--format=plain", "--no-owner", "--no-acl"),
	)

	result, err := d.Dump(ctx, pg.dsn, tf.File())
	if err != nil {
		t.Fatalf("Dump to temp file failed: %v", err)
	}

	// Sync and read back.
	if err := tf.File().Sync(); err != nil {
		t.Fatalf("sync failed: %v", err)
	}

	content, err := tf.ReadAll()
	if err != nil {
		t.Fatalf("reading temp file: %v", err)
	}

	if !bytes.Contains(content, []byte(pgDumpPlainHeader)) {
		t.Errorf("expected header in file content; first 200 bytes: %q", truncate(string(content), 200))
	}

	t.Logf("Temp file dump: %d bytes written, file size %d bytes, duration %v",
		result.BytesWritten, len(content), result.Duration)
}

// TestIntegration_Dump_ContextCancellation verifies that cancelling the context
// aborts the dump and returns an error.
func TestIntegration_Dump_ContextCancellation(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	// Cancel immediately.
	cancel()

	pg := startPostgres(context.Background(), t)

	d := NewPgDumper(
		WithExtraArgs("--format=plain"),
	)

	var buf bytes.Buffer
	_, err := d.Dump(ctx, pg.dsn, &buf)
	if err == nil {
		t.Fatal("expected error due to cancelled context, got nil")
	}
	t.Logf("Got expected error: %v", err)
}

// TestIntegration_Dump_InvalidDSN verifies graceful failure for a bad DSN.
func TestIntegration_Dump_InvalidDSN(t *testing.T) {
	d := NewPgDumper()
	var buf bytes.Buffer
	_, err := d.Dump(context.Background(), "", &buf)
	if err == nil {
		t.Fatal("expected error for empty DSN")
	}
}

func truncate(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return s[:n]
}