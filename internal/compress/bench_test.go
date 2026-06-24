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

// generateDump generates a synthetic SQL dump of approximately the given size in bytes.
func generateDump(sizeBytes int) []byte {
	row := `INSERT INTO orders (id, customer_id, product_id, quantity, price, currency, status, created_at, updated_at, notes) ` +
		`VALUES (123456789, 987654321, 111222333, 5, 99.99, 'USD', 'completed', '2026-06-01 12:00:00', '2026-06-01 13:00:00', 'Standard shipment, no special instructions required.');` + "\n"
	var sb strings.Builder
	for sb.Len() < sizeBytes {
		sb.WriteString(row)
	}
	return []byte(sb.String()[:sizeBytes])
}

// dumpSizes defines the benchmark input sizes.
var dumpSizes = []struct {
	name  string
	bytes int
}{
	{"1MB", 1 << 20},
	{"10MB", 10 << 20},
	{"100MB", 100 << 20},
}

// benchmarkCompressor is a generic benchmark helper.
func benchmarkCompressor(b *testing.B, c compress.Compressor, data []byte) {
	b.Helper()
	b.SetBytes(int64(len(data)))
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		if err := c.Compress(bytes.NewReader(data), io.Discard); err != nil {
			b.Fatalf("Compress error: %v", err)
		}
	}
}

// --- Gzip benchmarks ---

func BenchmarkGzip_BestSpeed_1MB(b *testing.B) {
	data := generateDump(dumpSizes[0].bytes)
	benchmarkCompressor(b, compress.NewGzipCompressor(gzip.BestSpeed), data)
}

func BenchmarkGzip_BestSpeed_10MB(b *testing.B) {
	data := generateDump(dumpSizes[1].bytes)
	benchmarkCompressor(b, compress.NewGzipCompressor(gzip.BestSpeed), data)
}

func BenchmarkGzip_BestSpeed_100MB(b *testing.B) {
	data := generateDump(dumpSizes[2].bytes)
	benchmarkCompressor(b, compress.NewGzipCompressor(gzip.BestSpeed), data)
}

func BenchmarkGzip_Default_1MB(b *testing.B) {
	data := generateDump(dumpSizes[0].bytes)
	benchmarkCompressor(b, compress.NewGzipCompressor(gzip.DefaultCompression), data)
}

func BenchmarkGzip_Default_10MB(b *testing.B) {
	data := generateDump(dumpSizes[1].bytes)
	benchmarkCompressor(b, compress.NewGzipCompressor(gzip.DefaultCompression), data)
}

func BenchmarkGzip_Default_100MB(b *testing.B) {
	data := generateDump(dumpSizes[2].bytes)
	benchmarkCompressor(b, compress.NewGzipCompressor(gzip.DefaultCompression), data)
}

func BenchmarkGzip_BestCompression_1MB(b *testing.B) {
	data := generateDump(dumpSizes[0].bytes)
	benchmarkCompressor(b, compress.NewGzipCompressor(gzip.BestCompression), data)
}

func BenchmarkGzip_BestCompression_10MB(b *testing.B) {
	data := generateDump(dumpSizes[1].bytes)
	benchmarkCompressor(b, compress.NewGzipCompressor(gzip.BestCompression), data)
}

func BenchmarkGzip_BestCompression_100MB(b *testing.B) {
	data := generateDump(dumpSizes[2].bytes)
	benchmarkCompressor(b, compress.NewGzipCompressor(gzip.BestCompression), data)
}

// --- Zstd benchmarks ---

func BenchmarkZstd_Fastest_1MB(b *testing.B) {
	data := generateDump(dumpSizes[0].bytes)
	benchmarkCompressor(b, compress.NewZstdCompressor(zstd.SpeedFastest), data)
}

func BenchmarkZstd_Fastest_10MB(b *testing.B) {
	data := generateDump(dumpSizes[1].bytes)
	benchmarkCompressor(b, compress.NewZstdCompressor(zstd.SpeedFastest), data)
}

func BenchmarkZstd_Fastest_100MB(b *testing.B) {
	data := generateDump(dumpSizes[2].bytes)
	benchmarkCompressor(b, compress.NewZstdCompressor(zstd.SpeedFastest), data)
}

func BenchmarkZstd_Default_1MB(b *testing.B) {
	data := generateDump(dumpSizes[0].bytes)
	benchmarkCompressor(b, compress.NewZstdCompressor(zstd.SpeedDefault), data)
}

func BenchmarkZstd_Default_10MB(b *testing.B) {
	data := generateDump(dumpSizes[1].bytes)
	benchmarkCompressor(b, compress.NewZstdCompressor(zstd.SpeedDefault), data)
}

func BenchmarkZstd_Default_100MB(b *testing.B) {
	data := generateDump(dumpSizes[2].bytes)
	benchmarkCompressor(b, compress.NewZstdCompressor(zstd.SpeedDefault), data)
}

func BenchmarkZstd_BetterCompression_1MB(b *testing.B) {
	data := generateDump(dumpSizes[0].bytes)
	benchmarkCompressor(b, compress.NewZstdCompressor(zstd.SpeedBetterCompression), data)
}

func BenchmarkZstd_BetterCompression_10MB(b *testing.B) {
	data := generateDump(dumpSizes[1].bytes)
	benchmarkCompressor(b, compress.NewZstdCompressor(zstd.SpeedBetterCompression), data)
}

func BenchmarkZstd_BetterCompression_100MB(b *testing.B) {
	data := generateDump(dumpSizes[2].bytes)
	benchmarkCompressor(b, compress.NewZstdCompressor(zstd.SpeedBetterCompression), data)
}

func BenchmarkZstd_BestCompression_1MB(b *testing.B) {
	data := generateDump(dumpSizes[0].bytes)
	benchmarkCompressor(b, compress.NewZstdCompressor(zstd.SpeedBestCompression), data)
}

func BenchmarkZstd_BestCompression_10MB(b *testing.B) {
	data := generateDump(dumpSizes[1].bytes)
	benchmarkCompressor(b, compress.NewZstdCompressor(zstd.SpeedBestCompression), data)
}

func BenchmarkZstd_BestCompression_100MB(b *testing.B) {
	data := generateDump(dumpSizes[2].bytes)
	benchmarkCompressor(b, compress.NewZstdCompressor(zstd.SpeedBestCompression), data)
}

// --- Nop benchmark for baseline ---

func BenchmarkNop_1MB(b *testing.B) {
	data := generateDump(dumpSizes[0].bytes)
	benchmarkCompressor(b, &compress.NopCompressor{}, data)
}

func BenchmarkNop_10MB(b *testing.B) {
	data := generateDump(dumpSizes[1].bytes)
	benchmarkCompressor(b, &compress.NopCompressor{}, data)
}

func BenchmarkNop_100MB(b *testing.B) {
	data := generateDump(dumpSizes[2].bytes)
	benchmarkCompressor(b, &compress.NopCompressor{}, data)
}