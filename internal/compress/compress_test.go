package compress_test

import (
	"bytes"
	"compress/gzip"
	"io"
	"strings"
	"testing"

	"github.com/klauspost/compress/zstd"

	"github.com/your-org/your-repo/internal/compress"
)

const testPayload = `This is a test payload for compression round-trip tests.
It contains repeated data to make compression meaningful.
Repeated: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
Repeated: bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
Repeated: cccccccccccccccccccccccccccccccccccccccccccccccccccc
`

func TestGzipCompressor_RoundTrip(t *testing.T) {
	levels := []int{
		gzip.BestSpeed,
		gzip.DefaultCompression,
		gzip.BestCompression,
	}
	for _, level := range levels {
		level := level
		t.Run("level", func(t *testing.T) {
			c := compress.NewGzipCompressor(level)

			var compressed bytes.Buffer
			src := strings.NewReader(testPayload)
			if err := c.Compress(src, &compressed); err != nil {
				t.Fatalf("Compress: %v", err)
			}

			gr, err := gzip.NewReader(&compressed)
			if err != nil {
				t.Fatalf("gzip.NewReader: %v", err)
			}
			defer gr.Close()

			got, err := io.ReadAll(gr)
			if err != nil {
				t.Fatalf("ReadAll decompressed: %v", err)
			}

			if string(got) != testPayload {
				t.Errorf("round-trip mismatch:\ngot:  %q\nwant: %q", got, testPayload)
			}
		})
	}
}

func TestGzipCompressor_FileExtension(t *testing.T) {
	c := compress.NewGzipCompressor(gzip.DefaultCompression)
	if got := c.FileExtension(); got != ".gz" {
		t.Errorf("FileExtension = %q, want .gz", got)
	}
}

func TestZstdCompressor_RoundTrip(t *testing.T) {
	levels := []zstd.EncoderLevel{
		zstd.SpeedFastest,
		zstd.SpeedDefault,
		zstd.SpeedBestCompression,
	}
	for _, level := range levels {
		level := level
		t.Run("level", func(t *testing.T) {
			c := compress.NewZstdCompressor(level)

			var compressed bytes.Buffer
			src := strings.NewReader(testPayload)
			if err := c.Compress(src, &compressed); err != nil {
				t.Fatalf("Compress: %v", err)
			}

			dec, err := zstd.NewReader(&compressed)
			if err != nil {
				t.Fatalf("zstd.NewReader: %v", err)
			}
			defer dec.Close()

			got, err := io.ReadAll(dec)
			if err != nil {
				t.Fatalf("ReadAll decompressed: %v", err)
			}

			if string(got) != testPayload {
				t.Errorf("round-trip mismatch:\ngot:  %q\nwant: %q", got, testPayload)
			}
		})
	}
}

func TestZstdCompressor_FileExtension(t *testing.T) {
	c := compress.NewZstdCompressor(zstd.SpeedDefault)
	if got := c.FileExtension(); got != ".zst" {
		t.Errorf("FileExtension = %q, want .zst", got)
	}
}

func TestNoopCompressor_RoundTrip(t *testing.T) {
	c := &compress.NoopCompressor{}

	var buf bytes.Buffer
	src := strings.NewReader(testPayload)
	if err := c.Compress(src, &buf); err != nil {
		t.Fatalf("Compress: %v", err)
	}

	if buf.String() != testPayload {
		t.Errorf("noop mismatch:\ngot:  %q\nwant: %q", buf.String(), testPayload)
	}
}

func TestNoopCompressor_FileExtension(t *testing.T) {
	c := &compress.NoopCompressor{}
	if got := c.FileExtension(); got != "" {
		t.Errorf("FileExtension = %q, want empty string", got)
	}
}

func TestNewCompressor_Gzip(t *testing.T) {
	c, err := compress.NewCompressor(compress.Config{Format: compress.FormatGzip})
	if err != nil {
		t.Fatalf("NewCompressor: %v", err)
	}
	if c.FileExtension() != ".gz" {
		t.Errorf("expected .gz extension, got %q", c.FileExtension())
	}
}

func TestNewCompressor_Zstd(t *testing.T) {
	c, err := compress.NewCompressor(compress.Config{Format: compress.FormatZstd})
	if err != nil {
		t.Fatalf("NewCompressor: %v", err)
	}
	if c.FileExtension() != ".zst" {
		t.Errorf("expected .zst extension, got %q", c.FileExtension())
	}
}

func TestNewCompressor_None(t *testing.T) {
	c, err := compress.NewCompressor(compress.Config{Format: compress.FormatNone})
	if err != nil {
		t.Fatalf("NewCompressor: %v", err)
	}
	if c.FileExtension() != "" {
		t.Errorf("expected empty extension, got %q", c.FileExtension())
	}
}

func TestNewCompressor_Unknown(t *testing.T) {
	_, err := compress.NewCompressor(compress.Config{Format: "lzma"})
	if err == nil {
		t.Error("expected error for unknown format, got nil")
	}
}

func TestNewCompressor_DefaultFormat(t *testing.T) {
	// Empty format should default to gzip
	c, err := compress.NewCompressor(compress.Config{})
	if err != nil {
		t.Fatalf("NewCompressor: %v", err)
	}
	if c.FileExtension() != ".gz" {
		t.Errorf("expected .gz for default format, got %q", c.FileExtension())
	}
}