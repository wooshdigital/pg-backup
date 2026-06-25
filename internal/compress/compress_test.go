package compress_test

import (
	"bytes"
	"compress/gzip"
	"io"
	"strings"
	"testing"

	"github.com/klauspost/compress/zstd"

	"github.com/sno6/gosane/internal/compress"
)

var testPayloads = []struct {
	name    string
	content string
}{
	{"empty", ""},
	{"small", "Hello, World!"},
	{"medium", strings.Repeat("The quick brown fox jumps over the lazy dog. ", 1000)},
	{"large", strings.Repeat("abcdefghijklmnopqrstuvwxyz0123456789\n", 10000)},
}

// roundTripGzip compresses then decompresses using gzip and asserts equality.
func roundTripGzip(t *testing.T, level int, input []byte) {
	t.Helper()

	c, err := compress.NewGzipCompressor(level)
	if err != nil {
		t.Fatalf("NewGzipCompressor(%d): %v", level, err)
	}

	var compressed bytes.Buffer
	if err := c.Compress(bytes.NewReader(input), &compressed); err != nil {
		t.Fatalf("Compress: %v", err)
	}

	gr, err := gzip.NewReader(&compressed)
	if err != nil {
		t.Fatalf("gzip.NewReader: %v", err)
	}
	defer gr.Close()

	got, err := io.ReadAll(gr)
	if err != nil {
		t.Fatalf("io.ReadAll: %v", err)
	}

	if !bytes.Equal(got, input) {
		t.Errorf("round-trip mismatch: got %d bytes, want %d bytes", len(got), len(input))
	}
}

// roundTripZstd compresses then decompresses using zstd and asserts equality.
func roundTripZstd(t *testing.T, level zstd.EncoderLevel, input []byte) {
	t.Helper()

	c, err := compress.NewZstdCompressor(level)
	if err != nil {
		t.Fatalf("NewZstdCompressor: %v", err)
	}

	var compressed bytes.Buffer
	if err := c.Compress(bytes.NewReader(input), &compressed); err != nil {
		t.Fatalf("Compress: %v", err)
	}

	dec, err := zstd.NewReader(&compressed)
	if err != nil {
		t.Fatalf("zstd.NewReader: %v", err)
	}
	defer dec.Close()

	got, err := io.ReadAll(dec)
	if err != nil {
		t.Fatalf("io.ReadAll: %v", err)
	}

	if !bytes.Equal(got, input) {
		t.Errorf("round-trip mismatch: got %d bytes, want %d bytes", len(got), len(input))
	}
}

func TestGzipCompressor_RoundTrip(t *testing.T) {
	levels := []int{
		gzip.BestSpeed,
		gzip.DefaultCompression,
		gzip.BestCompression,
	}

	for _, p := range testPayloads {
		for _, level := range levels {
			t.Run(p.name+"_level"+string(rune('0'+level)), func(t *testing.T) {
				roundTripGzip(t, level, []byte(p.content))
			})
		}
	}
}

func TestZstdCompressor_RoundTrip(t *testing.T) {
	levels := []zstd.EncoderLevel{
		zstd.SpeedFastest,
		zstd.SpeedDefault,
		zstd.SpeedBetterCompression,
		zstd.SpeedBestCompression,
	}

	for _, p := range testPayloads {
		for _, level := range levels {
			t.Run(p.name, func(t *testing.T) {
				roundTripZstd(t, level, []byte(p.content))
			})
		}
	}
}

func TestNopCompressor_RoundTrip(t *testing.T) {
	c := &compress.NopCompressor{}
	for _, p := range testPayloads {
		t.Run(p.name, func(t *testing.T) {
			input := []byte(p.content)
			var buf bytes.Buffer
			if err := c.Compress(bytes.NewReader(input), &buf); err != nil {
				t.Fatalf("Compress: %v", err)
			}
			if !bytes.Equal(buf.Bytes(), input) {
				t.Errorf("nop compressor modified data: got %d bytes, want %d bytes", buf.Len(), len(input))
			}
		})
	}
}

func TestNewCompressor_Factory(t *testing.T) {
	tests := []struct {
		name      string
		cfg       compress.Config
		wantExt   string
		wantError bool
	}{
		{
			name:    "gzip default",
			cfg:     compress.Config{Format: compress.FormatGzip},
			wantExt: ".gz",
		},
		{
			name:    "gzip level 9",
			cfg:     compress.Config{Format: compress.FormatGzip, Level: 9},
			wantExt: ".gz",
		},
		{
			name:    "zstd default",
			cfg:     compress.Config{Format: compress.FormatZstd},
			wantExt: ".zst",
		},
		{
			name:    "none",
			cfg:     compress.Config{Format: compress.FormatNone},
			wantExt: "",
		},
		{
			name:    "empty format (none)",
			cfg:     compress.Config{Format: ""},
			wantExt: "",
		},
		{
			name:      "unknown format",
			cfg:       compress.Config{Format: "brotli"},
			wantError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c, err := compress.NewCompressor(tt.cfg)
			if tt.wantError {
				if err == nil {
					t.Fatal("expected error, got nil")
				}
				return
			}
			if err != nil {
				t.Fatalf("NewCompressor: %v", err)
			}
			if got := c.Extension(); got != tt.wantExt {
				t.Errorf("Extension() = %q, want %q", got, tt.wantExt)
			}
		})
	}
}

func TestGzipCompressor_InvalidLevel(t *testing.T) {
	_, err := compress.NewGzipCompressor(100)
	if err == nil {
		t.Fatal("expected error for invalid gzip level, got nil")
	}
}