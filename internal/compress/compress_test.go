package compress_test

import (
	"bytes"
	"compress/gzip"
	"crypto/rand"
	"io"
	"strings"
	"testing"

	"github.com/klauspost/compress/zstd"
	"github.com/your-org/dbworker/internal/compress"
)

// roundTrip compresses data with c, then decompresses it and asserts byte equality.
func roundTrip(t *testing.T, c compress.Compressor, decompressor func(r io.Reader) (io.ReadCloser, error), input []byte) {
	t.Helper()

	var compressed bytes.Buffer
	if err := c.Compress(bytes.NewReader(input), &compressed); err != nil {
		t.Fatalf("Compress: %v", err)
	}

	rc, err := decompressor(bytes.NewReader(compressed.Bytes()))
	if err != nil {
		t.Fatalf("decompressor open: %v", err)
	}
	defer rc.Close()

	got, err := io.ReadAll(rc)
	if err != nil {
		t.Fatalf("decompressor read: %v", err)
	}

	if !bytes.Equal(input, got) {
		t.Fatalf("round-trip mismatch: input len=%d got len=%d", len(input), len(got))
	}
}

func gzipDecompressor(r io.Reader) (io.ReadCloser, error) {
	return gzip.NewReader(r)
}

func zstdDecompressor(r io.Reader) (io.ReadCloser, error) {
	dec, err := zstd.NewReader(r)
	if err != nil {
		return nil, err
	}
	return io.NopCloser(dec), nil
}

var testInputs = []struct {
	name string
	data []byte
}{
	{"empty", []byte{}},
	{"small_text", []byte("SELECT 1; -- hello world")},
	{"sql_dump", []byte(strings.Repeat("INSERT INTO tbl VALUES (1,'foo','bar');\n", 1000))},
	{"random_1KB", randomBytes(1024)},
	{"random_64KB", randomBytes(64 * 1024)},
}

func randomBytes(n int) []byte {
	b := make([]byte, n)
	if _, err := rand.Read(b); err != nil {
		panic(err)
	}
	return b
}

// ---- Gzip round-trip tests ----

func TestGzipRoundTrip_DefaultLevel(t *testing.T) {
	c, err := compress.NewGzipCompressor(gzip.DefaultCompression)
	if err != nil {
		t.Fatal(err)
	}
	for _, tc := range testInputs {
		t.Run(tc.name, func(t *testing.T) {
			roundTrip(t, c, gzipDecompressor, tc.data)
		})
	}
}

func TestGzipRoundTrip_BestSpeed(t *testing.T) {
	c, err := compress.NewGzipCompressor(gzip.BestSpeed)
	if err != nil {
		t.Fatal(err)
	}
	for _, tc := range testInputs {
		t.Run(tc.name, func(t *testing.T) {
			roundTrip(t, c, gzipDecompressor, tc.data)
		})
	}
}

func TestGzipRoundTrip_BestCompression(t *testing.T) {
	c, err := compress.NewGzipCompressor(gzip.BestCompression)
	if err != nil {
		t.Fatal(err)
	}
	for _, tc := range testInputs {
		t.Run(tc.name, func(t *testing.T) {
			roundTrip(t, c, gzipDecompressor, tc.data)
		})
	}
}

func TestGzipInvalidLevel(t *testing.T) {
	_, err := compress.NewGzipCompressor(100)
	if err == nil {
		t.Fatal("expected error for invalid level, got nil")
	}
}

// ---- Zstd round-trip tests ----

func TestZstdRoundTrip_Fastest(t *testing.T) {
	c, err := compress.NewZstdCompressor(zstd.SpeedFastest)
	if err != nil {
		t.Fatal(err)
	}
	for _, tc := range testInputs {
		t.Run(tc.name, func(t *testing.T) {
			roundTrip(t, c, zstdDecompressor, tc.data)
		})
	}
}

func TestZstdRoundTrip_Default(t *testing.T) {
	c, err := compress.NewZstdCompressor(zstd.SpeedDefault)
	if err != nil {
		t.Fatal(err)
	}
	for _, tc := range testInputs {
		t.Run(tc.name, func(t *testing.T) {
			roundTrip(t, c, zstdDecompressor, tc.data)
		})
	}
}

func TestZstdRoundTrip_BestCompression(t *testing.T) {
	c, err := compress.NewZstdCompressor(zstd.SpeedBestCompression)
	if err != nil {
		t.Fatal(err)
	}
	for _, tc := range testInputs {
		t.Run(tc.name, func(t *testing.T) {
			roundTrip(t, c, zstdDecompressor, tc.data)
		})
	}
}

// ---- Nop round-trip tests ----

func TestNopRoundTrip(t *testing.T) {
	c := &compress.NopCompressor{}
	for _, tc := range testInputs {
		t.Run(tc.name, func(t *testing.T) {
			var buf bytes.Buffer
			if err := c.Compress(bytes.NewReader(tc.data), &buf); err != nil {
				t.Fatalf("Compress: %v", err)
			}
			if !bytes.Equal(tc.data, buf.Bytes()) {
				t.Fatal("NopCompressor modified data")
			}
		})
	}
}

// ---- Factory tests ----

func TestNewCompressor_None(t *testing.T) {
	c, err := compress.NewCompressor(compress.Config{Format: compress.FormatNone})
	if err != nil {
		t.Fatal(err)
	}
	if c.Extension() != "" {
		t.Fatalf("expected empty extension, got %q", c.Extension())
	}
}

func TestNewCompressor_Gzip(t *testing.T) {
	c, err := compress.NewCompressor(compress.Config{Format: compress.FormatGzip, Level: -1})
	if err != nil {
		t.Fatal(err)
	}
	if c.Extension() != ".gz" {
		t.Fatalf("expected .gz, got %q", c.Extension())
	}
}

func TestNewCompressor_Zstd(t *testing.T) {
	c, err := compress.NewCompressor(compress.Config{Format: compress.FormatZstd, Level: 2})
	if err != nil {
		t.Fatal(err)
	}
	if c.Extension() != ".zst" {
		t.Fatalf("expected .zst, got %q", c.Extension())
	}
}

func TestNewCompressor_Unknown(t *testing.T) {
	_, err := compress.NewCompressor(compress.Config{Format: "bz2"})
	if err == nil {
		t.Fatal("expected error for unknown format")
	}
}