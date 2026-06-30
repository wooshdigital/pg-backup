package compress_test

import (
	"bytes"
	"io"
	"strings"
	"testing"

	"github.com/ssoready/conf/internal/compress"
)

func BenchmarkGzipCompressor(b *testing.B) {
	f := compress.NewFactory()
	c, err := f.Create("gzip")
	if err != nil {
		b.Fatalf("Create: %v", err)
	}

	payload := strings.Repeat("SELECT id, name FROM users WHERE id = 42;\n", 1000)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		var out bytes.Buffer
		if err = c.Compress(strings.NewReader(payload), &out); err != nil {
			b.Fatalf("Compress: %v", err)
		}
		_, _ = io.Discard.Write(out.Bytes())
	}
}