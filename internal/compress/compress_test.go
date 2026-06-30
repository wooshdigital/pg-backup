package compress_test

import (
	"bytes"
	"compress/gzip"
	"io"
	"strings"
	"testing"

	"github.com/ssoready/conf/internal/compress"
)

func TestGzipCompressor_RoundTrip(t *testing.T) {
	f := compress.NewFactory()
	c, err := f.Create("gzip")
	if err != nil {
		t.Fatalf("Create: %v", err)
	}

	const input = "Hello, World! This is a test payload."

	var compressed bytes.Buffer
	if err = c.Compress(strings.NewReader(input), &compressed); err != nil {
		t.Fatalf("Compress: %v", err)
	}

	gr, err := gzip.NewReader(&compressed)
	if err != nil {
		t.Fatalf("gzip.NewReader: %v", err)
	}
	defer gr.Close()

	out, err := io.ReadAll(gr)
	if err != nil {
		t.Fatalf("ReadAll: %v", err)
	}

	if string(out) != input {
		t.Errorf("got %q, want %q", out, input)
	}
}

func TestNoopCompressor(t *testing.T) {
	f := compress.NewFactory()
	c, err := f.Create("none")
	if err != nil {
		t.Fatalf("Create: %v", err)
	}

	const input = "raw bytes"
	var out bytes.Buffer
	if err = c.Compress(strings.NewReader(input), &out); err != nil {
		t.Fatalf("Compress: %v", err)
	}
	if out.String() != input {
		t.Errorf("noop should pass through; got %q", out.String())
	}
}

func TestFactory_UnknownAlgorithm(t *testing.T) {
	_, err := compress.NewFactory().Create("brotli")
	if err == nil {
		t.Error("expected error for unknown algorithm")
	}
}

func TestFactory_CreateWithLevel(t *testing.T) {
	_, err := compress.NewFactory().CreateWithLevel("gzip", 9)
	if err != nil {
		t.Fatalf("CreateWithLevel: %v", err)
	}
}