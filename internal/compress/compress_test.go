package compress_test

import (
	"bytes"
	"compress/gzip"
	"io"
	"strings"
	"testing"

	"github.com/klauspost/compress/zstd"

	"github.com/example/worker/internal/compress"
)

const testData = `-- PostgreSQL database dump
-- Dumped from database version 15.3
-- Dumped by pg_dump version 15.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

CREATE TABLE public.users (
    id bigint NOT NULL,
    email text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

INSERT INTO public.users VALUES (1, 'alice@example.com', '2024-01-01 00:00:00+00');
INSERT INTO public.users VALUES (2, 'bob@example.com', '2024-01-02 00:00:00+00');
INSERT INTO public.users VALUES (3, 'carol@example.com', '2024-01-03 00:00:00+00');
`

func TestGzipCompressor_RoundTrip(t *testing.T) {
	levels := []int{
		gzip.BestSpeed,
		gzip.DefaultCompression,
		gzip.BestCompression,
	}

	for _, level := range levels {
		t.Run("", func(t *testing.T) {
			c, err := compress.NewGzipCompressor(level)
			if err != nil {
				t.Fatalf("NewGzipCompressor(%d): %v", level, err)
			}

			var buf bytes.Buffer
			src := strings.NewReader(testData)

			if err := c.Compress(src, &buf); err != nil {
				t.Fatalf("Compress: %v", err)
			}

			// Decompress and verify
			r, err := gzip.NewReader(&buf)
			if err != nil {
				t.Fatalf("gzip.NewReader: %v", err)
			}
			defer r.Close()

			got, err := io.ReadAll(r)
			if err != nil {
				t.Fatalf("reading decompressed data: %v", err)
			}

			if string(got) != testData {
				t.Errorf("round-trip mismatch:\ngot:  %q\nwant: %q", string(got), testData)
			}
		})
	}
}

func TestGzipCompressor_FileExtension(t *testing.T) {
	c, _ := compress.NewGzipCompressor(gzip.DefaultCompression)
	if ext := c.FileExtension(); ext != ".gz" {
		t.Errorf("FileExtension() = %q, want %q", ext, ".gz")
	}
}

func TestGzipCompressor_InvalidLevel(t *testing.T) {
	_, err := compress.NewGzipCompressor(99)
	if err == nil {
		t.Error("expected error for invalid compression level, got nil")
	}
}

func TestZstdCompressor_RoundTrip(t *testing.T) {
	levels := []int{1, 2, 3, 4}

	for _, level := range levels {
		t.Run("", func(t *testing.T) {
			c, err := compress.NewZstdCompressor(level)
			if err != nil {
				t.Fatalf("NewZstdCompressor(%d): %v", level, err)
			}

			var buf bytes.Buffer
			src := strings.NewReader(testData)

			if err := c.Compress(src, &buf); err != nil {
				t.Fatalf("Compress: %v", err)
			}

			// Decompress and verify
			r, err := zstd.NewReader(&buf)
			if err != nil {
				t.Fatalf("zstd.NewReader: %v", err)
			}
			defer r.Close()

			got, err := io.ReadAll(r)
			if err != nil {
				t.Fatalf("reading decompressed data: %v", err)
			}

			if string(got) != testData {
				t.Errorf("round-trip mismatch:\ngot:  %q\nwant: %q", string(got), testData)
			}
		})
	}
}

func TestZstdCompressor_FileExtension(t *testing.T) {
	c, _ := compress.NewZstdCompressor(2)
	if ext := c.FileExtension(); ext != ".zst" {
		t.Errorf("FileExtension() = %q, want %q", ext, ".zst")
	}
}

func TestNoOpCompressor_RoundTrip(t *testing.T) {
	c := &compress.NoOpCompressor{}

	var buf bytes.Buffer
	src := strings.NewReader(testData)

	if err := c.Compress(src, &buf); err != nil {
		t.Fatalf("Compress: %v", err)
	}

	if buf.String() != testData {
		t.Errorf("NoOpCompressor modified data:\ngot:  %q\nwant: %q", buf.String(), testData)
	}
}

func TestNoOpCompressor_FileExtension(t *testing.T) {
	c := &compress.NoOpCompressor{}
	if ext := c.FileExtension(); ext != "" {
		t.Errorf("FileExtension() = %q, want %q", ext, "")
	}
}

func TestNewCompressor_Gzip(t *testing.T) {
	c, err := compress.NewCompressor(compress.FormatGzip, 0)
	if err != nil {
		t.Fatalf("NewCompressor(gzip): %v", err)
	}
	if c.FileExtension() != ".gz" {
		t.Errorf("expected .gz extension, got %q", c.FileExtension())
	}
}

func TestNewCompressor_Zstd(t *testing.T) {
	c, err := compress.NewCompressor(compress.FormatZstd, 2)
	if err != nil {
		t.Fatalf("NewCompressor(zstd): %v", err)
	}
	if c.FileExtension() != ".zst" {
		t.Errorf("expected .zst extension, got %q", c.FileExtension())
	}
}

func TestNewCompressor_None(t *testing.T) {
	c, err := compress.NewCompressor(compress.FormatNone, 0)
	if err != nil {
		t.Fatalf("NewCompressor(none): %v", err)
	}
	if c.FileExtension() != "" {
		t.Errorf("expected empty extension, got %q", c.FileExtension())
	}
}

func TestNewCompressor_Unknown(t *testing.T) {
	_, err := compress.NewCompressor("brotli", 0)
	if err == nil {
		t.Error("expected error for unknown format, got nil")
	}
}

func TestCompressor_LargeInput(t *testing.T) {
	// Build a larger input to test streaming behaviour
	var sb strings.Builder
	for i := 0; i < 10000; i++ {
		sb.WriteString(testData)
	}
	large := sb.String()

	compressors := []struct {
		name string
		c    compress.Compressor
	}{
		{"gzip", mustGzip(t)},
		{"zstd", mustZstd(t)},
		{"none", &compress.NoOpCompressor{}},
	}

	for _, tc := range compressors {
		t.Run(tc.name, func(t *testing.T) {
			var compressed bytes.Buffer
			if err := tc.c.Compress(strings.NewReader(large), &compressed); err != nil {
				t.Fatalf("Compress: %v", err)
			}

			// Decompress
			decompressed := decompressData(t, tc.name, &compressed)
			if decompressed != large {
				t.Errorf("round-trip failed for %s: lengths differ (got %d, want %d)",
					tc.name, len(decompressed), len(large))
			}
		})
	}
}

func mustGzip(t *testing.T) compress.Compressor {
	t.Helper()
	c, err := compress.NewGzipCompressor(gzip.DefaultCompression)
	if err != nil {
		t.Fatalf("NewGzipCompressor: %v", err)
	}
	return c
}

func mustZstd(t *testing.T) compress.Compressor {
	t.Helper()
	c, err := compress.NewZstdCompressor(2)
	if err != nil {
		t.Fatalf("NewZstdCompressor: %v", err)
	}
	return c
}

func decompressData(t *testing.T, format string, r io.Reader) string {
	t.Helper()
	switch format {
	case "gzip":
		gr, err := gzip.NewReader(r)
		if err != nil {
			t.Fatalf("gzip.NewReader: %v", err)
		}
		defer gr.Close()
		data, err := io.ReadAll(gr)
		if err != nil {
			t.Fatalf("reading gzip: %v", err)
		}
		return string(data)
	case "zstd":
		zr, err := zstd.NewReader(r)
		if err != nil {
			t.Fatalf("zstd.NewReader: %v", err)
		}
		defer zr.Close()
		data, err := io.ReadAll(zr)
		if err != nil {
			t.Fatalf("reading zstd: %v", err)
		}
		return string(data)
	case "none":
		data, err := io.ReadAll(r)
		if err != nil {
			t.Fatalf("reading none: %v", err)
		}
		return string(data)
	default:
		t.Fatalf("unknown format: %s", format)
		return ""
	}
}