package backup_test

import (
	"bytes"
	"context"
	"errors"
	"io"
	"testing"

	"github.com/smlgh/smarti/internal/backup"
	"github.com/smlgh/smarti/internal/compress"
)

// ---------------------------------------------------------------------------
// Minimal mocks
// ---------------------------------------------------------------------------

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

type mockStorage struct {
	uploaded map[string][]byte
	err      error
}

func newMockStorage() *mockStorage {
	return &mockStorage{uploaded: make(map[string][]byte)}
}

func (m *mockStorage) Upload(_ context.Context, key string, r io.Reader) (string, int64, error) {
	if m.err != nil {
		return key, 0, m.err
	}
	data, err := io.ReadAll(r)
	if err != nil {
		return key, 0, err
	}
	m.uploaded[key] = data
	return key, int64(len(data)), nil
}

func (m *mockStorage) Delete(_ context.Context, key string) error { return nil }
func (m *mockStorage) List(_ context.Context, prefix string) ([]string, error) {
	return nil, nil
}

// ---------------------------------------------------------------------------
// Unit tests – temp-file path
// ---------------------------------------------------------------------------

func TestJob_Run_TempFile_Success(t *testing.T) {
	rawData := []byte("SELECT 1; -- pg_dump output")

	md := &mockDumper{data: rawData}
	mc := newMockStorage()
	comp := compress.NewNoop() // no-op compressor keeps data as-is

	job := &backup.Job{
		Dumper:      md,
		Compressor:  comp,
		Storage:     mc,
		StorageKey:  "backups/test.sql",
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
	if result.Duration == 0 {
		t.Error("expected non-zero duration")
	}
}

func TestJob_Run_TempFile_DumperError(t *testing.T) {
	md := &mockDumper{err: errors.New("pg_dump failed")}
	mc := newMockStorage()
	comp := compress.NewNoop()

	job := &backup.Job{
		Dumper:     md,
		Compressor: comp,
		Storage:    mc,
		StorageKey: "backups/test.sql",
	}

	result := job.Run(context.Background())
	if result.Err == nil {
		t.Fatal("expected an error from dumper")
	}
}

func TestJob_Run_TempFile_StorageError(t *testing.T) {
	md := &mockDumper{data: []byte("data")}
	mc := newMockStorage()
	mc.err = errors.New("S3 unavailable")
	comp := compress.NewNoop()

	job := &backup.Job{
		Dumper:     md,
		Compressor: comp,
		Storage:    mc,
		StorageKey: "backups/test.sql",
	}

	result := job.Run(context.Background())
	if result.Err == nil {
		t.Fatal("expected an error from storage")
	}
}

// ---------------------------------------------------------------------------
// Unit tests – direct-stream path
// ---------------------------------------------------------------------------

func TestJob_Run_StreamDirect_Success(t *testing.T) {
	rawData := []byte("pg_dump direct stream data")

	md := &mockDumper{data: rawData}
	mc := newMockStorage()
	comp := compress.NewNoop()

	job := &backup.Job{
		Dumper:       md,
		Compressor:   comp,
		Storage:      mc,
		StorageKey:   "backups/direct.sql",
		StreamDirect: true,
	}

	result := job.Run(context.Background())
	if result.Err != nil {
		t.Fatalf("expected no error, got: %v", result.Err)
	}

	uploaded := mc.uploaded["backups/direct.sql"]
	if !bytes.Equal(uploaded, rawData) {
		t.Errorf("uploaded data mismatch: got %q want %q", uploaded, rawData)
	}
}

func TestJob_Run_StreamDirect_DumperError(t *testing.T) {
	md := &mockDumper{err: errors.New("dump failed")}
	mc := newMockStorage()
	comp := compress.NewNoop()

	job := &backup.Job{
		Dumper:       md,
		Compressor:   comp,
		Storage:      mc,
		StorageKey:   "backups/direct.sql",
		StreamDirect: true,
	}

	result := job.Run(context.Background())
	if result.Err == nil {
		t.Fatal("expected an error")
	}
}