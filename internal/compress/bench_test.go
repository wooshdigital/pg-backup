package compress_test

import (
	"bytes"
	"compress/gzip"
	"io"
	"strings"
	"testing"

	"github.com/klauspost/compress/zstd"

	"github.com/sno6/gosane/internal/compress"
)

// generateDump creates a synthetic pg_dump-like payload of approximately the
// requested size in bytes.
func generateDump(sizeBytes int) []byte {
	// Simulate SQL INSERT statements with realistic entropy.
	line := "INSERT INTO events (id, user_id, payload, created_at) VALUES " +
		"(gen_random_uuid(), gen_random_uuid(), " +
		"'{\"action\":\"click\",\"page\":\"/home\",\"session\":\"abc123def456\"}', " +
		"NOW());\n"
	var sb strings.Builder
	sb.Grow(sizeBytes)
	for sb.Len() < sizeBytes {
		sb.WriteString(line)
	}
	return []byte(sb.String()[:sizeBytes])
}

// sink discards all writes efficiently.
type sink struct{}

func (s *sink) Write(p []byte) (int, error) { return len(p), nil }

var dumpSizes = []struct {
	name  string
	bytes int
}{
	{"1MB", 1 * 1024 * 1024},
	{"10MB", 10 * 1024 * 1024},
	{"100MB", 100 * 1024 * 1024},
}

func benchmarkGzip(b *testing.B, level int, data []byte) {
	b.Helper()
	c, err := compress.NewGzipCompressor(level)
	if err != nil {
		b.Fatalf("NewGzipCompressor: %v", err)
	}
	b.SetBytes(int64(len(data)))
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		if err := c.Compress(bytes.NewReader(data), &sink{}); err != nil {
			b.Fatalf("Compress: %v", err)
		}
	}
}

func benchmarkZstd(b *testing.B, level zstd.EncoderLevel, data []byte) {
	b.Helper()
	c, err := compress.NewZstdCompressor(level)
	if err != nil {
		b.Fatalf("NewZstdCompressor: %v", err)
	}
	b.SetBytes(int64(len(data)))
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		if err := c.Compress(bytes.NewReader(data), &sink{}); err != nil {
			b.Fatalf("Compress: %v", err)
		}
	}
}

// ---- Gzip benchmarks ----

func BenchmarkGzip_BestSpeed_1MB(b *testing.B) {
	benchmarkGzip(b, gzip.BestSpeed, generateDump(dumpSizes[0].bytes))
}

func BenchmarkGzip_Default_1MB(b *testing.B) {
	benchmarkGzip(b, gzip.DefaultCompression, generateDump(dumpSizes[0].bytes))
}

func BenchmarkGzip_BestCompression_1MB(b *testing.B) {
	benchmarkGzip(b, gzip.BestCompression, generateDump(dumpSizes[0].bytes))
}

func BenchmarkGzip_BestSpeed_10MB(b *testing.B) {
	benchmarkGzip(b, gzip.BestSpeed, generateDump(dumpSizes[1].bytes))
}

func BenchmarkGzip_Default_10MB(b *testing.B) {
	benchmarkGzip(b, gzip.DefaultCompression, generateDump(dumpSizes[1].bytes))
}

func BenchmarkGzip_BestCompression_10MB(b *testing.B) {
	benchmarkGzip(b, gzip.BestCompression, generateDump(dumpSizes[1].bytes))
}

func BenchmarkGzip_BestSpeed_100MB(b *testing.B) {
	benchmarkGzip(b, gzip.BestSpeed, generateDump(dumpSizes[2].bytes))
}

func BenchmarkGzip_Default_100MB(b *testing.B) {
	benchmarkGzip(b, gzip.DefaultCompression, generateDump(dumpSizes[2].bytes))
}

func BenchmarkGzip_BestCompression_100MB(b *testing.B) {
	benchmarkGzip(b, gzip.BestCompression, generateDump(dumpSizes[2].bytes))
}

// ---- Zstd benchmarks ----

func BenchmarkZstd_Fastest_1MB(b *testing.B) {
	benchmarkZstd(b, zstd.SpeedFastest, generateDump(dumpSizes[0].bytes))
}

func BenchmarkZstd_Default_1MB(b *testing.B) {
	benchmarkZstd(b, zstd.SpeedDefault, generateDump(dumpSizes[0].bytes))
}

func BenchmarkZstd_Better_1MB(b *testing.B) {
	benchmarkZstd(b, zstd.SpeedBetterCompression, generateDump(dumpSizes[0].bytes))
}

func BenchmarkZstd_Best_1MB(b *testing.B) {
	benchmarkZstd(b, zstd.SpeedBestCompression, generateDump(dumpSizes[0].bytes))
}

func BenchmarkZstd_Fastest_10MB(b *testing.B) {
	benchmarkZstd(b, zstd.SpeedFastest, generateDump(dumpSizes[1].bytes))
}

func BenchmarkZstd_Default_10MB(b *testing.B) {
	benchmarkZstd(b, zstd.SpeedDefault, generateDump(dumpSizes[1].bytes))
}

func BenchmarkZstd_Better_10MB(b *testing.B) {
	benchmarkZstd(b, zstd.SpeedBetterCompression, generateDump(dumpSizes[1].bytes))
}

func BenchmarkZstd_Best_10MB(b *testing.B) {
	benchmarkZstd(b, zstd.SpeedBestCompression, generateDump(dumpSizes[1].bytes))
}

func BenchmarkZstd_Fastest_100MB(b *testing.B) {
	benchmarkZstd(b, zstd.SpeedFastest, generateDump(dumpSizes[2].bytes))
}

func BenchmarkZstd_Default_100MB(b *testing.B) {
	benchmarkZstd(b, zstd.SpeedDefault, generateDump(dumpSizes[2].bytes))
}

func BenchmarkZstd_Better_100MB(b *testing.B) {
	benchmarkZstd(b, zstd.SpeedBetterCompression, generateDump(dumpSizes[2].bytes))
}

func BenchmarkZstd_Best_100MB(b *testing.B) {
	benchmarkZstd(b, zstd.SpeedBestCompression, generateDump(dumpSizes[2].bytes))
}

// ---- Ratio reporting ----

// TestCompressionRatios prints compression ratios for informational purposes.
// Run with: go test -v -run TestCompressionRatios
func TestCompressionRatios(t *testing.T) {
	data := generateDump(10 * 1024 * 1024) // 10 MB

	tests := []struct {
		name string
		c    compress.Compressor
	}{
		{"gzip-1", mustGzip(t, gzip.BestSpeed)},
		{"gzip-6", mustGzip(t, gzip.DefaultCompression)},
		{"gzip-9", mustGzip(t, gzip.BestCompression)},
		{"zstd-fastest", mustZstd(t, zstd.SpeedFastest)},
		{"zstd-default", mustZstd(t, zstd.SpeedDefault)},
		{"zstd-better", mustZstd(t, zstd.SpeedBetterCompression)},
		{"zstd-best", mustZstd(t, zstd.SpeedBestCompression)},
	}

	for _, tt := range tests {
		var buf bytes.Buffer
		if err := tt.c.Compress(bytes.NewReader(data), &buf); err != nil {
			t.Fatalf("%s: Compress: %v", tt.name, err)
		}
		ratio := float64(len(data)) / float64(buf.Len())
		t.Logf("%s: %d → %d bytes (ratio %.2fx)", tt.name, len(data), buf.Len(), ratio)
	}
}

func mustGzip(t *testing.T, level int) compress.Compressor {
	t.Helper()
	c, err := compress.NewGzipCompressor(level)
	if err != nil {
		t.Fatalf("NewGzipCompressor: %v", err)
	}
	return c
}

func mustZstd(t *testing.T, level zstd.EncoderLevel) compress.Compressor {
	t.Helper()
	c, err := compress.NewZstdCompressor(level)
	if err != nil {
		t.Fatalf("NewZstdCompressor: %v", err)
	}
	return c
}

// Ensure io package is used (for future streaming benchmarks).
var _ io.Writer = &sink{}