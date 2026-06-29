package backup_test

import (
	"bytes"
	"context"
	"errors"
	"io"
	"strings"
	"testing"

	"github.com/sgorgun/go-backup/internal/backup"
)

// ---- Mocks ----------------------------------------------------------------

type mockDumper struct {
	data []byte
	err  error
}

func (m *mockDumper) Dump(_ context.Context) (io.Reader, error) {
	if m.err != nil {
		return nil, m.err
	}
	return bytes.NewReader(m.data), nil
}

type mockCompressor struct {
	err error
}

func (m *mockCompressor) Compress(r io.Reader) (io.Reader, error) {
	if m.err != nil {
		return nil, m.err
	}
	// Pass-through; real tests use the real compressor.
	return r, nil
}

type mockStorage struct {
	data map[string][]byte
	err  error
}

func newMockStorage() *mockStorage {
	return &mockStorage{data: make(map[string][]byte)}
}

func (m *mockStorage) Put(_ context.Context, key string, r io.Reader) (int64, error) {
	if m.err != nil {
		return 0, m.err
	}
	b, err := io.ReadAll(r)
	if err != nil {
		return 0, err
	}
	m.data[key] = b
	return int64(len(b)), nil
}

// ---- Unit tests -----------------------------------------------------------

func TestJob_Run_TempFile_Success(t *testing.T) {
	payload := []byte("SELECT 1;")
	ms := newMockStorage()
	job := &backup.Job{
		Dumper:     &mockDumper{data: payload},
		Compressor: &mockCompressor{},
		Storage:    ms,
		StreamDirect: false,
		KeyFunc: func() string { return "test/backup.sql.gz" },
	}

	result := job.Run(context.Background())
	if result.Err != nil {
		t.Fatalf("expected no error, got %v", result.Err)
	}
	if result.Key != "test/backup.sql.gz" {
		t.Errorf("unexpected key: %s", result.Key)
	}
	if result.Size != int64(len(payload)) {
		t.Errorf("expected size %d, got %d", len(payload), result.Size)
	}
	stored, ok := ms.data["test/backup.sql.gz"]
	if !ok {
		t.Fatal("data not found in mock storage")
	}
	if !bytes.Equal(stored, payload) {
		t.Errorf("stored data mismatch: got %q, want %q", stored, payload)
	}
}

func TestJob_Run_StreamDirect_Success(t *testing.T) {
	payload := []byte("pg_dump output data")
	ms := newMockStorage()
	job := &backup.Job{
		Dumper:       &mockDumper{data: payload},
		Compressor:   &mockCompressor{},
		Storage:      ms,
		StreamDirect: true,
		KeyFunc:      func() string { return "test/stream.sql.gz" },
	}

	result := job.Run(context.Background())
	if result.Err != nil {
		t.Fatalf("expected no error, got %v", result.Err)
	}
	stored, ok := ms.data["test/stream.sql.gz"]
	if !ok {
		t.Fatal("data not found in mock storage")
	}
	if !bytes.Equal(stored, payload) {
		t.Errorf("stored data mismatch")
	}
}

func TestJob_Run_DumpError(t *testing.T) {
	dumpErr := errors.New("pg_dump failed")
	ms := newMockStorage()
	job := &backup.Job{
		Dumper:     &mockDumper{err: dumpErr},
		Compressor: &mockCompressor{},
		Storage:    ms,
		KeyFunc:    func() string { return "test/fail.sql.gz" },
	}

	result := job.Run(context.Background())
	if result.Err == nil {
		t.Fatal("expected error, got nil")
	}
	if !strings.Contains(result.Err.Error(), "dump") {
		t.Errorf("expected dump error, got: %v", result.Err)
	}
}

func TestJob_Run_CompressError(t *testing.T) {
	compressErr := errors.New("compression failed")
	ms := newMockStorage()
	job := &backup.Job{
		Dumper:     &mockDumper{data: []byte("data")},
		Compressor: &mockCompressor{err: compressErr},
		Storage:    ms,
		KeyFunc:    func() string { return "test/fail.sql.gz" },
	}

	result := job.Run(context.Background())
	if result.Err == nil {
		t.Fatal("expected error, got nil")
	}
	if !strings.Contains(result.Err.Error(), "compress") {
		t.Errorf("expected compress error, got: %v", result.Err)
	}
}

func TestJob_Run_UploadError(t *testing.T) {
	uploadErr := errors.New("upload failed")
	ms := newMockStorage()
	ms.err = uploadErr
	job := &backup.Job{
		Dumper:     &mockDumper{data: []byte("data")},
		Compressor: &mockCompressor{},
		Storage:    ms,
		KeyFunc:    func() string { return "test/fail.sql.gz" },
	}

	result := job.Run(context.Background())
	if result.Err == nil {
		t.Fatal("expected error, got nil")
	}
	if !strings.Contains(result.Err.Error(), "upload") {
		t.Errorf("expected upload error, got: %v", result.Err)
	}
}

func TestJob_Run_DefaultKey(t *testing.T) {
	ms := newMockStorage()
	job := &backup.Job{
		Dumper:     &mockDumper{data: []byte("data")},
		Compressor: &mockCompressor{},
		Storage:    ms,
		// No KeyFunc set — should use default key generator.
	}

	result := job.Run(context.Background())
	if result.Err != nil {
		t.Fatalf("expected no error, got %v", result.Err)
	}
	if result.Key == "" {
		t.Error("expected non-empty key")
	}
}