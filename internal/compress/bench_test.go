package compress_test

import (
	"bytes"
	"compress/gzip"
	"io"
	"testing"

	"github.com/klauspost/compress/zstd"
	"github.com/your-org/dbworker/internal/compress"
)

// realisticDump simulates a ~10 MB SQL dump that is highly compressible.
func realisticDump(n int) []byte {
	row := []byte("INSERT INTO orders (id, user_id, product, amount, created_at) VALUES (42, 1001, 'widget', 9.99, '2026-01-01T00:00:00Z');\n")
	var buf bytes.Buffer
	buf.Grow(n)
	for buf.Len() < n {
		buf.Write(row)
	}
	return buf.Bytes()
}

var dumpData = realisticDump(10 * 1024 * 1024) // 10 MB

func benchCompress(b *testing.B, c compress.Compressor, data []byte) {
	b.Helper()
	b.SetBytes(int64(len(data)))
	b.ReportAllocs()
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		if err := c.Compress(bytes.NewReader(data), io.Discard); err != nil {
			b.Fatal(err)
		}
	}
}

// ---- Gzip benchmarks ----

func BenchmarkGzip_BestSpeed(b *testing.B) {
	c, _ := compress.NewGzipCompressor(gzip.BestSpeed)
	benchCompress(b, c, dumpData)
}

func BenchmarkGzip_DefaultLevel(b *testing.B) {
	c, _ := compress.NewGzipCompressor(gzip.DefaultCompression)
	benchCompress(b, c, dumpData)
}

func BenchmarkGzip_BestCompression(b *testing.B) {
	c, _ := compress.NewGzipCompressor(gzip.BestCompression)
	benchCompress(b, c, dumpData)
}

// ---- Zstd benchmarks ----

func BenchmarkZstd_SpeedFastest(b *testing.B) {
	c, _ := compress.NewZstdCompressor(zstd.SpeedFastest)
	benchCompress(b, c, dumpData)
}

func BenchmarkZstd_SpeedDefault(b *testing.B) {
	c, _ := compress.NewZstdCompressor(zstd.SpeedDefault)
	benchCompress(b, c, dumpData)
}

func BenchmarkZstd_SpeedBetterCompression(b *testing.B) {
	c, _ := compress.NewZstdCompressor(zstd.SpeedBetterCompression)
	benchCompress(b, c, dumpData)
}

func BenchmarkZstd_SpeedBestCompression(b *testing.B) {
	c, _ := compress.NewZstdCompressor(zstd.SpeedBestCompression)
	benchCompress(b, c, dumpData)
}

// ---- Nop baseline ----

func BenchmarkNop(b *testing.B) {
	c := &compress.NopCompressor{}
	benchCompress(b, c, dumpData)
}