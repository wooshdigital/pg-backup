package compress_test

import (
	"bytes"
	"compress/gzip"
	"io"
	"strings"
	"testing"

	"github.com/klauspost/compress/zstd"

	"github.com/yourusername/pg-dump-worker/internal/compress"
)

// sampleData returns a moderately compressible payload.
func sampleData() string {
	base := "The quick brown fox jumps over the lazy dog. "
	var sb strings.Builder
	for i := 0; i < 2000; i++ {
		sb.WriteString(base)
	}
	return sb.String()
}

// --- GzipCompressor ---

func TestGzipCompressor_RoundTrip(t *testing.T) {
	original := []byte(sampleData())

	var compressed bytes.Buffer
	c := compress.NewGzipCompressor(gzip.DefaultCompression)
	if err := c.Compress(bytes.NewReader(original), &compressed); err != nil {
		t.Fatalf("Compress: %v", err)
	}

	// Decompress manually.
	r, err := gzip.NewReader(&compressed)
	if err != nil {
		t.Fatalf("gzip.NewReader: %v", err)
	}
	got, err := io.ReadAll(r)
	if err != nil {
		t.Fatalf("ReadAll: %v", err)
	}
	if err := r.Close(); err != nil {
		t.Fatalf("gzip.Reader.Close: %v", err)
	}

	if !bytes.Equal(original, got) {
		t.Errorf("round-trip mismatch: len(original)=%d len(got)=%d", len(original), len(got))
	}
}

func TestGzipCompressor_Extension(t *testing.T) {
	c := compress.NewGzipCompressor(gzip.DefaultCompression)
	if got := c.Extension(); got != ".gz" {
		t.Errorf("Extension() = %q, want %q", got, ".gz")
	}
}

func TestGzipCompressor_LevelsRoundTrip(t *testing.T) {
	levels := []int{gzip.BestSpeed, gzip.BestCompression, gzip.DefaultCompression}
	original := []byte(sampleData())

	for _, lvl := range levels {
		lvl := lvl
		t.Run("", func(t *testing.T) {
			var compressed bytes.Buffer
			c := compress.NewGzipCompressor(lvl)
			if err := c.Compress(bytes.NewReader(original), &compressed); err != nil {
				t.Fatalf("Compress level %d: %v", lvl, err)
			}
			r, err := gzip.NewReader(&compressed)
			if err != nil {
				t.Fatalf("gzip.NewReader: %v", err)
			}
			got, err := io.ReadAll(r)
			if err != nil {
				t.Fatalf("ReadAll: %v", err)
			}
			_ = r.Close()
			if !bytes.Equal(original, got) {
				t.Errorf("level %d round-trip mismatch", lvl)
			}
		})
	}
}

// --- ZstdCompressor ---

func TestZstdCompressor_RoundTrip(t *testing.T) {
	original := []byte(sampleData())

	var compressed bytes.Buffer
	c := compress.NewZstdCompressor(2)
	if err := c.Compress(bytes.NewReader(original), &compressed); err != nil {
		t.Fatalf("Compress: %v", err)
	}

	// Decompress manually.
	r, err := zstd.NewReader(&compressed)
	if err != nil {
		t.Fatalf("zstd.NewReader: %v", err)
	}
	got, err := io.ReadAll(r)
	r.Close()
	if err != nil {
		t.Fatalf("ReadAll: %v", err)
	}

	if !bytes.Equal(original, got) {
		t.Errorf("round-trip mismatch: len(original)=%d len(got)=%d", len(original), len(got))
	}
}

func TestZstdCompressor_Extension(t *testing.T) {
	c := compress.NewZstdCompressor(1)
	if got := c.Extension(); got != ".zst" {
		t.Errorf("Extension() = %q, want %q", got, ".zst")
	}
}

func TestZstdCompressor_LevelsRoundTrip(t *testing.T) {
	original := []byte(sampleData())

	for level := 1; level <= 4; level++ {
		level := level
		t.Run("", func(t *testing.T) {
			var compressed bytes.Buffer
			c := compress.NewZstdCompressor(level)
			if err := c.Compress(bytes.NewReader(original), &compressed); err != nil {
				t.Fatalf("Compress level %d: %v", level, err)
			}
			r, err := zstd.NewReader(&compressed)
			if err != nil {
				t.Fatalf("zstd.NewReader: %v", err)
			}
			got, err := io.ReadAll(r)
			r.Close()
			if err != nil {
				t.Fatalf("ReadAll level %d: %v", level, err)
			}
			if !bytes.Equal(original, got) {
				t.Errorf("level %d round-trip mismatch", level)
			}
		})
	}
}

// --- NoopCompressor ---

func TestNoopCompressor_RoundTrip(t *testing.T) {
	original := []byte(sampleData())

	var buf bytes.Buffer
	c := &compress.NoopCompressor{}
	if err := c.Compress(bytes.NewReader(original), &buf); err != nil {
		t.Fatalf("Compress: %v", err)
	}
	if !bytes.Equal(original, buf.Bytes()) {
		t.Errorf("noop compressor altered data")
	}
}

func TestNoopCompressor_Extension(t *testing.T) {
	c := &compress.NoopCompressor{}
	if got := c.Extension(); got != "" {
		t.Errorf("Extension() = %q, want %q", got, "")
	}
}

// --- Factory ---

func TestNewCompressor_Gzip(t *testing.T) {
	c, err := compress.NewCompressor(compress.Config{Format: "gzip", Level: 1})
	if err != nil {
		t.Fatalf("NewCompressor: %v", err)
	}
	if c.Extension() != ".gz" {
		t.Errorf("unexpected extension %q", c.Extension())
	}
}

func TestNewCompressor_Zstd(t *testing.T) {
	c, err := compress.NewCompressor(compress.Config{Format: "zstd", Level: 2})
	if err != nil {
		t.Fatalf("NewCompressor: %v", err)
	}
	if c.Extension() != ".zst" {
		t.Errorf("unexpected extension %q", c.Extension())
	}
}

func TestNewCompressor_None(t *testing.T) {
	c, err := compress.NewCompressor(compress.Config{Format: "none"})
	if err != nil {
		t.Fatalf("NewCompressor: %v", err)
	}
	if c.Extension() != "" {
		t.Errorf("unexpected extension %q", c.Extension())
	}
}

func TestNewCompressor_EmptyFormat(t *testing.T) {
	c, err := compress.NewCompressor(compress.Config{})
	if err != nil {
		t.Fatalf("NewCompressor: %v", err)
	}
	if c.Extension() != "" {
		t.Errorf("unexpected extension %q", c.Extension())
	}
}

func TestNewCompressor_UnknownFormat(t *testing.T) {
	_, err := compress.NewCompressor(compress.Config{Format: "bz2"})
	if err == nil {
		t.Fatal("expected error for unknown format, got nil")
	}
}