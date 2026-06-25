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

const testPayload = `-- PostgreSQL database dump
-- Dumped from database version 15.3
-- Dumped by pg_dump version 15.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';

CREATE TABLE public.users (
    id bigint NOT NULL,
    email text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

INSERT INTO public.users (id, email, created_at) VALUES
(1, 'alice@example.com', '2024-01-01 00:00:00+00'),
(2, 'bob@example.com', '2024-01-02 00:00:00+00'),
(3, 'carol@example.com', '2024-01-03 00:00:00+00');
`

func TestNoneCompressor_RoundTrip(t *testing.T) {
	c := &compress.NoneCompressor{}

	var buf bytes.Buffer
	src := strings.NewReader(testPayload)

	if err := c.Compress(src, &buf); err != nil {
		t.Fatalf("Compress failed: %v", err)
	}

	if buf.String() != testPayload {
		t.Fatalf("NoneCompressor output does not match input")
	}

	if ext := c.FileExtension(); ext != "" {
		t.Errorf("expected empty extension, got %q", ext)
	}
}

func TestGzipCompressor_RoundTrip(t *testing.T) {
	levels := []int{
		gzip.DefaultCompression,
		gzip.BestSpeed,
		gzip.BestCompression,
	}

	for _, level := range levels {
		level := level
		t.Run("", func(t *testing.T) {
			c := &compress.GzipCompressor{Level: level}

			var compressed bytes.Buffer
			if err := c.Compress(strings.NewReader(testPayload), &compressed); err != nil {
				t.Fatalf("Compress failed (level %d): %v", level, err)
			}

			if compressed.Len() == 0 {
				t.Fatal("compressed output is empty")
			}

			// Decompress and verify round-trip.
			r, err := gzip.NewReader(&compressed)
			if err != nil {
				t.Fatalf("gzip.NewReader failed: %v", err)
			}
			defer r.Close()

			got, err := io.ReadAll(r)
			if err != nil {
				t.Fatalf("read decompressed data failed: %v", err)
			}

			if string(got) != testPayload {
				t.Fatalf("round-trip mismatch:\nwant: %q\ngot:  %q", testPayload, string(got))
			}

			if ext := c.FileExtension(); ext != ".gz" {
				t.Errorf("expected extension .gz, got %q", ext)
			}
		})
	}
}

func TestGzipCompressor_DefaultLevel(t *testing.T) {
	// Level 0 should use gzip.DefaultCompression internally.
	c := &compress.GzipCompressor{Level: 0}

	var compressed bytes.Buffer
	if err := c.Compress(strings.NewReader(testPayload), &compressed); err != nil {
		t.Fatalf("Compress failed: %v", err)
	}

	r, err := gzip.NewReader(&compressed)
	if err != nil {
		t.Fatalf("gzip.NewReader failed: %v", err)
	}
	defer r.Close()

	got, err := io.ReadAll(r)
	if err != nil {
		t.Fatalf("read failed: %v", err)
	}

	if string(got) != testPayload {
		t.Fatalf("round-trip mismatch")
	}
}

func TestZstdCompressor_RoundTrip(t *testing.T) {
	levels := []int{0, 1, 3, 7, 10}

	for _, level := range levels {
		level := level
		t.Run("", func(t *testing.T) {
			c := &compress.ZstdCompressor{Level: level}

			var compressed bytes.Buffer
			if err := c.Compress(strings.NewReader(testPayload), &compressed); err != nil {
				t.Fatalf("Compress failed (level %d): %v", level, err)
			}

			if compressed.Len() == 0 {
				t.Fatal("compressed output is empty")
			}

			// Decompress and verify round-trip.
			dec, err := zstd.NewReader(&compressed)
			if err != nil {
				t.Fatalf("zstd.NewReader failed: %v", err)
			}
			defer dec.Close()

			got, err := io.ReadAll(dec)
			if err != nil {
				t.Fatalf("read decompressed data failed: %v", err)
			}

			if string(got) != testPayload {
				t.Fatalf("round-trip mismatch (level %d):\nwant: %q\ngot:  %q", level, testPayload, string(got))
			}

			if ext := c.FileExtension(); ext != ".zst" {
				t.Errorf("expected extension .zst, got %q", ext)
			}
		})
	}
}

func TestGzipCompressor_EmptyInput(t *testing.T) {
	c := &compress.GzipCompressor{Level: gzip.DefaultCompression}
	var buf bytes.Buffer
	if err := c.Compress(strings.NewReader(""), &buf); err != nil {
		t.Fatalf("Compress of empty input failed: %v", err)
	}

	r, err := gzip.NewReader(&buf)
	if err != nil {
		t.Fatalf("gzip.NewReader failed: %v", err)
	}
	defer r.Close()

	got, err := io.ReadAll(r)
	if err != nil {
		t.Fatalf("read failed: %v", err)
	}

	if len(got) != 0 {
		t.Fatalf("expected empty output, got %q", got)
	}
}

func TestZstdCompressor_EmptyInput(t *testing.T) {
	c := &compress.ZstdCompressor{Level: 0}
	var buf bytes.Buffer
	if err := c.Compress(strings.NewReader(""), &buf); err != nil {
		t.Fatalf("Compress of empty input failed: %v", err)
	}

	dec, err := zstd.NewReader(&buf)
	if err != nil {
		t.Fatalf("zstd.NewReader failed: %v", err)
	}
	defer dec.Close()

	got, err := io.ReadAll(dec)
	if err != nil {
		t.Fatalf("read failed: %v", err)
	}

	if len(got) != 0 {
		t.Fatalf("expected empty output, got %q", got)
	}
}