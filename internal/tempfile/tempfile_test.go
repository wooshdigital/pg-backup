package tempfile_test

import (
	"os"
	"strings"
	"testing"

	"github.com/yourusername/pg-dump-worker/internal/tempfile"
)

func TestNew(t *testing.T) {
	dir := t.TempDir()
	f, err := tempfile.New(dir, "test-*.tmp")
	if err != nil {
		t.Fatalf("New: %v", err)
	}
	defer os.Remove(f.Name())
	defer f.Close()

	if !strings.HasPrefix(f.Name(), dir) {
		t.Errorf("temp file %q not in dir %q", f.Name(), dir)
	}
}