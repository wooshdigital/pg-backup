package compress_test

import (
	"bytes"
	"compress/gzip"
	"io"
	"strings"
	"testing"

	"github.com/yourusername/pg-dump-worker/internal/compress"
)

// realisticDump generates a byte slice resembling a pg_dump SQL output of
// approximately targetMB megabytes.
func realisticDump(targetMB int) []byte {
	// Simulate realistic SQL lines with moderate compressibility.
	line := "INSERT INTO public.events (id, user_id, event_type, payload, created_at) " +
		"VALUES (nextval('events_id_seq'), 12345, 'page_view', " +
		"'{\"url\": \"/dashboard\", \"referrer\": \"https://example.com\"}', NOW());\n"

	targetBytes := targetMB * 1024 * 1024
	var sb strings.Builder
	sb.Grow(targetBytes)
	for sb.Len() < targetBytes {
		sb.WriteString(line)
	}
	return []byte(sb.String())
}

var sink int64 // prevent compiler optimising away writes

// benchmarkCompressor is a helper that runs a compressor benchmark.
func benchmarkCompressor(b *testing.B, c compress.Compressor, data []byte) {
	b.Helper()
	b.SetBytes(int64(len(data)))
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		var buf bytes.Buffer
		buf.Grow(len(data) / 2)
		if err := c.Compress(bytes.NewReader(data), &buf); err != nil {
			b.Fatalf("Compress: %v", err)
		}
		sink += int64(buf.Len())
	}
}

// --- 1 MB benchmarks ---

func BenchmarkGzip_BestSpeed_1MB(b *testing.B) {
	data := realisticDump(1)
	benchmarkCompressor(b, compress.NewGzipCompressor(gzip.BestSpeed), data)
}

func BenchmarkGzip_Default_1MB(b *testing.B) {
	data := realisticDump(1)
	benchmarkCompressor(b, compress.NewGzipCompressor(gzip.DefaultCompression), data)
}

func BenchmarkGzip_BestCompression_1MB(b *testing.B) {
	data := realisticDump(1)
	benchmarkCompressor(b, compress.NewGzipCompressor(gzip.BestCompression), data)
}

func BenchmarkZstd_Fastest_1MB(b *testing.B) {
	data := realisticDump(1)
	benchmarkCompressor(b, compress.NewZstdCompressor(1), data)
}

func BenchmarkZstd_Default_1MB(b *testing.B) {
	data := realisticDump(1)
	benchmarkCompressor(b, compress.NewZstdCompressor(2), data)
}

func BenchmarkZstd_Better_1MB(b *testing.B) {
	data := realisticDump(1)
	benchmarkCompressor(b, compress.NewZstdCompressor(3), data)
}

func BenchmarkZstd_Best_1MB(b *testing.B) {
	data := realisticDump(1)
	benchmarkCompressor(b, compress.NewZstdCompressor(4), data)
}

// --- 10 MB benchmarks ---

func BenchmarkGzip_BestSpeed_10MB(b *testing.B) {
	data := realisticDump(10)
	benchmarkCompressor(b, compress.NewGzipCompressor(gzip.BestSpeed), data)
}

func BenchmarkGzip_Default_10MB(b *testing.B) {
	data := realisticDump(10)
	benchmarkCompressor(b, compress.NewGzipCompressor(gzip.DefaultCompression), data)
}

func BenchmarkGzip_BestCompression_10MB(b *testing.B) {
	data := realisticDump(10)
	benchmarkCompressor(b, compress.NewGzipCompressor(gzip.BestCompression), data)
}

func BenchmarkZstd_Fastest_10MB(b *testing.B) {
	data := realisticDump(10)
	benchmarkCompressor(b, compress.NewZstdCompressor(1), data)
}

func BenchmarkZstd_Default_10MB(b *testing.B) {
	data := realisticDump(10)
	benchmarkCompressor(b, compress.NewZstdCompressor(2), data)
}

func BenchmarkZstd_Better_10MB(b *testing.B) {
	data := realisticDump(10)
	benchmarkCompressor(b, compress.NewZstdCompressor(3), data)
}

func BenchmarkZstd_Best_10MB(b *testing.B) {
	data := realisticDump(10)
	benchmarkCompressor(b, compress.NewZstdCompressor(4), data)
}

// --- 50 MB benchmarks (realistic production dump size) ---

func BenchmarkGzip_BestSpeed_50MB(b *testing.B) {
	data := realisticDump(50)
	benchmarkCompressor(b, compress.NewGzipCompressor(gzip.BestSpeed), data)
}

func BenchmarkGzip_Default_50MB(b *testing.B) {
	data := realisticDump(50)
	benchmarkCompressor(b, compress.NewGzipCompressor(gzip.DefaultCompression), data)
}

func BenchmarkZstd_Fastest_50MB(b *testing.B) {
	data := realisticDump(50)
	benchmarkCompressor(b, compress.NewZstdCompressor(1), data)
}

func BenchmarkZstd_Default_50MB(b *testing.B) {
	data := realisticDump(50)
	benchmarkCompressor(b, compress.NewZstdCompressor(2), data)
}

// BenchmarkNoop measures the copy baseline with no compression.
func BenchmarkNoop_10MB(b *testing.B) {
	data := realisticDump(10)
	benchmarkCompressor(b, &compress.NoopCompressor{}, data)
}

// BenchmarkCompressorComparison demonstrates throughput for the pipeline:
// reading a reader and writing compressed output, exercising the full
// streaming path.
func BenchmarkStreamingPipeline_Gzip_Default_10MB(b *testing.B) {
	data := realisticDump(10)
	b.SetBytes(int64(len(data)))
	c := compress.NewGzipCompressor(gzip.DefaultCompression)
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		pr, pw := io.Pipe()
		errCh := make(chan error, 1)
		go func() {
			_, err := io.Copy(pw, bytes.NewReader(data))
			pw.CloseWithError(err)
			errCh <- err
		}()
		var out bytes.Buffer
		out.Grow(len(data) / 2)
		if err := c.Compress(pr, &out); err != nil {
			b.Fatalf("Compress: %v", err)
		}
		if err := <-errCh; err != nil {
			b.Fatalf("pipe writer: %v", err)
		}
		sink += int64(out.Len())
	}
}

func BenchmarkStreamingPipeline_Zstd_Default_10MB(b *testing.B) {
	data := realisticDump(10)
	b.SetBytes(int64(len(data)))
	c := compress.NewZstdCompressor(2)
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		pr, pw := io.Pipe()
		errCh := make(chan error, 1)
		go func() {
			_, err := io.Copy(pw, bytes.NewReader(data))
			pw.CloseWithError(err)
			errCh <- err
		}()
		var out bytes.Buffer
		out.Grow(len(data) / 2)
		if err := c.Compress(pr, &out); err != nil {
			b.Fatalf("Compress: %v", err)
		}
		if err := <-errCh; err != nil {
			b.Fatalf("pipe writer: %v", err)
		}
		sink += int64(out.Len())
	}
}