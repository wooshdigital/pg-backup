// Package compress provides streaming compression implementations for the dump pipeline.
package compress

import (
	"compress/gzip"
	"fmt"
	"io"

	"github.com/klauspost/compress/zstd"
)

// Compressor is the interface that wraps the Compress method.
// Compress reads from src, compresses the data, and writes to dst.
// It is the caller's responsibility to close dst after Compress returns.
type Compressor interface {
	Compress(src io.Reader, dst io.Writer) error
	// Extension returns the file extension that should be appended to output files,
	// e.g. ".gz" or ".zst".
	Extension() string
}

// NopCompressor passes data through without any compression.
type NopCompressor struct{}

// Compress copies src to dst without modification.
func (n *NopCompressor) Compress(src io.Reader, dst io.Writer) error {
	_, err := io.Copy(dst, src)
	return err
}

// Extension returns an empty string because no compression is applied.
func (n *NopCompressor) Extension() string { return "" }

// GzipCompressor compresses data using the gzip format.
type GzipCompressor struct {
	// Level is the gzip compression level. Valid values are gzip.DefaultCompression,
	// gzip.NoCompression, gzip.BestSpeed, gzip.BestCompression, or a value in [1, 9].
	Level int
}

// Compress reads from src, gzip-compresses the data, and writes to dst.
func (g *GzipCompressor) Compress(src io.Reader, dst io.Writer) error {
	level := g.Level
	if level == 0 {
		level = gzip.DefaultCompression
	}

	w, err := gzip.NewWriterLevel(dst, level)
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

// Extension returns ".gz".
func (g *GzipCompressor) Extension() string { return ".gz" }

// ZstdCompressor compresses data using the Zstandard format.
type ZstdCompressor struct {
	// Level is the zstd encoder speed level. Use zstd.SpeedDefault (3) when unsure.
	// Valid range is zstd.SpeedFastest (1) through zstd.SpeedBestCompression (4).
	Level zstd.EncoderLevel
}

// Compress reads from src, zstd-compresses the data, and writes to dst.
func (z *ZstdCompressor) Compress(src io.Reader, dst io.Writer) error {
	level := z.Level
	if level == 0 {
		level = zstd.SpeedDefault
	}

	w, err := zstd.NewWriter(dst, zstd.WithEncoderLevel(level))
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

// Extension returns ".zst".
func (z *ZstdCompressor) Extension() string { return ".zst" }