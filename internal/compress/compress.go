// Package compress provides streaming compression implementations for the dump pipeline.
package compress

import (
	"compress/gzip"
	"fmt"
	"io"

	"github.com/klauspost/compress/zstd"
)

// Compressor is the interface that wraps the Compress method.
// Compress reads from src and writes the compressed output to dst.
// It is the caller's responsibility to close dst after Compress returns.
type Compressor interface {
	Compress(src io.Reader, dst io.Writer) error
	// Extension returns the file extension suffix added by this compressor (e.g. ".gz", ".zst", "").
	Extension() string
}

// NopCompressor passes data through without compression.
type NopCompressor struct{}

func (n *NopCompressor) Compress(src io.Reader, dst io.Writer) error {
	_, err := io.Copy(dst, src)
	return err
}

func (n *NopCompressor) Extension() string { return "" }

// GzipCompressor compresses data using the standard library gzip implementation.
type GzipCompressor struct {
	Level int // gzip compression level (1-9, or gzip.DefaultCompression = -1)
}

// NewGzipCompressor creates a GzipCompressor with the specified level.
// level must be gzip.DefaultCompression (-1), gzip.NoCompression (0),
// gzip.BestSpeed (1) or gzip.BestCompression (9), or any value in [1,9].
func NewGzipCompressor(level int) (*GzipCompressor, error) {
	if level != gzip.DefaultCompression && level != gzip.NoCompression &&
		(level < gzip.BestSpeed || level > gzip.BestCompression) {
		return nil, fmt.Errorf("compress: invalid gzip level %d", level)
	}
	return &GzipCompressor{Level: level}, nil
}

func (g *GzipCompressor) Compress(src io.Reader, dst io.Writer) error {
	w, err := gzip.NewWriterLevel(dst, g.Level)
	if err != nil {
		return fmt.Errorf("compress: create gzip writer: %w", err)
	}
	if _, err := io.Copy(w, src); err != nil {
		_ = w.Close()
		return fmt.Errorf("compress: gzip copy: %w", err)
	}
	if err := w.Close(); err != nil {
		return fmt.Errorf("compress: gzip close: %w", err)
	}
	return nil
}

func (g *GzipCompressor) Extension() string { return ".gz" }

// ZstdCompressor compresses data using the klauspost/compress zstd implementation.
type ZstdCompressor struct {
	Level zstd.EncoderLevel
}

// NewZstdCompressor creates a ZstdCompressor with the specified encoder level.
func NewZstdCompressor(level zstd.EncoderLevel) (*ZstdCompressor, error) {
	return &ZstdCompressor{Level: level}, nil
}

func (z *ZstdCompressor) Compress(src io.Reader, dst io.Writer) error {
	w, err := zstd.NewWriter(dst, zstd.WithEncoderLevel(z.Level))
	if err != nil {
		return fmt.Errorf("compress: create zstd writer: %w", err)
	}
	if _, err := io.Copy(w, src); err != nil {
		_ = w.Close()
		return fmt.Errorf("compress: zstd copy: %w", err)
	}
	if err := w.Close(); err != nil {
		return fmt.Errorf("compress: zstd close: %w", err)
	}
	return nil
}

func (z *ZstdCompressor) Extension() string { return ".zst" }