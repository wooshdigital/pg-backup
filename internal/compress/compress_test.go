package compress_test

import (
	"bytes"
	"context"
	"testing"

	"github.com/soapboxsys/ombudslib/internal/compress"
)

func TestGzipCompressor_RoundTrip(t *testing.T) {
	original := []byte("hello, world! this is test data for gzip compression.")

	c, err := compress.NewGzip(compress.DefaultLevel)
	if err != nil {
		t.Fatalf("NewGzip: %v", err)
	}

	var compressed bytes.Buffer
	if err := c.Compress(context.Background(), bytes.NewReader(original), &compressed); err != nil {
		t.Fatalf("Compress: %v", err)
	}

	if compressed.Len() == 0 {
		t.Error("compressed output is empty")
	}
	if c.Extension() != ".gz" {
		t.Errorf("Extension() = %q, want .gz", c.Extension())
	}
}

func TestFactory_UnknownAlgorithm(t *testing.T) {
	_, err := compress.NewFromConfig(compress.Config{Algorithm: "bzip3"})
	if err == nil {
		t.Error("expected error for unknown algorithm")
	}
}