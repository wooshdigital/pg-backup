package dumper_test

import (
	"bytes"
	"compress/gzip"
	"context"
	"io"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/your-org/your-project/internal/compress"
	"github.com/your-org/your-project/internal/dumper"
)

func fixedClock(t time.Time) func() time.Time {
	return func() time.Time { return t }
}

func TestDumper_RunWithReader_Gzip(t *testing.T) {
	dir := t.TempDir()
	original := []byte("-- pg_dump output\nSELECT 1;\n")

	c, err := compress.NewCompressor(compress.FormatGzip, gzip.DefaultCompression)
	if err != nil {
		t.Fatalf("NewCompressor: %v", err)
	}

	d := dumper.New("postgres://localhost/test", dir, c)
	d.Clock = fixedClock(time.Date(2026, 6, 19, 12, 0, 0, 0, time.UTC))

	result, err := d.RunWithReader(context.Background(), bytes.NewReader(original))
	if err != nil {
		t.Fatalf("RunWithReader: %v", err)
	}

	expectedName := "dump-20260619T120000Z.sql.gz"
	if filepath.Base(result.Path) != expectedName {
		t.Errorf("filename = %q, want %q", filepath.Base(result.Path), expectedName)
	}

	// Read back and decompress.
	f, err := os.Open(result.Path)
	if err != nil {
		t.Fatalf("open result: %v", err)
	}
	defer f.Close()

	gr, err := gzip.NewReader(f)
	if err != nil {
		t.Fatalf("gzip.NewReader: %v", err)
	}
	defer gr.Close()

	got, err := io.ReadAll(gr)
	if err != nil {
		t.Fatalf("read decompressed: %v", err)
	}

	if !bytes.Equal(original, got) {
		t.Errorf("content mismatch: got %q, want %q", got, original)
	}

	if result.Size == 0 {
		t.Error("expected non-zero compressed size")
	}
}

func TestDumper_RunWithReader_Zstd(t *testing.T) {
	dir := t.TempDir()
	original := []byte(strings.Repeat("INSERT INTO foo VALUES (1, 'bar');\n", 1000))

	c, err := compress.NewCompressor(compress.FormatZstd, 0)
	if err != nil {
		t.Fatalf("NewCompressor: %v", err)
	}

	d := dumper.New("postgres://localhost/test", dir, c)
	d.Clock = fixedClock(time.Date(2026, 6, 19, 12, 0, 0, 0, time.UTC))

	result, err := d.RunWithReader(context.Background(), bytes.NewReader(original))
	if err != nil {
		t.Fatalf("RunWithReader: %v", err)
	}

	if filepath.Base(result.Path) != "dump-20260619T120000Z.sql.zst" {
		t.Errorf("unexpected filename: %q", filepath.Base(result.Path))
	}

	if result.Size == 0 {
		t.Error("expected non-zero compressed size")
	}
}

func TestDumper_RunWithReader_None(t *testing.T) {
	dir := t.TempDir()
	original := []byte("SELECT 42;\n")

	c, err := compress.NewCompressor(compress.FormatNone, 0)
	if err != nil {
		t.Fatalf("NewCompressor: %v", err)
	}

	d := dumper.New("postgres://localhost/test", dir, c)
	d.Clock = fixedClock(time.Date(2026, 6, 19, 12, 0, 0, 0, time.UTC))

	result, err := d.RunWithReader(context.Background(), bytes.NewReader(original))
	if err != nil {
		t.Fatalf("RunWithReader: %v", err)
	}

	if filepath.Base(result.Path) != "dump-20260619T120000Z.sql" {
		t.Errorf("unexpected filename: %q", filepath.Base(result.Path))
	}

	got, err := os.ReadFile(result.Path)
	if err != nil {
		t.Fatalf("ReadFile: %v", err)
	}
	if !bytes.Equal(original, got) {
		t.Errorf("content mismatch: got %q, want %q", got, original)
	}
}

func TestDumper_RunWithReader_ContextCancelled(t *testing.T) {
	dir := t.TempDir()

	c, err := compress.NewCompressor(compress.FormatGzip, gzip.DefaultCompression)
	if err != nil {
		t.Fatalf("NewCompressor: %v", err)
	}

	d := dumper.New("postgres://localhost/test", dir, c)

	ctx, cancel := context.WithCancel(context.Background())
	cancel() // cancel immediately

	// Even with cancelled context, RunWithReader should complete since it
	// operates on an in-memory reader (context cancellation only affects pg_dump).
	_, err = d.RunWithReader(ctx, bytes.NewReader([]byte("SELECT 1;")))
	// We don't assert error here since RunWithReader doesn't check ctx for reader path.
	// This just ensures it doesn't panic.
	_ = err
}