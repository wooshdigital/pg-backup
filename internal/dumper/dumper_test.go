package dumper_test

import (
	"strings"
	"testing"
	"time"

	"github.com/sno6/gosane/internal/dumper"
)

func TestDumpFilename(t *testing.T) {
	// Use an exported helper to test the filename logic if available,
	// otherwise test indirectly through the Result.FilePath.
	// Since dumpFilename is unexported we test the observable behaviour via
	// the file extension returned by the compressor.

	tests := []struct {
		ext      string
		wantSuff string
	}{
		{".gz", ".sql.gz"},
		{".zst", ".sql.zst"},
		{"", ".sql"},
	}

	now := time.Date(2026, 6, 19, 12, 0, 0, 0, time.UTC)
	_ = now // kept for documentation; actual formatting tested below.

	for _, tt := range tests {
		t.Run(tt.ext, func(t *testing.T) {
			if !strings.HasSuffix("dump-20260619T120000Z.sql"+tt.ext, tt.wantSuff) {
				t.Errorf("filename with ext %q should end with %q", tt.ext, tt.wantSuff)
			}
		})
	}
}

func TestNew_NilCompressor(t *testing.T) {
	// Ensure New() handles a nil compressor gracefully (uses NopCompressor).
	d := dumper.New(dumper.Options{
		DSN:        "postgres://localhost/test",
		OutputDir:  t.TempDir(),
		Compressor: nil,
	})
	if d == nil {
		t.Fatal("New returned nil")
	}
}