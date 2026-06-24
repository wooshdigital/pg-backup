package compress_test

import (
	"bytes"
	"compress/gzip"
	"io"
	"strings"
	"testing"

	"github.com/klauspost/compress/zstd"

	"github.com/example/myapp/internal/compress"
)

// testData returns a sample payload large enough to be meaningful for compression.
func testData() string {
	var sb strings.Builder
	line := "INSERT INTO trips (id, name, destination, start_date, end_date, notes) VALUES "
	for i := 0; i < 1000; i++ {
		sb.WriteString(line)
		sb.WriteString("(1, 'Trip Name', 'Some Destination', '2026-01-01', '2026-01-15', 'Some notes about the trip here.');\n")
	}
	return sb.String()
}

func TestGzipCompressor_RoundTrip(t *testing.T) {
	original := testData()

	// Compress
	var compressed bytes.Buffer
	c, err := compress.NewGzipCompressor(gzip.DefaultCompression)
	if err != nil {
		t.Fatalf("NewGzipCompressor: %v", err)
	}
	if err := c.Compress(strings.NewReader(original), &compressed); err != nil {
		t.Fatalf("Compress: %v", err)
	}

	// Decompress
	r, err := gzip.NewReader(&compressed)
	if err != nil {
		t.Fatalf("gzip.NewReader: %v", err)
	}
	defer r.Close()

	decompressed, err := io.ReadAll(r)
	if err != nil {
		t.Fatalf("ReadAll decompressed: %v", err)
	}

	if string(decompressed) != original {
		t.Errorf("round-trip mismatch: got %d bytes, want %d bytes", len(decompressed), len(original))
	}
}

func TestGzipCompressor_AllLevels(t *testing.T) {
	original := testData()
	levels := []int{
		gzip.BestSpeed,
		gzip.DefaultCompression,
		gzip.BestCompression,
	}

	for _, level := range levels {
		level := level
		t.Run("", func(t *testing.T) {
			var compressed bytes.Buffer
			c, err := compress.NewGzipCompressor(level)
			if err != nil {
				t.Fatalf("NewGzipCompressor(level=%d): %v", level, err)
			}
			if err := c.Compress(strings.NewReader(original), &compressed); err != nil {
				t.Fatalf("Compress: %v", err)
			}

			r, err := gzip.NewReader(&compressed)
			if err != nil {
				t.Fatalf("gzip.NewReader: %v", err)
			}
			defer r.Close()

			decompressed, err := io.ReadAll(r)
			if err != nil {
				t.Fatalf("ReadAll: %v", err)
			}
			if string(decompressed) != original {
				t.Errorf("round-trip mismatch at level %d", level)
			}
		})
	}
}

func TestGzipCompressor_InvalidLevel(t *testing.T) {
	_, err := compress.NewGzipCompressor(100)
	if err == nil {
		t.Error("expected error for invalid gzip level, got nil")
	}
}

func TestGzipCompressor_Extension(t *testing.T) {
	c, _ := compress.NewGzipCompressor(gzip.DefaultCompression)
	if got := c.Extension(); got != ".gz" {
		t.Errorf("Extension() = %q, want %q", got, ".gz")
	}
}

func TestZstdCompressor_RoundTrip(t *testing.T) {
	original := testData()

	// Compress
	var compressed bytes.Buffer
	c, err := compress.NewZstdCompressor(2)
	if err != nil {
		t.Fatalf("NewZstdCompressor: %v", err)
	}
	if err := c.Compress(strings.NewReader(original), &compressed); err != nil {
		t.Fatalf("Compress: %v", err)
	}

	// Decompress
	r, err := zstd.NewReader(&compressed)
	if err != nil {
		t.Fatalf("zstd.NewReader: %v", err)
	}
	defer r.Close()

	decompressed, err := io.ReadAll(r)
	if err != nil {
		t.Fatalf("ReadAll decompressed: %v", err)
	}

	if string(decompressed) != original {
		t.Errorf("round-trip mismatch: got %d bytes, want %d bytes", len(decompressed), len(original))
	}
}

func TestZstdCompressor_AllLevels(t *testing.T) {
	original := testData()

	for level := 1; level <= 4; level++ {
		level := level
		t.Run("", func(t *testing.T) {
			var compressed bytes.Buffer
			c, err := compress.NewZstdCompressor(level)
			if err != nil {
				t.Fatalf("NewZstdCompressor(level=%d): %v", level, err)
			}
			if err := c.Compress(strings.NewReader(original), &compressed); err != nil {
				t.Fatalf("Compress: %v", err)
			}

			r, err := zstd.NewReader(&compressed)
			if err != nil {
				t.Fatalf("zstd.NewReader: %v", err)
			}
			defer r.Close()

			decompressed, err := io.ReadAll(r)
			if err != nil {
				t.Fatalf("ReadAll: %v", err)
			}
			if string(decompressed) != original {
				t.Errorf("round-trip mismatch at level %d", level)
			}
		})
	}
}

func TestZstdCompressor_Extension(t *testing.T) {
	c, _ := compress.NewZstdCompressor(2)
	if got := c.Extension(); got != ".zst" {
		t.Errorf("Extension() = %q, want %q", got, ".zst")
	}
}

func TestNoopCompressor_RoundTrip(t *testing.T) {
	original := testData()

	var buf bytes.Buffer
	c := &compress.NoopCompressor{}
	if err := c.Compress(strings.NewReader(original), &buf); err != nil {
		t.Fatalf("Compress: %v", err)
	}

	if buf.String() != original {
		t.Errorf("noop compressor changed data: got %d bytes, want %d bytes", buf.Len(), len(original))
	}
}

func TestNoopCompressor_Extension(t *testing.T) {
	c := &compress.NoopCompressor{}
	if got := c.Extension(); got != "" {
		t.Errorf("Extension() = %q, want %q", got, "")
	}
}

func TestNewCompressor_Gzip(t *testing.T) {
	c, err := compress.NewCompressor(compress.FormatGzip, gzip.DefaultCompression)
	if err != nil {
		t.Fatalf("NewCompressor(gzip): %v", err)
	}
	if c.Extension() != ".gz" {
		t.Errorf("expected .gz extension, got %q", c.Extension())
	}
}

func TestNewCompressor_Zstd(t *testing.T) {
	c, err := compress.NewCompressor(compress.FormatZstd, 2)
	if err != nil {
		t.Fatalf("NewCompressor(zstd): %v", err)
	}
	if c.Extension() != ".zst" {
		t.Errorf("expected .zst extension, got %q", c.Extension())
	}
}

func TestNewCompressor_None(t *testing.T) {
	c, err := compress.NewCompressor(compress.FormatNone, 0)
	if err != nil {
		t.Fatalf("NewCompressor(none): %v", err)
	}
	if c.Extension() != "" {
		t.Errorf("expected empty extension, got %q", c.Extension())
	}
}

func TestNewCompressor_Invalid(t *testing.T) {
	_, err := compress.NewCompressor("lz4", 0)
	if err == nil {
		t.Error("expected error for unsupported format, got nil")
	}
}