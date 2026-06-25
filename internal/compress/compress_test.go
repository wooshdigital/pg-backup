package compress_test

import (
	"bytes"
	"compress/gzip"
	"io"
	"strings"
	"testing"

	"github.com/klauspost/compress/zstd"

	"github.com/example/pgdumpworker/internal/compress"
)

// roundTrip compresses input with c, then decompresses it using decompress,
// and asserts that the result equals input.
func roundTrip(t *testing.T, c compress.Compressor, decompress func(r io.Reader) ([]byte, error), input string) {
	t.Helper()

	var buf bytes.Buffer
	if err := c.Compress(strings.NewReader(input), &buf); err != nil {
		t.Fatalf("Compress returned error: %v", err)
	}

	got, err := decompress(&buf)
	if err != nil {
		t.Fatalf("decompress returned error: %v", err)
	}

	if string(got) != input {
		t.Errorf("round-trip mismatch:\n  want %q\n   got %q", input, string(got))
	}
}

func gzipDecompress(r io.Reader) ([]byte, error) {
	gr, err := gzip.NewReader(r)
	if err != nil {
		return nil, err
	}
	defer gr.Close()
	return io.ReadAll(gr)
}

func zstdDecompress(r io.Reader) ([]byte, error) {
	dec, err := zstd.NewReader(r)
	if err != nil {
		return nil, err
	}
	defer dec.Close()
	return io.ReadAll(dec)
}

const sampleSQL = `
-- PostgreSQL dump
CREATE TABLE trips (
    id   SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);
INSERT INTO trips (name) VALUES ('Paris'), ('Tokyo'), ('New York');
`

func TestNopCompressor_RoundTrip(t *testing.T) {
	c := &compress.NopCompressor{}
	if ext := c.Extension(); ext != "" {
		t.Errorf("Extension() = %q, want \"\"", ext)
	}

	var buf bytes.Buffer
	if err := c.Compress(strings.NewReader(sampleSQL), &buf); err != nil {
		t.Fatalf("Compress: %v", err)
	}
	if buf.String() != sampleSQL {
		t.Error("NopCompressor modified data")
	}
}

func TestGzipCompressor_RoundTrip(t *testing.T) {
	levels := []int{
		gzip.DefaultCompression,
		gzip.BestSpeed,
		gzip.BestCompression,
		1, 5, 9,
	}

	for _, lvl := range levels {
		lvl := lvl
		t.Run("", func(t *testing.T) {
			c := &compress.GzipCompressor{Level: lvl}
			if ext := c.Extension(); ext != ".gz" {
				t.Errorf("Extension() = %q, want \".gz\"", ext)
			}
			roundTrip(t, c, gzipDecompress, sampleSQL)
		})
	}
}

func TestGzipCompressor_EmptyInput(t *testing.T) {
	c := &compress.GzipCompressor{Level: gzip.DefaultCompression}
	roundTrip(t, c, gzipDecompress, "")
}

func TestGzipCompressor_LargeInput(t *testing.T) {
	large := strings.Repeat(sampleSQL, 10_000)
	c := &compress.GzipCompressor{Level: gzip.DefaultCompression}
	roundTrip(t, c, gzipDecompress, large)
}

func TestZstdCompressor_RoundTrip(t *testing.T) {
	levels := []zstd.EncoderLevel{
		zstd.SpeedFastest,
		zstd.SpeedDefault,
		zstd.SpeedBetterCompression,
		zstd.SpeedBestCompression,
	}

	for _, lvl := range levels {
		lvl := lvl
		t.Run("", func(t *testing.T) {
			c := &compress.ZstdCompressor{Level: lvl}
			if ext := c.Extension(); ext != ".zst" {
				t.Errorf("Extension() = %q, want \".zst\"", ext)
			}
			roundTrip(t, c, zstdDecompress, sampleSQL)
		})
	}
}

func TestZstdCompressor_EmptyInput(t *testing.T) {
	c := &compress.ZstdCompressor{Level: zstd.SpeedDefault}
	roundTrip(t, c, zstdDecompress, "")
}

func TestZstdCompressor_LargeInput(t *testing.T) {
	large := strings.Repeat(sampleSQL, 10_000)
	c := &compress.ZstdCompressor{Level: zstd.SpeedDefault}
	roundTrip(t, c, zstdDecompress, large)
}

func TestNewCompressor_Formats(t *testing.T) {
	cases := []struct {
		format    compress.Format
		level     int
		wantExt   string
		wantError bool
	}{
		{compress.FormatNone, 0, "", false},
		{"", 0, "", false},
		{compress.FormatGzip, 0, ".gz", false},
		{compress.FormatGzip, gzip.BestSpeed, ".gz", false},
		{compress.FormatZstd, 0, ".zst", false},
		{compress.FormatZstd, 3, ".zst", false},
		{"bogus", 0, "", true},
	}

	for _, tc := range cases {
		c, err := compress.NewCompressor(compress.Config{Format: tc.format, Level: tc.level})
		if tc.wantError {
			if err == nil {
				t.Errorf("NewCompressor(%q) expected error, got nil", tc.format)
			}
			continue
		}
		if err != nil {
			t.Errorf("NewCompressor(%q): unexpected error: %v", tc.format, err)
			continue
		}
		if got := c.Extension(); got != tc.wantExt {
			t.Errorf("NewCompressor(%q).Extension() = %q, want %q", tc.format, got, tc.wantExt)
		}
	}
}