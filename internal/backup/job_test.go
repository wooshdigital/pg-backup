package backup_test

import (
	"bytes"
	"compress/gzip"
	"context"
	"errors"
	"io"
	"testing"

	"github.com/example/dbbackup/internal/backup"
)

// --- mocks ---

type mockDumper struct {
	data []byte
	err  error
}

func (m *mockDumper) Dump(_ context.Context, w io.Writer) error {
	if m.err != nil {
		return m.err
	}
	_, err := w.Write(m.data)
	return err
}

type mockCompressor struct {
	passthrough bool // if true, no actual compression
}

type nopWriteCloser struct {
	io.Writer
}

func (nopWriteCloser) Close() error { return nil }

func (c *mockCompressor) Wrap(w io.Writer) (io.WriteCloser, error) {
	if c.passthrough {
		return nopWriteCloser{w}, nil
	}
	return gzip.NewWriter(w), nil
}

func (c *mockCompressor) Extension() string {
	if c.passthrough {
		return ""
	}
	return ".gz"
}

type mockStorage struct {
	uploaded map[string][]byte
	err      error
}

func newMockStorage() *mockStorage {
	return &mockStorage{uploaded: make(map[string][]byte)}
}

func (m *mockStorage) Upload(_ context.Context, key string, r io.Reader, _ int64) error {
	if m.err != nil {
		return m.err
	}
	data, err := io.ReadAll(r)
	if err != nil {
		return err
	}
	m.uploaded[key] = data
	return nil
}

func (m *mockStorage) Delete(_ context.Context, key string) error {
	delete(m.uploaded, key)
	return nil
}

func (m *mockStorage) List(_ context.Context, prefix string) ([]string, error) {
	var keys []string
	for k := range m.uploaded {
		keys = append(keys, k)
	}
	return keys, nil
}

// --- tests ---

func TestJob_Run_ViaTemp_Success(t *testing.T) {
	payload := []byte("SELECT 1; -- pg_dump output")
	store := newMockStorage()

	job := &backup.Job{
		Dumper:       &mockDumper{data: payload},
		Compressor:   &mockCompressor{passthrough: true},
		Storage:      store,
		StorageKey:   "backups/test.sql",
		StreamDirect: false,
	}

	result := job.Run(context.Background())

	if result.Err != nil {
		t.Fatalf("expected no error, got: %v", result.Err)
	}
	if result.Key != "backups/test.sql" {
		t.Errorf("unexpected key: %s", result.Key)
	}
	if result.Size == 0 {
		t.Error("expected non-zero size")
	}

	uploaded, ok := store.uploaded["backups/test.sql"]
	if !ok {
		t.Fatal("expected file to be uploaded")
	}
	if !bytes.Equal(uploaded, payload) {
		t.Errorf("uploaded content mismatch: got %q want %q", uploaded, payload)
	}
}

func TestJob_Run_StreamDirect_Success(t *testing.T) {
	payload := []byte("pg_dump stream data")
	store := newMockStorage()

	job := &backup.Job{
		Dumper:       &mockDumper{data: payload},
		Compressor:   &mockCompressor{passthrough: true},
		Storage:      store,
		StorageKey:   "backups/stream.sql",
		StreamDirect: true,
	}

	result := job.Run(context.Background())

	if result.Err != nil {
		t.Fatalf("expected no error, got: %v", result.Err)
	}
	uploaded, ok := store.uploaded["backups/stream.sql"]
	if !ok {
		t.Fatal("expected file to be uploaded")
	}
	if !bytes.Equal(uploaded, payload) {
		t.Errorf("uploaded content mismatch: got %q want %q", uploaded, payload)
	}
}

func TestJob_Run_ViaTemp_WithGzip(t *testing.T) {
	payload := []byte("compressed backup data")
	store := newMockStorage()

	job := &backup.Job{
		Dumper:       &mockDumper{data: payload},
		Compressor:   &mockCompressor{passthrough: false},
		Storage:      store,
		StorageKey:   "backups/test.sql.gz",
		StreamDirect: false,
	}

	result := job.Run(context.Background())
	if result.Err != nil {
		t.Fatalf("expected no error, got: %v", result.Err)
	}

	uploaded := store.uploaded["backups/test.sql.gz"]
	gr, err := gzip.NewReader(bytes.NewReader(uploaded))
	if err != nil {
		t.Fatalf("uploaded data is not valid gzip: %v", err)
	}
	decompressed, err := io.ReadAll(gr)
	if err != nil {
		t.Fatalf("failed to decompress: %v", err)
	}
	if !bytes.Equal(decompressed, payload) {
		t.Errorf("decompressed mismatch: got %q want %q", decompressed, payload)
	}
}

func TestJob_Run_DumperError(t *testing.T) {
	dumpErr := errors.New("pg_dump failed")
	store := newMockStorage()

	job := &backup.Job{
		Dumper:       &mockDumper{err: dumpErr},
		Compressor:   &mockCompressor{passthrough: true},
		Storage:      store,
		StorageKey:   "backups/fail.sql",
		StreamDirect: false,
	}

	result := job.Run(context.Background())
	if result.Err == nil {
		t.Fatal("expected error, got nil")
	}
	if !errors.Is(result.Err, dumpErr) {
		t.Errorf("expected dump error in chain, got: %v", result.Err)
	}
}

func TestJob_Run_StorageError(t *testing.T) {
	uploadErr := errors.New("S3 unavailable")
	store := newMockStorage()
	store.err = uploadErr

	job := &backup.Job{
		Dumper:       &mockDumper{data: []byte("data")},
		Compressor:   &mockCompressor{passthrough: true},
		Storage:      store,
		StorageKey:   "backups/fail.sql",
		StreamDirect: false,
	}

	result := job.Run(context.Background())
	if result.Err == nil {
		t.Fatal("expected error, got nil")
	}
	if !errors.Is(result.Err, uploadErr) {
		t.Errorf("expected upload error in chain, got: %v", result.Err)
	}
}

func TestJob_Run_StreamDirect_DumperError(t *testing.T) {
	dumpErr := errors.New("dump failed mid-stream")
	store := newMockStorage()

	job := &backup.Job{
		Dumper:       &mockDumper{err: dumpErr},
		Compressor:   &mockCompressor{passthrough: true},
		Storage:      store,
		StorageKey:   "backups/stream-fail.sql",
		StreamDirect: true,
	}

	result := job.Run(context.Background())
	if result.Err == nil {
		t.Fatal("expected error, got nil")
	}
}

func TestJob_Run_Duration(t *testing.T) {
	job := &backup.Job{
		Dumper:       &mockDumper{data: []byte("data")},
		Compressor:   &mockCompressor{passthrough: true},
		Storage:      newMockStorage(),
		StorageKey:   "backups/timing.sql",
		StreamDirect: false,
	}

	result := job.Run(context.Background())
	if result.Err != nil {
		t.Fatalf("unexpected error: %v", result.Err)
	}
	if result.Duration <= 0 {
		t.Error("expected positive duration")
	}
}