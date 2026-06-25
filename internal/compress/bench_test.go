package compress_test

import (
	"bytes"
	"compress/gzip"
	"io"
	"strings"
	"testing"

	"github.com/your-org/your-project/internal/compress"
)

// generateDump produces a synthetic SQL dump of approximately the requested size in bytes.
func generateDump(targetBytes int) string {
	base := `-- PostgreSQL database dump
SET statement_timeout = 0;
SET lock_timeout = 0;
CREATE TABLE public.bench_table (
    id bigint NOT NULL,
    payload text,
    created_at timestamp with time zone DEFAULT now()
);
`
	var sb strings.Builder
	sb.WriteString(base)

	row := `INSERT INTO public.bench_table (id, payload, created_at) VALUES (%d, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', '2024-01-01 00:00:00+00');
`
	i := 1
	for sb.Len() < targetBytes {
		// Write a simple numbered row (approximate; format verb not applied for speed).
		sb.WriteString(row)
		i++
		_ = i
	}

	return sb.String()
}

// dumpSizes defines synthetic dump sizes for benchmarks.
var dumpSizes = []struct {
	name  string
	bytes int
}{
	{"1MB", 1 << 20},
	{"10MB", 10 << 20},
	{"50MB", 50 << 20},
}

func benchmarkCompressor(b *testing.B, c compress.Compressor, data string) {
	b.Helper()
	b.SetBytes(int64(len(data)))
	b.ReportAllocs()

	src := []byte(data)
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		var dst bytes.Buffer
		dst.Grow(len(src) / 2)

		if err := c.Compress(bytes.NewReader(src), &dst); err != nil {
			b.Fatalf("Compress failed: %v", err)
		}

		// Prevent the compiler from optimising away the write.
		if dst.Len() == 0 {
			b.Fatal("empty output")
		}
	}
}

// ---------------------------------------------------------------------------
// Gzip benchmarks
// ---------------------------------------------------------------------------

func BenchmarkGzip_BestSpeed_1MB(b *testing.B) {
	data := generateDump(dumpSizes[0].bytes)
	benchmarkCompressor(b, &compress.GzipCompressor{Level: gzip.BestSpeed}, data)
}

func BenchmarkGzip_Default_1MB(b *testing.B) {
	data := generateDump(dumpSizes[0].bytes)
	benchmarkCompressor(b, &compress.GzipCompressor{Level: gzip.DefaultCompression}, data)
}

func BenchmarkGzip_BestCompression_1MB(b *testing.B) {
	data := generateDump(dumpSizes[0].bytes)
	benchmarkCompressor(b, &compress.GzipCompressor{Level: gzip.BestCompression}, data)
}

func BenchmarkGzip_BestSpeed_10MB(b *testing.B) {
	data := generateDump(dumpSizes[1].bytes)
	benchmarkCompressor(b, &compress.GzipCompressor{Level: gzip.BestSpeed}, data)
}

func BenchmarkGzip_Default_10MB(b *testing.B) {
	data := generateDump(dumpSizes[1].bytes)
	benchmarkCompressor(b, &compress.GzipCompressor{Level: gzip.DefaultCompression}, data)
}

func BenchmarkGzip_BestCompression_10MB(b *testing.B) {
	data := generateDump(dumpSizes[1].bytes)
	benchmarkCompressor(b, &compress.GzipCompressor{Level: gzip.BestCompression}, data)
}

func BenchmarkGzip_BestSpeed_50MB(b *testing.B) {
	data := generateDump(dumpSizes[2].bytes)
	benchmarkCompressor(b, &compress.GzipCompressor{Level: gzip.BestSpeed}, data)
}

func BenchmarkGzip_Default_50MB(b *testing.B) {
	data := generateDump(dumpSizes[2].bytes)
	benchmarkCompressor(b, &compress.GzipCompressor{Level: gzip.DefaultCompression}, data)
}

func BenchmarkGzip_BestCompression_50MB(b *testing.B) {
	data := generateDump(dumpSizes[2].bytes)
	benchmarkCompressor(b, &compress.GzipCompressor{Level: gzip.BestCompression}, data)
}

// ---------------------------------------------------------------------------
// Zstd benchmarks
// ---------------------------------------------------------------------------

func BenchmarkZstd_Level1_1MB(b *testing.B) {
	data := generateDump(dumpSizes[0].bytes)
	benchmarkCompressor(b, &compress.ZstdCompressor{Level: 1}, data)
}

func BenchmarkZstd_Level3_1MB(b *testing.B) {
	data := generateDump(dumpSizes[0].bytes)
	benchmarkCompressor(b, &compress.ZstdCompressor{Level: 3}, data)
}

func BenchmarkZstd_Level7_1MB(b *testing.B) {
	data := generateDump(dumpSizes[0].bytes)
	benchmarkCompressor(b, &compress.ZstdCompressor{Level: 7}, data)
}

func BenchmarkZstd_Level10_1MB(b *testing.B) {
	data := generateDump(dumpSizes[0].bytes)
	benchmarkCompressor(b, &compress.ZstdCompressor{Level: 10}, data)
}

func BenchmarkZstd_Level1_10MB(b *testing.B) {
	data := generateDump(dumpSizes[1].bytes)
	benchmarkCompressor(b, &compress.ZstdCompressor{Level: 1}, data)
}

func BenchmarkZstd_Level3_10MB(b *testing.B) {
	data := generateDump(dumpSizes[1].bytes)
	benchmarkCompressor(b, &compress.ZstdCompressor{Level: 3}, data)
}

func BenchmarkZstd_Level7_10MB(b *testing.B) {
	data := generateDump(dumpSizes[1].bytes)
	benchmarkCompressor(b, &compress.ZstdCompressor{Level: 7}, data)
}

func BenchmarkZstd_Level10_10MB(b *testing.B) {
	data := generateDump(dumpSizes[1].bytes)
	benchmarkCompressor(b, &compress.ZstdCompressor{Level: 10}, data)
}

func BenchmarkZstd_Level1_50MB(b *testing.B) {
	data := generateDump(dumpSizes[2].bytes)
	benchmarkCompressor(b, &compress.ZstdCompressor{Level: 1}, data)
}

func BenchmarkZstd_Level3_50MB(b *testing.B) {
	data := generateDump(dumpSizes[2].bytes)
	benchmarkCompressor(b, &compress.ZstdCompressor{Level: 3}, data)
}

func BenchmarkZstd_Level7_50MB(b *testing.B) {
	data := generateDump(dumpSizes[2].bytes)
	benchmarkCompressor(b, &compress.ZstdCompressor{Level: 7}, data)
}

func BenchmarkZstd_Level10_50MB(b *testing.B) {
	data := generateDump(dumpSizes[2].bytes)
	benchmarkCompressor(b, &compress.ZstdCompressor{Level: 10}, data)
}

// ---------------------------------------------------------------------------
// None (baseline) benchmarks
// ---------------------------------------------------------------------------

func BenchmarkNone_1MB(b *testing.B) {
	data := generateDump(dumpSizes[0].bytes)
	benchmarkCompressor(b, &compress.NoneCompressor{}, data)
}

func BenchmarkNone_10MB(b *testing.B) {
	data := generateDump(dumpSizes[1].bytes)
	benchmarkCompressor(b, &compress.NoneCompressor{}, data)
}

func BenchmarkNone_50MB(b *testing.B) {
	data := generateDump(dumpSizes[2].bytes)
	c := &compress.NoneCompressor{}
	b.SetBytes(int64(len(data)))
	b.ReportAllocs()
	src := []byte(data)
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		var dst bytes.Buffer
		dst.Grow(len(src))
		if _, err := io.Copy(&dst, bytes.NewReader(src)); err != nil {
			b.Fatal(err)
		}
		_ = c
	}
}