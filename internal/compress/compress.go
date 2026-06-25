package compress

import (
	"compress/gzip"
	"fmt"
	"io"

	"github.com/klauspost/compress/zstd"
)

// Compressor is the interface for compressing data from a reader to a writer.
type Compressor interface {
	Compress(src io.Reader, dst io.Writer) error
	// Extension returns the file extension for the compressed output (e.g. ".gz").
	Extension() string
}

// GzipCompressor compresses data using gzip.
type GzipCompressor struct {
	Level int
}

// NewGzipCompressor creates a new GzipCompressor with the given compression level.
// Level should be between gzip.BestSpeed (1) and gzip.BestCompression (9),
// or gzip.DefaultCompression (-1).
func NewGzipCompressor(level int) (*GzipCompressor, error) {
	if level != gzip.DefaultCompression && level != gzip.HuffmanOnly &&
		(level < gzip.BestSpeed || level > gzip.BestCompression) {
		return nil, fmt.Errorf("compress: invalid gzip compression level: %d", level)
	}
	return &GzipCompressor{Level: level}, nil
}

// Compress reads from src, compresses with gzip, and writes to dst.
func (g *GzipCompressor) Compress(src io.Reader, dst io.Writer) error {
	w, err := gzip.NewWriterLevel(dst, g.Level)
	if err != nil {
		return fmt.Errorf("compress: failed to create gzip writer: %w", err)
	}
	if _, err := io.Copy(w, src); err != nil {
		_ = w.Close()
		return fmt.Errorf("compress: gzip copy failed: %w", err)
	}
	if err := w.Close(); err != nil {
		return fmt.Errorf("compress: gzip close failed: %w", err)
	}
	return nil
}

// Extension returns ".gz".
func (g *GzipCompressor) Extension() string {
	return ".gz"
}

// ZstdCompressor compresses data using zstandard.
type ZstdCompressor struct {
	Level zstd.EncoderLevel
}

// NewZstdCompressor creates a new ZstdCompressor with the given compression level.
func NewZstdCompressor(level zstd.EncoderLevel) (*ZstdCompressor, error) {
	return &ZstdCompressor{Level: level}, nil
}

// Compress reads from src, compresses with zstd, and writes to dst.
func (z *ZstdCompressor) Compress(src io.Reader, dst io.Writer) error {
	w, err := zstd.NewWriter(dst, zstd.WithEncoderLevel(z.Level))
	if err != nil {
		return fmt.Errorf("compress: failed to create zstd writer: %w", err)
	}
	if _, err := io.Copy(w, src); err != nil {
		_ = w.Close()
		return fmt.Errorf("compress: zstd copy failed: %w", err)
	}
	if err := w.Close(); err != nil {
		return fmt.Errorf("compress: zstd close failed: %w", err)
	}
	return nil
}

// Extension returns ".zst".
func (z *ZstdCompressor) Extension() string {
	return ".zst"
}

// NopCompressor passes data through without any compression.
type NopCompressor struct{}

// Compress copies src to dst without modification.
func (n *NopCompressor) Compress(src io.Reader, dst io.Writer) error {
	if _, err := io.Copy(dst, src); err != nil {
		return fmt.Errorf("compress: nop copy failed: %w", err)
	}
	return nil
}

// Extension returns an empty string (no extra extension).
func (n *NopCompressor) Extension() string {
	return ""
}