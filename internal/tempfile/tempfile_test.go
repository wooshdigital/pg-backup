package tempfile_test

import (
	"io"
	"os"
	"testing"

	"github.com/ssoready/conf/internal/tempfile"
)

func TestTempFile_WriteReadRemove(t *testing.T) {
	tf, err := tempfile.New()
	if err != nil {
		t.Fatalf("New: %v", err)
	}

	const msg = "hello tempfile"
	if _, err = io.WriteString(tf, msg); err != nil {
		t.Fatalf("write: %v", err)
	}

	if _, err = tf.Seek(0, io.SeekStart); err != nil {
		t.Fatalf("seek: %v", err)
	}

	got, err := io.ReadAll(tf)
	if err != nil {
		t.Fatalf("read: %v", err)
	}
	if string(got) != msg {
		t.Errorf("content = %q, want %q", got, msg)
	}

	name := tf.Name()
	if err = tf.Remove(); err != nil {
		t.Fatalf("remove: %v", err)
	}
	if _, err = os.Stat(name); !os.IsNotExist(err) {
		t.Errorf("file %q should be deleted", name)
	}
}