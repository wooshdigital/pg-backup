package compress_test

import (
	"bytes"
	"compress/gzip"
	"io"
	"strings"
	"testing"

	"github.com/example/myapp/internal/compress"
)

// generateDumpData generates a realistic pg_dump-like payload of approximately `sizeMB` megabytes.
func generateDumpData(sizeMB int) []byte {
	// Simulate a realistic pg_dump output with repeated SQL-like content.
	unit := strings.Repeat(
		"INSERT INTO public.trips (id, user_id, name, destination, start_date, end_date, notes, created_at, updated_at) "+
			"VALUES (1, 42, 'Summer Vacation', 'Barcelona, Spain', '2026-07-01', '2026-07-14', "+
			"'Flights booked, hotel confirmed. Need to arrange airport transfer and travel insurance.', "+
			"'2026-01-15 10:30:00+00', '2026-01-15 10:30:00+00');\n",
		100,
	)
	targetSize := sizeMB * 1024 * 1024
	var sb strings.Builder
	for sb.Len() < targetSize {
		sb.WriteString(unit)
	}
	return []byte(sb.String())[:targetSize]
}

func benchmarkCompressor(b *testing.B, c compress.Compressor, data []byte) {
	b.Helper()
	b.SetBytes(int64(len(data)))
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		if err := c.Compress(bytes.NewReader(data), io.Discard); err != nil {
			b.Fatalf("Compress: %v", err)
		}
	}
}

// ── 1 MB benchmarks ─────────────────────────────────────────────────────────

func BenchmarkGzip_BestSpeed_1MB(b *testing.B) {
	data := generateDumpData(1)
	c, _ := compress.NewGzipCompressor(gzip.BestSpeed)
	benchmarkCompressor(b, c, data)
}

func BenchmarkGzip_DefaultCompression_1MB(b *testing.B) {
	data := generateDumpData(1)
	c, _ := compress.NewGzipCompressor(gzip.DefaultCompression)
	benchmarkCompressor(b, c, data)
}

func BenchmarkGzip_BestCompression_1MB(b *testing.B) {
	data := generateDumpData(1)
	c, _ := compress.NewGzipCompressor(gzip.BestCompression)
	benchmarkCompressor(b, c, data)
}

func BenchmarkZstd_Fastest_1MB(b *testing.B) {
	data := generateDumpData(1)
	c, _ := compress.NewZstdCompressor(1)
	benchmarkCompressor(b, c, data)
}

func BenchmarkZstd_Default_1MB(b *testing.B) {
	data := generateDumpData(1)
	c, _ := compress.NewZstdCompressor(2)
	benchmarkCompressor(b, c, data)
}

func BenchmarkZstd_Better_1MB(b *testing.B) {
	data := generateDumpData(1)
	c, _ := compress.NewZstdCompressor(3)
	benchmarkCompressor(b, c, data)
}

func BenchmarkZstd_Best_1MB(b *testing.B) {
	data := generateDumpData(1)
	c, _ := compress.NewZstdCompressor(4)
	benchmarkCompressor(b, c, data)
}

// ── 10 MB benchmarks ────────────────────────────────────────────────────────

func BenchmarkGzip_BestSpeed_10MB(b *testing.B) {
	data := generateDumpData(10)
	c, _ := compress.NewGzipCompressor(gzip.BestSpeed)
	benchmarkCompressor(b, c, data)
}

func BenchmarkGzip_DefaultCompression_10MB(b *testing.B) {
	data := generateDumpData(10)
	c, _ := compress.NewGzipCompressor(gzip.DefaultCompression)
	benchmarkCompressor(b, c, data)
}

func BenchmarkGzip_BestCompression_10MB(b *testing.B) {
	data := generateDumpData(10)
	c, _ := compress.NewGzipCompressor(gzip.BestCompression)
	benchmarkCompressor(b, c, data)
}

func BenchmarkZstd_Fastest_10MB(b *testing.B) {
	data := generateDumpData(10)
	c, _ := compress.NewZstdCompressor(1)
	benchmarkCompressor(b, c, data)
}

func BenchmarkZstd_Default_10MB(b *testing.B) {
	data := generateDumpData(10)
	c, _ := compress.NewZstdCompressor(2)
	benchmarkCompressor(b, c, data)
}

func BenchmarkZstd_Better_10MB(b *testing.B) {
	data := generateDumpData(10)
	c, _ := compress.NewZstdCompressor(3)
	benchmarkCompressor(b, c, data)
}

func BenchmarkZstd_Best_10MB(b *testing.B) {
	data := generateDumpData(10)
	c, _ := compress.NewZstdCompressor(4)
	benchmarkCompressor(b, c, data)
}

// ── Noop baseline ────────────────────────────────────────────────────────────

func BenchmarkNoop_10MB(b *testing.B) {
	data := generateDumpData(10)
	c := &compress.NoopCompressor{}
	benchmarkCompressor(b, c, data)
}