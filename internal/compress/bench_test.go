package compress_test

import (
	"bytes"
	"compress/gzip"
	"io"
	"strings"
	"testing"

	"github.com/nicholasgasior/gsfmt/internal/compress"
)

// generateDump produces a realistic-ish pg_dump payload of approximately targetMB megabytes.
func generateDump(targetMB int) []byte {
	block := `-- pg_dump output simulation
CREATE TABLE orders (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL,
    product     TEXT NOT NULL,
    quantity    INTEGER DEFAULT 1,
    price       NUMERIC(10,2),
    created_at  TIMESTAMPTZ DEFAULT now()
);
INSERT INTO orders (user_id, product, quantity, price) VALUES (1, 'Widget A', 3, 9.99);
INSERT INTO orders (user_id, product, quantity, price) VALUES (2, 'Widget B', 1, 19.99);
INSERT INTO orders (user_id, product, quantity, price) VALUES (3, 'Gadget X', 5, 4.50);
INSERT INTO orders (user_id, product, quantity, price) VALUES (4, 'Gadget Y', 2, 24.99);
`
	blockSize := len(block)
	targetBytes := targetMB * 1024 * 1024
	repeats := targetBytes / blockSize
	if repeats < 1 {
		repeats = 1
	}
	return []byte(strings.Repeat(block, repeats))
}

var dumpData = generateDump(10) // ~10 MB realistic dump

func BenchmarkGzip_BestSpeed(b *testing.B) {
	c := compress.NewGzipCompressor(gzip.BestSpeed)
	benchmarkCompressor(b, c)
}

func BenchmarkGzip_DefaultCompression(b *testing.B) {
	c := compress.NewGzipCompressor(gzip.DefaultCompression)
	benchmarkCompressor(b, c)
}

func BenchmarkGzip_BestCompression(b *testing.B) {
	c := compress.NewGzipCompressor(gzip.BestCompression)
	benchmarkCompressor(b, c)
}

func BenchmarkZstd_Level1_Fastest(b *testing.B) {
	c := compress.NewZstdCompressor(1)
	benchmarkCompressor(b, c)
}

func BenchmarkZstd_Level2_Default(b *testing.B) {
	c := compress.NewZstdCompressor(2)
	benchmarkCompressor(b, c)
}

func BenchmarkZstd_Level3_Better(b *testing.B) {
	c := compress.NewZstdCompressor(3)
	benchmarkCompressor(b, c)
}

func BenchmarkZstd_Level4_Best(b *testing.B) {
	c := compress.NewZstdCompressor(4)
	benchmarkCompressor(b, c)
}

func BenchmarkNone(b *testing.B) {
	c := &compress.NoneCompressor{}
	benchmarkCompressor(b, c)
}

func benchmarkCompressor(b *testing.B, c compress.Compressor) {
	b.Helper()
	b.SetBytes(int64(len(dumpData)))
	b.ReportAllocs()

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		src := bytes.NewReader(dumpData)
		dst := io.Discard
		if err := c.Compress(src, dst); err != nil {
			b.Fatalf("Compress failed: %v", err)
		}
	}
}

// BenchmarkGzip_CompressionRatio reports compressed size vs original for reference.
func BenchmarkGzip_CompressionRatio(b *testing.B) {
	levels := []struct {
		name  string
		level int
	}{
		{"BestSpeed", gzip.BestSpeed},
		{"Default", gzip.DefaultCompression},
		{"BestCompression", gzip.BestCompression},
	}

	for _, tc := range levels {
		tc := tc
		b.Run(tc.name, func(b *testing.B) {
			c := compress.NewGzipCompressor(tc.level)
			b.SetBytes(int64(len(dumpData)))
			b.ReportAllocs()
			var compressedSize int64
			b.ResetTimer()
			for i := 0; i < b.N; i++ {
				src := bytes.NewReader(dumpData)
				var buf bytes.Buffer
				if err := c.Compress(src, &buf); err != nil {
					b.Fatalf("Compress failed: %v", err)
				}
				compressedSize = int64(buf.Len())
			}
			ratio := float64(len(dumpData)) / float64(compressedSize)
			b.ReportMetric(ratio, "ratio")
		})
	}
}

func BenchmarkZstd_CompressionRatio(b *testing.B) {
	levels := []struct {
		name  string
		level int
	}{
		{"Fastest", 1},
		{"Default", 2},
		{"Better", 3},
		{"Best", 4},
	}

	for _, tc := range levels {
		tc := tc
		b.Run(tc.name, func(b *testing.B) {
			c := compress.NewZstdCompressor(tc.level)
			b.SetBytes(int64(len(dumpData)))
			b.ReportAllocs()
			var compressedSize int64
			b.ResetTimer()
			for i := 0; i < b.N; i++ {
				src := bytes.NewReader(dumpData)
				var buf bytes.Buffer
				if err := c.Compress(src, &buf); err != nil {
					b.Fatalf("Compress failed: %v", err)
				}
				compressedSize = int64(buf.Len())
			}
			ratio := float64(len(dumpData)) / float64(compressedSize)
			b.ReportMetric(ratio, "ratio")
		})
	}
}