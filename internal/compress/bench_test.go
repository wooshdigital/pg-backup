package compress_test

import (
	"bytes"
	"compress/gzip"
	"io"
	"strings"
	"testing"

	"github.com/example/worker/internal/compress"
)

// generateDumpData creates a synthetic pg_dump-like payload of approximately
// the requested size in bytes.
func generateDumpData(targetBytes int) string {
	base := `-- PostgreSQL database dump
SET statement_timeout = 0;
SET lock_timeout = 0;
CREATE TABLE public.orders (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    amount numeric(12,2) NOT NULL,
    status text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
`
	row := "INSERT INTO public.orders VALUES (%d, %d, 99.99, 'completed', '2024-01-01 00:00:00+00');\n"

	var sb strings.Builder
	sb.WriteString(base)
	i := 1
	for sb.Len() < targetBytes {
		sb.WriteString(strings.Replace(row, "%d", fmt.Sprint(i), -1))
		i++
	}
	return sb.String()
}

// We build the payload once and reuse it across benchmarks.
var (
	// ~1 MB of realistic SQL dump data
	benchData1MB  = buildBenchData(1 << 20)
	// ~10 MB
	benchData10MB = buildBenchData(10 << 20)
)

func buildBenchData(size int) []byte {
	var sb strings.Builder
	header := `-- PostgreSQL database dump
SET statement_timeout = 0;
CREATE TABLE public.events (id bigint, payload text, ts timestamptz);
`
	row := "INSERT INTO public.events VALUES (%d, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', '2024-01-01 00:00:00+00');\n"
	sb.WriteString(header)
	idx := 1
	for sb.Len() < size {
		line := strings.ReplaceAll(row, "%d", fmt.Sprint(idx))
		sb.WriteString(line)
		idx++
	}
	return []byte(sb.String())
}

func benchmarkCompressor(b *testing.B, c compress.Compressor, data []byte) {
	b.Helper()
	b.SetBytes(int64(len(data)))
	b.ReportAllocs()
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		src := bytes.NewReader(data)
		dst := io.Discard
		if err := c.Compress(src, dst); err != nil {
			b.Fatalf("Compress: %v", err)
		}
	}
}

// ---- Gzip benchmarks ----

func BenchmarkGzip_BestSpeed_1MB(b *testing.B) {
	c, _ := compress.NewGzipCompressor(gzip.BestSpeed)
	benchmarkCompressor(b, c, benchData1MB)
}

func BenchmarkGzip_Default_1MB(b *testing.B) {
	c, _ := compress.NewGzipCompressor(gzip.DefaultCompression)
	benchmarkCompressor(b, c, benchData1MB)
}

func BenchmarkGzip_BestCompression_1MB(b *testing.B) {
	c, _ := compress.NewGzipCompressor(gzip.BestCompression)
	benchmarkCompressor(b, c, benchData1MB)
}

func BenchmarkGzip_BestSpeed_10MB(b *testing.B) {
	c, _ := compress.NewGzipCompressor(gzip.BestSpeed)
	benchmarkCompressor(b, c, benchData10MB)
}

func BenchmarkGzip_Default_10MB(b *testing.B) {
	c, _ := compress.NewGzipCompressor(gzip.DefaultCompression)
	benchmarkCompressor(b, c, benchData10MB)
}

func BenchmarkGzip_BestCompression_10MB(b *testing.B) {
	c, _ := compress.NewGzipCompressor(gzip.BestCompression)
	benchmarkCompressor(b, c, benchData10MB)
}

// ---- Zstd benchmarks ----

func BenchmarkZstd_Level1_1MB(b *testing.B) {
	c, _ := compress.NewZstdCompressor(1)
	benchmarkCompressor(b, c, benchData1MB)
}

func BenchmarkZstd_Level2_1MB(b *testing.B) {
	c, _ := compress.NewZstdCompressor(2)
	benchmarkCompressor(b, c, benchData1MB)
}

func BenchmarkZstd_Level3_1MB(b *testing.B) {
	c, _ := compress.NewZstdCompressor(3)
	benchmarkCompressor(b, c, benchData1MB)
}

func BenchmarkZstd_Level4_1MB(b *testing.B) {
	c, _ := compress.NewZstdCompressor(4)
	benchmarkCompressor(b, c, benchData1MB)
}

func BenchmarkZstd_Level1_10MB(b *testing.B) {
	c, _ := compress.NewZstdCompressor(1)
	benchmarkCompressor(b, c, benchData10MB)
}

func BenchmarkZstd_Level2_10MB(b *testing.B) {
	c, _ := compress.NewZstdCompressor(2)
	benchmarkCompressor(b, c, benchData10MB)
}

func BenchmarkZstd_Level3_10MB(b *testing.B) {
	c, _ := compress.NewZstdCompressor(3)
	benchmarkCompressor(b, c, benchData10MB)
}

func BenchmarkZstd_Level4_10MB(b *testing.B) {
	c, _ := compress.NewZstdCompressor(4)
	benchmarkCompressor(b, c, benchData10MB)
}

// ---- NoOp benchmark (baseline) ----

func BenchmarkNoOp_1MB(b *testing.B) {
	c := &compress.NoOpCompressor{}
	benchmarkCompressor(b, c, benchData1MB)
}

func BenchmarkNoOp_10MB(b *testing.B) {
	c := &compress.NoOpCompressor{}
	benchmarkCompressor(b, c, benchData10MB)
}