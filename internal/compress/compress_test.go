package compress_test

import (
	"bytes"
	"compress/gzip"
	"io"
	"strings"
	"testing"

	"github.com/klauspost/compress/zstd"

	"github.com/nicholasgasior/gsfmt/internal/compress"
)

const testData = `This is sample pg_dump output data used for compression round-trip testing.
It contains multiple lines of SQL-like content to provide a realistic payload.
CREATE TABLE users (id SERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE);
INSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com');
INSERT INTO users (name, email) VALUES ('Bob', 'bob@example.com');
`

func repeat(s string, n int) string {
	var b strings.Builder
	for i := 0; i < n; i++ {
		b.WriteString(s)
	}
	return b.String()
}

func TestGzipCompressor_RoundTrip(t *testing.T) {
	c := compress.NewGzipCompressor(gzip.DefaultCompression)

	payload := repeat(testData, 100)
	src := strings.NewReader(payload)
	var compressed bytes.Buffer

	if err := c.Compress(src, &compressed); err != nil {
		t.Fatalf("Compress failed: %v", err)
	}

	if compressed.Len() == 0 {
		t.Fatal("compressed output is empty")
	}

	// Decompress and verify
	r, err := gzip.NewReader(&compressed)
	if err != nil {
		t.Fatalf("gzip.NewReader failed: %v", err)
	}
	defer r.Close()

	decompressed, err := io.ReadAll(r)
	if err != nil {
		t.Fatalf("read decompressed data failed: %v", err)
	}

	if string(decompressed) != payload {
		t.Errorf("round-trip mismatch: got %d bytes, want %d bytes", len(decompressed), len(payload))
	}
}

func TestGzipCompressor_FileExtension(t *testing.T) {
	c := compress.NewGzipCompressor(0)
	if ext := c.FileExtension(); ext != ".gz" {
		t.Errorf("expected .gz, got %s", ext)
	}
}

func TestGzipCompressor_Levels(t *testing.T) {
	levels := []int{
		gzip.BestSpeed,
		gzip.DefaultCompression,
		gzip.BestCompression,
	}
	for _, level := range levels {
		t.Run("", func(t *testing.T) {
			c := compress.NewGzipCompressor(level)
			payload := repeat(testData, 50)
			src := strings.NewReader(payload)
			var compressed bytes.Buffer
			if err := c.Compress(src, &compressed); err != nil {
				t.Fatalf("level %d: Compress failed: %v", level, err)
			}
			r, err := gzip.NewReader(&compressed)
			if err != nil {
				t.Fatalf("level %d: gzip.NewReader failed: %v", level, err)
			}
			defer r.Close()
			got, err := io.ReadAll(r)
			if err != nil {
				t.Fatalf("level %d: ReadAll failed: %v", level, err)
			}
			if string(got) != payload {
				t.Errorf("level %d: round-trip mismatch", level)
			}
		})
	}
}

func TestZstdCompressor_RoundTrip(t *testing.T) {
	c := compress.NewZstdCompressor(2)

	payload := repeat(testData, 100)
	src := strings.NewReader(payload)
	var compressed bytes.Buffer

	if err := c.Compress(src, &compressed); err != nil {
		t.Fatalf("Compress failed: %v", err)
	}

	if compressed.Len() == 0 {
		t.Fatal("compressed output is empty")
	}

	// Decompress and verify
	r, err := zstd.NewReader(&compressed)
	if err != nil {
		t.Fatalf("zstd.NewReader failed: %v", err)
	}
	defer r.Close()

	decompressed, err := io.ReadAll(r)
	if err != nil {
		t.Fatalf("read decompressed data failed: %v", err)
	}

	if string(decompressed) != payload {
		t.Errorf("round-trip mismatch: got %d bytes, want %d bytes", len(decompressed), len(payload))
	}
}

func TestZstdCompressor_FileExtension(t *testing.T) {
	c := compress.NewZstdCompressor(0)
	if ext := c.FileExtension(); ext != ".zst" {
		t.Errorf("expected .zst, got %s", ext)
	}
}

func TestZstdCompressor_Levels(t *testing.T) {
	for level := 1; level <= 4; level++ {
		level := level
		t.Run("", func(t *testing.T) {
			c := compress.NewZstdCompressor(level)
			payload := repeat(testData, 50)
			src := strings.NewReader(payload)
			var compressed bytes.Buffer
			if err := c.Compress(src, &compressed); err != nil {
				t.Fatalf("level %d: Compress failed: %v", level, err)
			}
			r, err := zstd.NewReader(&compressed)
			if err != nil {
				t.Fatalf("level %d: zstd.NewReader failed: %v", level, err)
			}
			defer r.Close()
			got, err := io.ReadAll(r)
			if err != nil {
				t.Fatalf("level %d: ReadAll failed: %v", level, err)
			}
			if string(got) != payload {
				t.Errorf("level %d: round-trip mismatch", level)
			}
		})
	}
}

func TestNoneCompressor_RoundTrip(t *testing.T) {
	c := &compress.NoneCompressor{}

	payload := repeat(testData, 10)
	src := strings.NewReader(payload)
	var dst bytes.Buffer

	if err := c.Compress(src, &dst); err != nil {
		t.Fatalf("Compress failed: %v", err)
	}

	if dst.String() != payload {
		t.Errorf("NoneCompressor altered data: got %d bytes, want %d bytes", dst.Len(), len(payload))
	}
}

func TestNoneCompressor_FileExtension(t *testing.T) {
	c := &compress.NoneCompressor{}
	if ext := c.FileExtension(); ext != "" {
		t.Errorf("expected empty string, got %s", ext)
	}
}

func TestGzipCompressor_EmptyInput(t *testing.T) {
	c := compress.NewGzipCompressor(gzip.DefaultCompression)
	src := strings.NewReader("")
	var compressed bytes.Buffer
	if err := c.Compress(src, &compressed); err != nil {
		t.Fatalf("Compress empty input failed: %v", err)
	}
	r, err := gzip.NewReader(&compressed)
	if err != nil {
		t.Fatalf("gzip.NewReader failed: %v", err)
	}
	defer r.Close()
	got, err := io.ReadAll(r)
	if err != nil {
		t.Fatalf("ReadAll failed: %v", err)
	}
	if len(got) != 0 {
		t.Errorf("expected empty output, got %d bytes", len(got))
	}
}

func TestZstdCompressor_EmptyInput(t *testing.T) {
	c := compress.NewZstdCompressor(0)
	src := strings.NewReader("")
	var compressed bytes.Buffer
	if err := c.Compress(src, &compressed); err != nil {
		t.Fatalf("Compress empty input failed: %v", err)
	}
	r, err := zstd.NewReader(&compressed)
	if err != nil {
		t.Fatalf("zstd.NewReader failed: %v", err)
	}
	defer r.Close()
	got, err := io.ReadAll(r)
	if err != nil {
		t.Fatalf("ReadAll failed: %v", err)
	}
	if len(got) != 0 {
		t.Errorf("expected empty output, got %d bytes", len(got))
	}
}