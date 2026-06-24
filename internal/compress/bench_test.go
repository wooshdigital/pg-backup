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

// generateDump creates a synthetic pg_dump-like payload of approximately the given size in bytes.
func generateDump(size int) []byte {
	// Simulate realistic pg_dump SQL output with repeated patterns
	chunk := `-- PostgreSQL database dump
-- Dumped from database version 15.3
-- Dumped by pg_dump version 15.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

CREATE TABLE public.users (
    id bigint NOT NULL,
    email character varying(255) NOT NULL,
    name character varying(255),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

INSERT INTO public.users (id, email, name, created_at, updated_at) VALUES
(1, 'alice@example.com', 'Alice Smith', '2024-01-01 00:00:00+00', '2024-01-01 00:00:00+00'),
(2, 'bob@example.com', 'Bob Jones', '2024-01-02 00:00:00+00', '2024-01-02 00:00:00+00'),
(3, 'charlie@example.com', 'Charlie Brown', '2024-01-03 00:00:00+00', '2024-01-03 00:00:00+00');

`
	var sb strings.Builder
	for sb.Len() < size {
		sb.WriteString(chunk)
	}
	result := sb.String()
	if len(result) > size {
		result = result[:size]
	}
	return []byte(result)
}

var dumpSizes = []struct {
	name string
	size int
}{
	{"1MB", 1 << 20},
	{"10MB", 10 << 20},
	{"50MB", 50 << 20},
}

func BenchmarkGzip_BestSpeed(b *testing.B) {
	for _, ds := range dumpSizes {
		ds := ds
		b.Run(ds.name, func(b *testing.B) {
			data := generateDump(ds.size)
			c := compress.NewGzipCompressor(gzip.BestSpeed)
			b.SetBytes(int64(len(data)))
			b.ResetTimer()
			for i := 0; i < b.N; i++ {
				if err := c.Compress(bytes.NewReader(data), io.Discard); err != nil {
					b.Fatal(err)
				}
			}
		})
	}
}

func BenchmarkGzip_DefaultCompression(b *testing.B) {
	for _, ds := range dumpSizes {
		ds := ds
		b.Run(ds.name, func(b *testing.B) {
			data := generateDump(ds.size)
			c := compress.NewGzipCompressor(gzip.DefaultCompression)
			b.SetBytes(int64(len(data)))
			b.ResetTimer()
			for i := 0; i < b.N; i++ {
				if err := c.Compress(bytes.NewReader(data), io.Discard); err != nil {
					b.Fatal(err)
				}
			}
		})
	}
}

func BenchmarkGzip_BestCompression(b *testing.B) {
	for _, ds := range dumpSizes {
		ds := ds
		b.Run(ds.name, func(b *testing.B) {
			data := generateDump(ds.size)
			c := compress.NewGzipCompressor(gzip.BestCompression)
			b.SetBytes(int64(len(data)))
			b.ResetTimer()
			for i := 0; i < b.N; i++ {
				if err := c.Compress(bytes.NewReader(data), io.Discard); err != nil {
					b.Fatal(err)
				}
			}
		})
	}
}

func BenchmarkZstd_SpeedFastest(b *testing.B) {
	for _, ds := range dumpSizes {
		ds := ds
		b.Run(ds.name, func(b *testing.B) {
			data := generateDump(ds.size)
			c := compress.NewZstdCompressor(zstd.SpeedFastest)
			b.SetBytes(int64(len(data)))
			b.ResetTimer()
			for i := 0; i < b.N; i++ {
				if err := c.Compress(bytes.NewReader(data), io.Discard); err != nil {
					b.Fatal(err)
				}
			}
		})
	}
}

func BenchmarkZstd_SpeedDefault(b *testing.B) {
	for _, ds := range dumpSizes {
		ds := ds
		b.Run(ds.name, func(b *testing.B) {
			data := generateDump(ds.size)
			c := compress.NewZstdCompressor(zstd.SpeedDefault)
			b.SetBytes(int64(len(data)))
			b.ResetTimer()
			for i := 0; i < b.N; i++ {
				if err := c.Compress(bytes.NewReader(data), io.Discard); err != nil {
					b.Fatal(err)
				}
			}
		})
	}
}

func BenchmarkZstd_SpeedBetterCompression(b *testing.B) {
	for _, ds := range dumpSizes {
		ds := ds
		b.Run(ds.name, func(b *testing.B) {
			data := generateDump(ds.size)
			c := compress.NewZstdCompressor(zstd.SpeedBetterCompression)
			b.SetBytes(int64(len(data)))
			b.ResetTimer()
			for i := 0; i < b.N; i++ {
				if err := c.Compress(bytes.NewReader(data), io.Discard); err != nil {
					b.Fatal(err)
				}
			}
		})
	}
}

func BenchmarkZstd_SpeedBestCompression(b *testing.B) {
	for _, ds := range dumpSizes {
		ds := ds
		b.Run(ds.name, func(b *testing.B) {
			data := generateDump(ds.size)
			c := compress.NewZstdCompressor(zstd.SpeedBestCompression)
			b.SetBytes(int64(len(data)))
			b.ResetTimer()
			for i := 0; i < b.N; i++ {
				if err := c.Compress(bytes.NewReader(data), io.Discard); err != nil {
					b.Fatal(err)
				}
			}
		})
	}
}

func BenchmarkNoop(b *testing.B) {
	for _, ds := range dumpSizes {
		ds := ds
		b.Run(ds.name, func(b *testing.B) {
			data := generateDump(ds.size)
			c := &compress.NoopCompressor{}
			b.SetBytes(int64(len(data)))
			b.ResetTimer()
			for i := 0; i < b.N; i++ {
				if err := c.Compress(bytes.NewReader(data), io.Discard); err != nil {
					b.Fatal(err)
				}
			}
		})
	}
}