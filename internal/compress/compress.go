// Package compress provides streaming compression implementations for the dump pipeline.
package compress

import (
	"compress/gzip"
	"fmt"
	"io"

	"github.com/klauspost/compress/zstd"
)

// Compressor defines the interface for streaming compression.
// Compress reads from src and writes compressed data to dst.
type Compressor interface {
	Compress(src io.Reader, dst io.Writer) error
	// FileExtension returns the file extension associated with this compressor (e.g. ".gz").
	FileExtension() string
}

// NoneCompressor is a pass-through compressor that performs no compression.
type NoneCompressor struct{}

// Compress copies src to dst without modification.
func (n *NoneCompressor) Compress(src io.Reader, dst io.Writer) error {
	_, err := io.Copy(dst, src)
	return err
}

// FileExtension returns an empty string since no compression is applied.
func (n *NoneCompressor) FileExtension() string {
	return ""
}

// GzipCompressor compresses data using the gzip format.
type GzipCompressor struct {
	// Level is the gzip compression level (gzip.BestSpeed through gzip.BestCompression, or gzip.DefaultCompression).
	Level int
}

// Compress reads from src and writes gzip-compressed data to dst.
func (g *GzipCompressor) Compress(src io.Reader, dst io.Writer) error {
	level := g.Level
	if level == 0 {
		level = gzip.DefaultCompression
	}

	w, err := gzip.NewWriterLevel(dst, level)
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

// FileExtension returns ".gz".
func (g *GzipCompressor) FileExtension() string {
	return ".gz"
}

// ZstdCompressor compresses data using the Zstandard format.
type ZstdCompressor struct {
	// Level is the zstd compression level (1–22; 0 means default).
	Level int
}

// zstdEncoderLevel maps an integer level to a zstd.EncoderLevel.
func zstdEncoderLevel(level int) zstd.EncoderLevel {
	switch {
	case level <= 1:
		return zstd.SpeedFastest
	case level <= 3:
		return zstd.SpeedDefault
	case level <= 7:
		return zstd.SpeedBetterCompression
	default:
		return zstd.SpeedBestCompression
	}
}

// Compress reads from src and writes zstd-compressed data to dst.
func (z *ZstdCompressor) Compress(src io.Reader, dst io.Writer) error {
	lvl := z.Level
	if lvl == 0 {
		lvl = 3 // default
	}

	enc, err := zstd.NewWriter(dst, zstd.WithEncoderLevel(zstdEncoderLevel(lvl)))
	if err != nil {
		return fmt.Errorf("compress: failed to create zstd encoder: %w", err)
	}

	if _, err := io.Copy(enc, src); err != nil {
		_ = enc.Close()
		return fmt.Errorf("compress: zstd copy failed: %w", err)
	}

	if err := enc.Close(); err != nil {
		return fmt.Errorf("compress: zstd close failed: %w", err)
	}

	return nil
}

// FileExtension returns ".zst".
func (z *ZstdCompressor) FileExtension() string {
	return ".zst"
}