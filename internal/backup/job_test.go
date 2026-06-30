package backup_test

import (
	"bytes"
	"context"
	"errors"
	"io"
	"strings"
	"testing"

	"github.com/ssoready/conf/internal/backup"
	"github.com/ssoready/conf/internal/compress"
)

// -------------------------------------------------------------------
// Minimal fakes
// -------------------------------------------------------------------

// fakeDumper writes a fixed payload to the writer.
type fakeDumper struct {
	payload string
	err     error
}

func (f *fakeDumper) Dump(_ context.Context, w io.Writer) error {
	if f.err != nil {
		return f.err
	}
	_, err := io.WriteString(w, f.payload)
	return err
}

// fakeBackend stores the last Put call in memory.
type fakeBackend struct {
	lastKey     string
	lastContent []byte
	err         error
}

func (f *fakeBackend) Put(_ context.Context, r io.Reader) (string, error) {
	if f.err != nil {
		return "", f.err
	}
	data, err := io.ReadAll(r)
	if err != nil {
		return "", err
	}
	f.lastContent = data
	f.lastKey = "backups/2026-06-30T000000Z.sql.gz"
	return f.lastKey, nil
}

// noopCompressor passes bytes through unchanged so we can inspect them.
type noopCompressor struct{}

func (noopCompressor) Compress(r io.Reader, w io.Writer) error {
	_, err := io.Copy(w, r)
	return err
}

func (noopCompressor) Extension() string { return ".noop" }

// -------------------------------------------------------------------
// Unit tests – buffered mode
// -------------------------------------------------------------------

func TestJob_Run_Buffered_Success(t *testing.T) {
	const payload = "SELECT 1;"
	d := &fakeDumper{payload: payload}
	b := &fakeBackend{}
	c := noopCompressor{}

	job := &backup.Job{
		Dumper:     d,
		Compressor: c,
		Storage:    b,
	}

	res := job.Run(context.Background())
	if res.Err != nil {
		t.Fatalf("unexpected error: %v", res.Err)
	}
	if res.Key == "" {
		t.Error("expected non-empty key")
	}
	if string(b.lastContent) != payload {
		t.Errorf("got %q, want %q", string(b.lastContent), payload)
	}
	if res.Size <= 0 {
		t.Errorf("expected positive size, got %d", res.Size)
	}
	if res.Duration <= 0 {
		t.Errorf("expected positive duration, got %v", res.Duration)
	}
}

func TestJob_Run_Buffered_DumperError(t *testing.T) {
	d := &fakeDumper{err: errors.New("pg_dump: connection refused")}
	b := &fakeBackend{}
	c := noopCompressor{}

	job := &backup.Job{
		Dumper:     d,
		Compressor: c,
		Storage:    b,
	}

	res := job.Run(context.Background())
	if res.Err == nil {
		t.Fatal("expected error but got nil")
	}
	if !strings.Contains(res.Err.Error(), "pg_dump") {
		t.Errorf("error should mention pg_dump, got: %v", res.Err)
	}
}

func TestJob_Run_Buffered_StorageError(t *testing.T) {
	d := &fakeDumper{payload: "SELECT 1;"}
	b := &fakeBackend{err: errors.New("s3: access denied")}
	c := noopCompressor{}

	job := &backup.Job{
		Dumper:     d,
		Compressor: c,
		Storage:    b,
	}

	res := job.Run(context.Background())
	if res.Err == nil {
		t.Fatal("expected error but got nil")
	}
}

// -------------------------------------------------------------------
// Unit tests – streamed mode
// -------------------------------------------------------------------

func TestJob_Run_Streamed_Success(t *testing.T) {
	const payload = "SELECT 2;"
	d := &fakeDumper{payload: payload}
	b := &fakeBackend{}
	c := noopCompressor{}

	job := &backup.Job{
		Dumper:       d,
		Compressor:   c,
		Storage:      b,
		StreamDirect: true,
	}

	res := job.Run(context.Background())
	if res.Err != nil {
		t.Fatalf("unexpected error: %v", res.Err)
	}
	if string(b.lastContent) != payload {
		t.Errorf("got %q, want %q", string(b.lastContent), payload)
	}
}

func TestJob_Run_Streamed_DumperError(t *testing.T) {
	d := &fakeDumper{err: errors.New("dump error")}
	b := &fakeBackend{}
	c := noopCompressor{}

	job := &backup.Job{
		Dumper:       d,
		Compressor:   c,
		Storage:      b,
		StreamDirect: true,
	}

	res := job.Run(context.Background())
	if res.Err == nil {
		t.Fatal("expected error")
	}
}

// -------------------------------------------------------------------
// Unit test – gzip compressor integration with fake dumper/backend
// -------------------------------------------------------------------

func TestJob_Run_Buffered_WithGzip(t *testing.T) {
	const payload = "-- SQL payload for gzip test\nSELECT version();\n"
	d := &fakeDumper{payload: payload}
	b := &fakeBackend{}

	c, err := compress.NewFactory().Create("gzip")
	if err != nil {
		t.Skipf("gzip compressor unavailable: %v", err)
	}

	job := &backup.Job{
		Dumper:     d,
		Compressor: c,
		Storage:    b,
	}

	res := job.Run(context.Background())
	if res.Err != nil {
		t.Fatalf("unexpected error: %v", res.Err)
	}
	// Gzip magic number: 0x1f 0x8b
	if len(b.lastContent) < 2 || b.lastContent[0] != 0x1f || b.lastContent[1] != 0x8b {
		t.Errorf("output does not look like gzip; first bytes: %x", b.lastContent[:min(4, len(b.lastContent))])
	}
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// -------------------------------------------------------------------
// Pipeline unit test
// -------------------------------------------------------------------

func TestRunPipeline(t *testing.T) {
	const payload = "pipeline payload"
	d := &fakeDumper{payload: payload}
	b := &fakeBackend{}
	c := noopCompressor{}

	key, size, err := backup.RunPipeline(context.Background(), d, c, b)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if key == "" {
		t.Error("expected non-empty key")
	}
	if int(size) != len(payload) {
		t.Errorf("size = %d, want %d", size, len(payload))
	}
	if string(b.lastContent) != payload {
		t.Errorf("content = %q, want %q", string(b.lastContent), payload)
	}
}

// Ensure unused import of bytes doesn't break compilation.
var _ = bytes.NewBuffer