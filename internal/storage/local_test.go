package storage_test

import (
	"bytes"
	"context"
	"os"
	"path/filepath"
	"testing"

	"github.com/yourorg/dbworker/internal/storage"
)

func TestLocalStorage_Upload(t *testing.T) {
	dir := t.TempDir()

	ls, err := storage.NewLocalStorage(dir)
	if err != nil {
		t.Fatalf("NewLocalStorage: %v", err)
	}

	tests := []struct {
		name    string
		key     string
		data    []byte
		wantErr bool
	}{
		{
			name: "simple key",
			key:  "backup.sql.gz",
			data: []byte("compressed-data"),
		},
		{
			name: "nested key",
			key:  "mydb/2024-03-15/1710505800/dump.sql.gz",
			data: []byte("nested-compressed-data"),
		},
		{
			name: "empty data",
			key:  "empty.gz",
			data: []byte{},
		},
		{
			name:    "empty key returns error",
			key:     "",
			data:    []byte("data"),
			wantErr: true,
		},
		{
			name:    "path traversal rejected",
			key:     "../outside.gz",
			data:    []byte("evil"),
			wantErr: true,
		},
	}

	ctx := context.Background()

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			r := bytes.NewReader(tc.data)
			err := ls.Upload(ctx, tc.key, r, int64(len(tc.data)))
			if tc.wantErr {
				if err == nil {
					t.Fatal("expected error, got nil")
				}
				return
			}
			if err != nil {
				t.Fatalf("Upload() error: %v", err)
			}

			// Verify the file exists and has the correct contents.
			dest := filepath.Join(dir, filepath.FromSlash(tc.key))
			got, err := os.ReadFile(dest)
			if err != nil {
				t.Fatalf("failed to read written file: %v", err)
			}
			if !bytes.Equal(got, tc.data) {
				t.Errorf("file content mismatch: got %q, want %q", got, tc.data)
			}
		})
	}
}

func TestNewLocalStorage_MissingBaseDir(t *testing.T) {
	_, err := storage.NewLocalStorage("")
	if err == nil {
		t.Fatal("expected error for empty baseDir, got nil")
	}
}

func TestNewLocalStorage_CreatesDir(t *testing.T) {
	parent := t.TempDir()
	newDir := filepath.Join(parent, "subdir", "nested")

	ls, err := storage.NewLocalStorage(newDir)
	if err != nil {
		t.Fatalf("NewLocalStorage failed to create directories: %v", err)
	}

	if _, err := os.Stat(ls.BaseDir); os.IsNotExist(err) {
		t.Errorf("base directory %q was not created", ls.BaseDir)
	}
}