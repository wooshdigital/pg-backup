package backup_test

import (
	"bytes"
	"context"
	"errors"
	"io"
	"log/slog"
	"testing"
	"time"

	"github.com/soapboxsys/ombudslib/internal/backup"
)

// --- Mock Dumper ---

type mockDumper struct {
	data []byte
	err  error
}

func (m *mockDumper) Dump(ctx context.Context, w io.Writer) error {
	if m.err != nil {
		return m.err
	}
	_, err := w.Write(m.data)
	return err
}

// --- Mock Compressor ---

type mockCompressor struct {
	err       error
	extension string
}

func (m *mockCompressor) Compress(ctx context.Context, r io.Reader, w io.Writer) error {
	if m.err != nil {
		return m.err
	}
	_, err := io.Copy(w, r)
	return err
}

func (m *mockCompressor) Extension() string {
	if m.extension != "" {
		return m.extension
	}
	return ".dump"
}

// --- Mock Storage Backend ---

type mockStorage struct {
	buf  bytes.Buffer
	err  error
	key  string
	size int64
}

func (m *mockStorage) Upload(ctx context.Context, key string, r io.Reader) (int64, error) {
	if m.err != nil {
		return 0, m.err
	}
	m.key = key
	n, err := io.Copy(&m.buf, r)
	m.size = n
	return n, err
}

func (m *mockStorage) Download(ctx context.Context, key string, w io.Writer) error {
	_, err := io.Copy(w, &m.buf)
	return err
}

func (m *mockStorage) List(ctx context.Context) ([]string, error) {
	if m.key != "" {
		return []string{m.key}, nil
	}
	return nil, nil
}

func (m *mockStorage) Delete(ctx context.Context, key string) error {
	return nil
}

// --- Tests ---

func TestJob_Run_Success(t *testing.T) {
	dumpData := []byte("SELECT 1; -- pg_dump output")

	d := &mockDumper{data: dumpData}
	c := &mockCompressor{extension: ".sql"}
	s := &mockStorage{}

	logger := slog.New(slog.NewTextHandler(io.Discard, nil))
	job := backup.NewJob(d, c, s, false, logger)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result := job.Run(ctx)

	if result.Error != nil {
		t.Fatalf("expected no error, got: %v", result.Error)
	}
	if result.Key == "" {
		t.Error("expected non-empty key")
	}
	if result.Size == 0 {
		t.Error("expected non-zero size")
	}
	if result.Duration <= 0 {
		t.Error("expected positive duration")
	}
	if !bytes.Equal(s.buf.Bytes(), dumpData) {
		t.Errorf("storage content mismatch: got %q, want %q", s.buf.Bytes(), dumpData)
	}
}

func TestJob_Run_StreamDirect_Success(t *testing.T) {
	dumpData := []byte("SELECT 2; -- pg_dump output stream direct")

	d := &mockDumper{data: dumpData}
	c := &mockCompressor{extension: ".sql"}
	s := &mockStorage{}

	logger := slog.New(slog.NewTextHandler(io.Discard, nil))
	job := backup.NewJob(d, c, s, true, logger)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result := job.Run(ctx)

	if result.Error != nil {
		t.Fatalf("expected no error, got: %v", result.Error)
	}
	if result.Key == "" {
		t.Error("expected non-empty key")
	}
	if result.Size == 0 {
		t.Error("expected non-zero size")
	}
	if !bytes.Equal(s.buf.Bytes(), dumpData) {
		t.Errorf("storage content mismatch: got %q, want %q", s.buf.Bytes(), dumpData)
	}
}

func TestJob_Run_DumpError(t *testing.T) {
	dumpErr := errors.New("pg_dump connection refused")

	d := &mockDumper{err: dumpErr}
	c := &mockCompressor{}
	s := &mockStorage{}

	logger := slog.New(slog.NewTextHandler(io.Discard, nil))
	job := backup.NewJob(d, c, s, false, logger)

	ctx := context.Background()
	result := job.Run(ctx)

	if result.Error == nil {
		t.Fatal("expected error, got nil")
	}
	if result.Key != "" {
		t.Errorf("expected empty key on error, got %q", result.Key)
	}
}

func TestJob_Run_CompressError(t *testing.T) {
	compErr := errors.New("compression failed")

	d := &mockDumper{data: []byte("data")}
	c := &mockCompressor{err: compErr}
	s := &mockStorage{}

	logger := slog.New(slog.NewTextHandler(io.Discard, nil))
	job := backup.NewJob(d, c, s, false, logger)

	ctx := context.Background()
	result := job.Run(ctx)

	if result.Error == nil {
		t.Fatal("expected error, got nil")
	}
}

func TestJob_Run_StorageError(t *testing.T) {
	uploadErr := errors.New("s3: access denied")

	d := &mockDumper{data: []byte("data")}
	c := &mockCompressor{}
	s := &mockStorage{err: uploadErr}

	logger := slog.New(slog.NewTextHandler(io.Discard, nil))
	job := backup.NewJob(d, c, s, false, logger)

	ctx := context.Background()
	result := job.Run(ctx)

	if result.Error == nil {
		t.Fatal("expected error, got nil")
	}
}

func TestJob_Run_ContextCanceled(t *testing.T) {
	d := &mockDumper{data: []byte("data")}
	c := &mockCompressor{}
	s := &mockStorage{}

	logger := slog.New(slog.NewTextHandler(io.Discard, nil))
	job := backup.NewJob(d, c, s, false, logger)

	ctx, cancel := context.WithCancel(context.Background())
	cancel() // cancel immediately

	// Should still complete (mocks don't check context), but verifies no panic
	result := job.Run(ctx)
	_ = result
}

func TestBackupResult_Fields(t *testing.T) {
	result := backup.BackupResult{
		Key:      "backups/2026/01/01/backup.sql",
		Size:     1024,
		Duration: 5 * time.Second,
		Error:    nil,
	}

	if result.Key == "" {
		t.Error("Key should not be empty")
	}
	if result.Size != 1024 {
		t.Errorf("Size = %d, want 1024", result.Size)
	}
	if result.Duration != 5*time.Second {
		t.Errorf("Duration = %v, want 5s", result.Duration)
	}
	if result.Error != nil {
		t.Errorf("Error = %v, want nil", result.Error)
	}
}