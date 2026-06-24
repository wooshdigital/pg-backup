// Package compress provides streaming compression implementations for the dump pipeline.
package compress

import (
	"compress/gzip"
	"fmt"
	"io"

	"github.com/klauspost/compress/zstd"
)

// Compressor defines the interface for streaming compression.
type Compressor interface {
	// Compress reads from src and writes compressed data to dst.
	Compress(src io.Reader, dst io.Writer) error
	// Extension returns the file extension for the compressed format (e.g. ".gz", ".zst", "").
	Extension() string
}

// GzipCompressor compresses data using gzip.
type GzipCompressor struct {
	Level int // compress/gzip level constant (e.g. gzip.BestSpeed, gzip.BestCompression, gzip.DefaultCompression)
}

// NewGzipCompressor creates a GzipCompressor with the given level.
// If level is 0, gzip.DefaultCompression is used.
func NewGzipCompressor(level int) *GzipCompressor {
	if level == 0 {
		level = gzip.DefaultCompression
	}
	return &GzipCompressor{Level: level}
}

// Compress reads from src, compresses with gzip, and writes to dst.
func (g *GzipCompressor) Compress(src io.Reader, dst io.Writer) error {
	w, err := gzip.NewWriterLevel(dst, g.Level)
	if err != nil {
		return fmt.Errorf("compress/gzip: create writer: %w", err)
	}
	if _, err := io.Copy(w, src); err != nil {
		_ = w.Close()
		return fmt.Errorf("compress/gzip: copy: %w", err)
	}
	if err := w.Close(); err != nil {
		return fmt.Errorf("compress/gzip: close writer: %w", err)
	}
	return nil
}

// Extension returns the gzip file extension.
func (g *GzipCompressor) Extension() string {
	return ".gz"
}

// ZstdCompressor compresses data using zstd.
type ZstdCompressor struct {
	Level zstd.EncoderLevel
}

// NewZstdCompressor creates a ZstdCompressor with the given encoder level.
func NewZstdCompressor(level zstd.EncoderLevel) *ZstdCompressor {
	return &ZstdCompressor{Level: level}
}

// Compress reads from src, compresses with zstd, and writes to dst.
func (z *ZstdCompressor) Compress(src io.Reader, dst io.Writer) error {
	w, err := zstd.NewWriter(dst, zstd.WithEncoderLevel(z.Level))
	if err != nil {
		return fmt.Errorf("compress/zstd: create writer: %w", err)
	}
	if _, err := io.Copy(w, src); err != nil {
		_ = w.Close()
		return fmt.Errorf("compress/zstd: copy: %w", err)
	}
	if err := w.Close(); err != nil {
		return fmt.Errorf("compress/zstd: close writer: %w", err)
	}
	return nil
}

// Extension returns the zstd file extension.
func (z *ZstdCompressor) Extension() string {
	return ".zst"
}

// NopCompressor passes data through without compression.
type NopCompressor struct{}

// Compress copies src to dst without any compression.
func (n *NopCompressor) Compress(src io.Reader, dst io.Writer) error {
	if _, err := io.Copy(dst, src); err != nil {
		return fmt.Errorf("compress/nop: copy: %w", err)
	}
	return nil
}

// Extension returns an empty string (no additional extension).
func (n *NopCompressor) Extension() string {
	return ""
}

// Format represents the compression format selection.
type Format string

const (
	FormatGzip Format = "gzip"
	FormatZstd Format = "zstd"
	FormatNone Format = "none"
)

// NewCompressor creates a Compressor from a format string and compression level.
// For gzip, level maps to compress/gzip levels (1–9, -1 for default).
// For zstd, level maps to zstd encoder levels (1–4).
// For none, a NopCompressor is returned regardless of level.
func NewCompressor(format Format, level int) (Compressor, error) {
	switch format {
	case FormatGzip:
		if level == 0 {
			level = gzip.DefaultCompression
		}
		if level != gzip.DefaultCompression && (level < gzip.BestSpeed || level > gzip.BestCompression) {
			return nil, fmt.Errorf("compress: invalid gzip level %d (valid: %d–%d or %d for default)",
				level, gzip.BestSpeed, gzip.BestCompression, gzip.DefaultCompression)
		}
		return NewGzipCompressor(level), nil

	case FormatZstd:
		if level == 0 {
			level = int(zstd.SpeedDefault)
		}
		encoderLevel := zstd.EncoderLevelFromZstd(level)
		return NewZstdCompressor(encoderLevel), nil

	case FormatNone, "":
		return &NopCompressor{}, nil

	default:
		return nil, fmt.Errorf("compress: unknown format %q (valid: gzip, zstd, none)", format)
	}
}