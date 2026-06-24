package compress_test

import (
	"bytes"
	"compress/gzip"
	"io"
	"strings"
	"testing"

	"github.com/klauspost/compress/zstd"
	"github.com/your-org/your-project/internal/compress"
)

// sampleData returns a realistic-ish SQL dump string for testing.
func sampleData() string {
	return strings.Repeat(`INSERT INTO trips (id, name, destination, start_date, end_date, budget) VALUES (1, 'Summer Holiday', 'Paris', '2026-07-01', '2026-07-14', 2500.00);
INSERT INTO trips (id, name, destination, start_date, end_date, budget) VALUES (2, 'Weekend Break', 'Amsterdam', '2026-08-15', '2026-08-17', 800.00);
SELECT * FROM trips WHERE budget > 1000 ORDER BY start_date ASC;
`, 500)
}

// decompressGzip is a test helper to decompress gzip data.
func decompressGzip(t *testing.T, compressed []byte) []byte {
	t.Helper()
	r, err := gzip.NewReader(bytes.NewReader(compressed))
	if err != nil {
		t.Fatalf("gzip.NewReader: %v", err)
	}
	defer r.Close()
	out, err := io.ReadAll(r)
	if err != nil {
		t.Fatalf("gzip read: %v", err)
	}
	return out
}

// decompressZstd is a test helper to decompress zstd data.
func decompressZstd(t *testing.T, compressed []byte) []byte {
	t.Helper()
	r, err := zstd.NewReader(bytes.NewReader(compressed))
	if err != nil {
		t.Fatalf("zstd.NewReader: %v", err)
	}
	defer r.Close()
	out, err := io.ReadAll(r)
	if err != nil {
		t.Fatalf("zstd read: %v", err)
	}
	return out
}

func TestGzipCompressor_RoundTrip(t *testing.T) {
	original := []byte(sampleData())
	c := compress.NewGzipCompressor(gzip.DefaultCompression)

	var buf bytes.Buffer
	if err := c.Compress(bytes.NewReader(original), &buf); err != nil {
		t.Fatalf("Compress() error: %v", err)
	}

	if buf.Len() == 0 {
		t.Fatal("expected non-empty compressed output")
	}

	got := decompressGzip(t, buf.Bytes())
	if !bytes.Equal(original, got) {
		t.Errorf("round-trip mismatch: got %d bytes, want %d bytes", len(got), len(original))
	}
}

func TestGzipCompressor_BestSpeed_RoundTrip(t *testing.T) {
	original := []byte(sampleData())
	c := compress.NewGzipCompressor(gzip.BestSpeed)

	var buf bytes.Buffer
	if err := c.Compress(bytes.NewReader(original), &buf); err != nil {
		t.Fatalf("Compress() error: %v", err)
	}

	got := decompressGzip(t, buf.Bytes())
	if !bytes.Equal(original, got) {
		t.Errorf("round-trip mismatch: got %d bytes, want %d bytes", len(got), len(original))
	}
}

func TestGzipCompressor_BestCompression_RoundTrip(t *testing.T) {
	original := []byte(sampleData())
	c := compress.NewGzipCompressor(gzip.BestCompression)

	var buf bytes.Buffer
	if err := c.Compress(bytes.NewReader(original), &buf); err != nil {
		t.Fatalf("Compress() error: %v", err)
	}

	got := decompressGzip(t, buf.Bytes())
	if !bytes.Equal(original, got) {
		t.Errorf("round-trip mismatch: got %d bytes, want %d bytes", len(got), len(original))
	}
}

func TestGzipCompressor_Extension(t *testing.T) {
	c := compress.NewGzipCompressor(gzip.DefaultCompression)
	if c.Extension() != ".gz" {
		t.Errorf("Extension() = %q, want %q", c.Extension(), ".gz")
	}
}

func TestZstdCompressor_RoundTrip(t *testing.T) {
	original := []byte(sampleData())
	c := compress.NewZstdCompressor(zstd.SpeedDefault)

	var buf bytes.Buffer
	if err := c.Compress(bytes.NewReader(original), &buf); err != nil {
		t.Fatalf("Compress() error: %v", err)
	}

	if buf.Len() == 0 {
		t.Fatal("expected non-empty compressed output")
	}

	got := decompressZstd(t, buf.Bytes())
	if !bytes.Equal(original, got) {
		t.Errorf("round-trip mismatch: got %d bytes, want %d bytes", len(got), len(original))
	}
}

func TestZstdCompressor_BestSpeed_RoundTrip(t *testing.T) {
	original := []byte(sampleData())
	c := compress.NewZstdCompressor(zstd.SpeedFastest)

	var buf bytes.Buffer
	if err := c.Compress(bytes.NewReader(original), &buf); err != nil {
		t.Fatalf("Compress() error: %v", err)
	}

	got := decompressZstd(t, buf.Bytes())
	if !bytes.Equal(original, got) {
		t.Errorf("round-trip mismatch: got %d bytes, want %d bytes", len(got), len(original))
	}
}

func TestZstdCompressor_BestCompression_RoundTrip(t *testing.T) {
	original := []byte(sampleData())
	c := compress.NewZstdCompressor(zstd.SpeedBestCompression)

	var buf bytes.Buffer
	if err := c.Compress(bytes.NewReader(original), &buf); err != nil {
		t.Fatalf("Compress() error: %v", err)
	}

	got := decompressZstd(t, buf.Bytes())
	if !bytes.Equal(original, got) {
		t.Errorf("round-trip mismatch: got %d bytes, want %d bytes", len(got), len(original))
	}
}

func TestZstdCompressor_Extension(t *testing.T) {
	c := compress.NewZstdCompressor(zstd.SpeedDefault)
	if c.Extension() != ".zst" {
		t.Errorf("Extension() = %q, want %q", c.Extension(), ".zst")
	}
}

func TestNopCompressor_RoundTrip(t *testing.T) {
	original := []byte(sampleData())
	c := &compress.NopCompressor{}

	var buf bytes.Buffer
	if err := c.Compress(bytes.NewReader(original), &buf); err != nil {
		t.Fatalf("Compress() error: %v", err)
	}

	if !bytes.Equal(original, buf.Bytes()) {
		t.Errorf("nop compressor altered data: got %d bytes, want %d bytes", buf.Len(), len(original))
	}
}

func TestNopCompressor_Extension(t *testing.T) {
	c := &compress.NopCompressor{}
	if c.Extension() != "" {
		t.Errorf("Extension() = %q, want %q", c.Extension(), "")
	}
}

func TestNewCompressor_Gzip(t *testing.T) {
	c, err := compress.NewCompressor(compress.FormatGzip, 0)
	if err != nil {
		t.Fatalf("NewCompressor(gzip, 0) error: %v", err)
	}
	if c.Extension() != ".gz" {
		t.Errorf("Extension() = %q, want .gz", c.Extension())
	}

	original := []byte(sampleData())
	var buf bytes.Buffer
	if err := c.Compress(bytes.NewReader(original), &buf); err != nil {
		t.Fatalf("Compress() error: %v", err)
	}
	got := decompressGzip(t, buf.Bytes())
	if !bytes.Equal(original, got) {
		t.Error("round-trip failed for NewCompressor(gzip)")
	}
}

func TestNewCompressor_Zstd(t *testing.T) {
	c, err := compress.NewCompressor(compress.FormatZstd, 0)
	if err != nil {
		t.Fatalf("NewCompressor(zstd, 0) error: %v", err)
	}
	if c.Extension() != ".zst" {
		t.Errorf("Extension() = %q, want .zst", c.Extension())
	}

	original := []byte(sampleData())
	var buf bytes.Buffer
	if err := c.Compress(bytes.NewReader(original), &buf); err != nil {
		t.Fatalf("Compress() error: %v", err)
	}
	got := decompressZstd(t, buf.Bytes())
	if !bytes.Equal(original, got) {
		t.Error("round-trip failed for NewCompressor(zstd)")
	}
}

func TestNewCompressor_None(t *testing.T) {
	c, err := compress.NewCompressor(compress.FormatNone, 0)
	if err != nil {
		t.Fatalf("NewCompressor(none, 0) error: %v", err)
	}
	if c.Extension() != "" {
		t.Errorf("Extension() = %q, want \"\"", c.Extension())
	}

	original := []byte(sampleData())
	var buf bytes.Buffer
	if err := c.Compress(bytes.NewReader(original), &buf); err != nil {
		t.Fatalf("Compress() error: %v", err)
	}
	if !bytes.Equal(original, buf.Bytes()) {
		t.Error("nop passthrough failed for NewCompressor(none)")
	}
}

func TestNewCompressor_UnknownFormat(t *testing.T) {
	_, err := compress.NewCompressor("brotli", 0)
	if err == nil {
		t.Error("expected error for unknown format, got nil")
	}
}

func TestNewCompressor_InvalidGzipLevel(t *testing.T) {
	_, err := compress.NewCompressor(compress.FormatGzip, 99)
	if err == nil {
		t.Error("expected error for invalid gzip level, got nil")
	}
}

func TestGzipCompressor_EmptyInput(t *testing.T) {
	c := compress.NewGzipCompressor(gzip.DefaultCompression)
	var buf bytes.Buffer
	if err := c.Compress(bytes.NewReader([]byte{}), &buf); err != nil {
		t.Fatalf("Compress(empty) error: %v", err)
	}
	got := decompressGzip(t, buf.Bytes())
	if len(got) != 0 {
		t.Errorf("expected empty decompressed output, got %d bytes", len(got))
	}
}

func TestZstdCompressor_EmptyInput(t *testing.T) {
	c := compress.NewZstdCompressor(zstd.SpeedDefault)
	var buf bytes.Buffer
	if err := c.Compress(bytes.NewReader([]byte{}), &buf); err != nil {
		t.Fatalf("Compress(empty) error: %v", err)
	}
	got := decompressZstd(t, buf.Bytes())
	if len(got) != 0 {
		t.Errorf("expected empty decompressed output, got %d bytes", len(got))
	}
}