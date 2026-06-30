package backup_test

import (
	"bytes"
	"context"
	"errors"
	"io"
	"strings"
	"testing"

	"github.com/sdreger/cmd-worker/internal/backup"
	"github.com/sdreger/cmd-worker/internal/compress"
)

// ---- mock implementations ----

type mockDumper struct {
	data string
	err  error
}

func (m *mockDumper) Dump(_ context.Context, w io.Writer) error {
	if m.err != nil {
		return m.err
	}
	_, err := io.WriteString(w, m.data)
	return err
}

type mockStorage struct {
	uploaded map[string][]byte
	err      error
}

func newMockStorage() *mockStorage {
	return &mockStorage{uploaded: make(map[string][]byte)}
}

func (m *mockStorage) Upload(_ context.Context, key string, r io.Reader) (int64, error) {
	if m.err != nil {
		return 0, m.err
	}
	data, err := io.ReadAll(r)
	if err != nil {
		return 0, err
	}
	m.uploaded[key] = data
	return int64(len(data)), nil
}

// ---- helpers ----

// newNopCompressor returns a Compressor that does no compression (pass-through).
func newNopCompressor(t *testing.T) compress.Compressor {
	t.Helper()
	c, err := compress.New("none")
	if err != nil {
		// Fall back to the factory's passthrough implementation if "none" isn't
		// registered — the unit tests only care that data flows through.
		t.Logf("compress.New('none') returned: %v; using inline nop compressor", err)
		return &nopCompressor{}
	}
	return c
}

// nopCompressor is a minimal pass-through compressor for unit tests.
type nopCompressor struct{}

func (n *nopCompressor) NewWriter(w io.Writer) (io.WriteCloser, error) {
	return &nopWriteCloser{w}, nil
}

type nopWriteCloser struct{ io.Writer }

func (n *nopWriteCloser) Close() error { return nil }

// ---- unit tests ----

func TestJob_Run_ViaTemp_Success(t *testing.T) {
	ctx := context.Background()
	d := &mockDumper{data: "SELECT 1;"}
	s := newMockStorage()

	job := &backup.Job{
		Dumper:       d,
		Compressor:   &nopCompressor{},
		Storage:      s,
		StreamDirect: false,
	}

	result := job.Run(ctx)
	if result.Err != nil {
		t.Fatalf("expected no error, got: %v", result.Err)
	}
	if result.Key == "" {
		t.Fatal("expected a non-empty key")
	}
	if result.Size == 0 {
		t.Fatal("expected size > 0")
	}
	if result.Duration <= 0 {
		t.Fatal("expected positive duration")
	}

	data, ok := s.uploaded[result.Key]
	if !ok {
		t.Fatalf("key %q not found in mock storage", result.Key)
	}
	if !bytes.Contains(data, []byte("SELECT 1;")) {
		t.Fatalf("uploaded data doesn't contain expected payload; got %q", data)
	}
}

func TestJob_Run_StreamDirect_Success(t *testing.T) {
	ctx := context.Background()
	d := &mockDumper{data: "SELECT 2;"}
	s := newMockStorage()

	job := &backup.Job{
		Dumper:       d,
		Compressor:   &nopCompressor{},
		Storage:      s,
		StreamDirect: true,
	}

	result := job.Run(ctx)
	if result.Err != nil {
		t.Fatalf("expected no error, got: %v", result.Err)
	}

	data, ok := s.uploaded[result.Key]
	if !ok {
		t.Fatalf("key %q not found in mock storage", result.Key)
	}
	if !bytes.Contains(data, []byte("SELECT 2;")) {
		t.Fatalf("uploaded data doesn't contain expected payload; got %q", data)
	}
}

func TestJob_Run_DumperError(t *testing.T) {
	ctx := context.Background()
	dumpErr := errors.New("pg_dump failed")
	d := &mockDumper{err: dumpErr}
	s := newMockStorage()

	job := &backup.Job{
		Dumper:       d,
		Compressor:   &nopCompressor{},
		Storage:      s,
		StreamDirect: false,
	}

	result := job.Run(ctx)
	if result.Err == nil {
		t.Fatal("expected an error from dumper, got nil")
	}
	if !strings.Contains(result.Err.Error(), "dump") {
		t.Fatalf("error message should mention 'dump', got: %v", result.Err)
	}
}

func TestJob_Run_StorageError(t *testing.T) {
	ctx := context.Background()
	d := &mockDumper{data: "SELECT 3;"}
	s := &mockStorage{uploaded: make(map[string][]byte), err: errors.New("s3 unavailable")}

	job := &backup.Job{
		Dumper:       d,
		Compressor:   &nopCompressor{},
		Storage:      s,
		StreamDirect: false,
	}

	result := job.Run(ctx)
	if result.Err == nil {
		t.Fatal("expected an error from storage, got nil")
	}
	if !strings.Contains(result.Err.Error(), "upload") {
		t.Fatalf("error message should mention 'upload', got: %v", result.Err)
	}
}

func TestJob_Run_StreamDirect_DumperError(t *testing.T) {
	ctx := context.Background()
	dumpErr := errors.New("stream dump failed")
	d := &mockDumper{err: dumpErr}
	s := newMockStorage()

	job := &backup.Job{
		Dumper:       d,
		Compressor:   &nopCompressor{},
		Storage:      s,
		StreamDirect: true,
	}

	result := job.Run(ctx)
	if result.Err == nil {
		t.Fatal("expected an error, got nil")
	}
}

func TestJob_Run_StreamDirect_StorageError(t *testing.T) {
	ctx := context.Background()
	d := &mockDumper{data: "SELECT 4;"}
	s := &mockStorage{uploaded: make(map[string][]byte), err: errors.New("s3 stream error")}

	job := &backup.Job{
		Dumper:       d,
		Compressor:   &nopCompressor{},
		Storage:      s,
		StreamDirect: true,
	}

	result := job.Run(ctx)
	if result.Err == nil {
		t.Fatal("expected an error, got nil")
	}
}