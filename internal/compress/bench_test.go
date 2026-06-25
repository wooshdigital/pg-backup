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

// generateDump returns a byte slice that approximates a realistic pg_dump
// output of roughly targetMB megabytes.
func generateDump(targetMB int) []byte {
	// Each "row" is a realistic INSERT statement (~120 bytes).
	row := "INSERT INTO trips (id, user_id, name, destination, created_at, currency, amount) " +
		"VALUES (1, 42, 'Summer holiday', 'Barcelona, Spain', '2026-06-01 09:00:00+00', 'EUR', 1234.56);\n"

	targetBytes := targetMB * 1024 * 1024
	repeats := targetBytes/len(row) + 1

	var sb strings.Builder
	sb.Grow(repeats * len(row))
	for i := 0; i < repeats; i++ {
		sb.WriteString(row)
	}

	return []byte(sb.String())
}

// bench is a helper that compresses data using c and discards the output.
func bench(b *testing.B, c compress.Compressor, data []byte) {
	b.Helper()
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		if err := c.Compress(bytes.NewReader(data), io.Discard); err != nil {
			b.Fatalf("Compress: %v", err)
		}
	}
	b.SetBytes(int64(len(data)))
}

// ---- 1 MB benchmarks -------------------------------------------------------

func BenchmarkGzip_BestSpeed_1MB(b *testing.B) {
	data := generateDump(1)
	bench(b, &compress.GzipCompressor{Level: gzip.BestSpeed}, data)
}

func BenchmarkGzip_Default_1MB(b *testing.B) {
	data := generateDump(1)
	bench(b, &compress.GzipCompressor{Level: gzip.DefaultCompression}, data)
}

func BenchmarkGzip_BestCompression_1MB(b *testing.B) {
	data := generateDump(1)
	bench(b, &compress.GzipCompressor{Level: gzip.BestCompression}, data)
}

func BenchmarkZstd_Fastest_1MB(b *testing.B) {
	data := generateDump(1)
	bench(b, &compress.ZstdCompressor{Level: zstd.SpeedFastest}, data)
}

func BenchmarkZstd_Default_1MB(b *testing.B) {
	data := generateDump(1)
	bench(b, &compress.ZstdCompressor{Level: zstd.SpeedDefault}, data)
}

func BenchmarkZstd_Better_1MB(b *testing.B) {
	data := generateDump(1)
	bench(b, &compress.ZstdCompressor{Level: zstd.SpeedBetterCompression}, data)
}

func BenchmarkZstd_Best_1MB(b *testing.B) {
	data := generateDump(1)
	bench(b, &compress.ZstdCompressor{Level: zstd.SpeedBestCompression}, data)
}

// ---- 10 MB benchmarks -------------------------------------------------------

func BenchmarkGzip_BestSpeed_10MB(b *testing.B) {
	data := generateDump(10)
	bench(b, &compress.GzipCompressor{Level: gzip.BestSpeed}, data)
}

func BenchmarkGzip_Default_10MB(b *testing.B) {
	data := generateDump(10)
	bench(b, &compress.GzipCompressor{Level: gzip.DefaultCompression}, data)
}

func BenchmarkGzip_BestCompression_10MB(b *testing.B) {
	data := generateDump(10)
	bench(b, &compress.GzipCompressor{Level: gzip.BestCompression}, data)
}

func BenchmarkZstd_Fastest_10MB(b *testing.B) {
	data := generateDump(10)
	bench(b, &compress.ZstdCompressor{Level: zstd.SpeedFastest}, data)
}

func BenchmarkZstd_Default_10MB(b *testing.B) {
	data := generateDump(10)
	bench(b, &compress.ZstdCompressor{Level: zstd.SpeedDefault}, data)
}

func BenchmarkZstd_Better_10MB(b *testing.B) {
	data := generateDump(10)
	bench(b, &compress.ZstdCompressor{Level: zstd.SpeedBetterCompression}, data)
}

func BenchmarkZstd_Best_10MB(b *testing.B) {
	data := generateDump(10)
	bench(b, &compress.ZstdCompressor{Level: zstd.SpeedBestCompression}, data)
}

// ---- 100 MB benchmarks -------------------------------------------------------

func BenchmarkGzip_BestSpeed_100MB(b *testing.B) {
	data := generateDump(100)
	bench(b, &compress.GzipCompressor{Level: gzip.BestSpeed}, data)
}

func BenchmarkGzip_Default_100MB(b *testing.B) {
	data := generateDump(100)
	bench(b, &compress.GzipCompressor{Level: gzip.DefaultCompression}, data)
}

func BenchmarkZstd_Fastest_100MB(b *testing.B) {
	data := generateDump(100)
	bench(b, &compress.ZstdCompressor{Level: zstd.SpeedFastest}, data)
}

func BenchmarkZstd_Default_100MB(b *testing.B) {
	data := generateDump(100)
	bench(b, &compress.ZstdCompressor{Level: zstd.SpeedDefault}, data)
}

func BenchmarkNop_100MB(b *testing.B) {
	data := generateDump(100)
	bench(b, &compress.NopCompressor{}, data)
}