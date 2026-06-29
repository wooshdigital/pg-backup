package backup_test

import (
	"bytes"
	"context"
	"errors"
	"io"
	"testing"

	"github.com/smnzlnsk/backup-worker/internal/backup"
)

// --- Mock implementations ---

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
	err error
}

func (m *mockCompressor) Compress(r io.Reader, w io.Writer) (int64, error) {
	if m.err != nil {
		return 0, m.err
	}
	return io.Copy(w, r)
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

// --- Unit Tests ---

func TestJob_Run_Success(t *testing.T) {
	payload := []byte("SELECT 1; -- fake dump output")
	store := newMockStorage()

	job := &backup.Job{
		Dumper:     &mockDumper{data: payload},
		Compressor: &mockCompressor{},
		Storage:    store,
	}

	result := job.Run(context.Background())
	if result.Err != nil {
		t.Fatalf("expected no error, got: %v", result.Err)
	}
	if result.Key == "" {
		t.Fatal("expected a non-empty key")
	}
	if result.Size != int64(len(payload)) {
		t.Fatalf("expected size %d, got %d", len(payload), result.Size)
	}
	if _, ok := store.uploaded[result.Key]; !ok {
		t.Fatalf("expected key %q to be uploaded", result.Key)
	}
}

func TestJob_Run_DumperError(t *testing.T) {
	job := &backup.Job{
		Dumper:     &mockDumper{err: errors.New("pg_dump failed")},
		Compressor: &mockCompressor{},
		Storage:    newMockStorage(),
	}

	result := job.Run(context.Background())
	if result.Err == nil {
		t.Fatal("expected an error from dumper, got nil")
	}
}

func TestJob_Run_CompressorError(t *testing.T) {
	job := &backup.Job{
		Dumper:     &mockDumper{data: []byte("data")},
		Compressor: &mockCompressor{err: errors.New("compress failed")},
		Storage:    newMockStorage(),
	}

	result := job.Run(context.Background())
	if result.Err == nil {
		t.Fatal("expected an error from compressor, got nil")
	}
}

func TestJob_Run_StorageError(t *testing.T) {
	store := newMockStorage()
	store.err = errors.New("upload failed")

	job := &backup.Job{
		Dumper:     &mockDumper{data: []byte("data")},
		Compressor: &mockCompressor{},
		Storage:    store,
	}

	result := job.Run(context.Background())
	if result.Err == nil {
		t.Fatal("expected an error from storage, got nil")
	}
}

func TestJob_Run_StreamDirect_Success(t *testing.T) {
	payload := []byte("stream direct payload")
	store := newMockStorage()

	job := &backup.Job{
		Dumper:       &mockDumper{data: payload},
		Compressor:   &mockCompressor{},
		Storage:      store,
		StreamDirect: true,
	}

	result := job.Run(context.Background())
	if result.Err != nil {
		t.Fatalf("expected no error, got: %v", result.Err)
	}
	if result.Key == "" {
		t.Fatal("expected a non-empty key")
	}

	uploaded, ok := store.uploaded[result.Key]
	if !ok {
		t.Fatalf("expected key %q to be uploaded", result.Key)
	}
	if !bytes.Equal(uploaded, payload) {
		t.Fatalf("uploaded data mismatch: got %q, want %q", uploaded, payload)
	}
}

func TestJob_Run_DurationNonZero(t *testing.T) {
	job := &backup.Job{
		Dumper:     &mockDumper{data: []byte("data")},
		Compressor: &mockCompressor{},
		Storage:    newMockStorage(),
	}

	result := job.Run(context.Background())
	if result.Duration <= 0 {
		t.Fatal("expected positive duration")
	}
}