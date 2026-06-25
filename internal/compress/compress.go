package compress

import (
	"compress/gzip"
	"fmt"
	"io"

	"github.com/klauspost/compress/zstd"
)

// Compressor defines the interface for compressing data from a reader to a writer.
type Compressor interface {
	Compress(src io.Reader, dst io.Writer) error
	// Extension returns the file extension to append (e.g. ".gz", ".zst", "").
	Extension() string
}

// GzipCompressor compresses data using the gzip format.
type GzipCompressor struct {
	Level int // compress/gzip level constants (e.g. gzip.BestSpeed, gzip.DefaultCompression)
}

// NewGzipCompressor returns a GzipCompressor with the given level.
// If level is 0 the default compression level is used.
func NewGzipCompressor(level int) *GzipCompressor {
	if level == 0 {
		level = gzip.DefaultCompression
	}
	return &GzipCompressor{Level: level}
}

// Compress reads from src and writes gzip-compressed data to dst.
func (g *GzipCompressor) Compress(src io.Reader, dst io.Writer) error {
	w, err := gzip.NewWriterLevel(dst, g.Level)
	if err != nil {
		return fmt.Errorf("gzip: create writer: %w", err)
	}
	if _, err := io.Copy(w, src); err != nil {
		_ = w.Close()
		return fmt.Errorf("gzip: compress: %w", err)
	}
	if err := w.Close(); err != nil {
		return fmt.Errorf("gzip: close writer: %w", err)
	}
	return nil
}

// Extension returns the gzip file extension.
func (g *GzipCompressor) Extension() string { return ".gz" }

// ZstdCompressor compresses data using the Zstandard format.
type ZstdCompressor struct {
	Level zstd.EncoderLevel
}

// NewZstdCompressor returns a ZstdCompressor with the given level.
// level should be 1–4 (maps to zstd speed/compression presets).
// If level is 0 the default level is used.
func NewZstdCompressor(level int) *ZstdCompressor {
	var encLevel zstd.EncoderLevel
	switch level {
	case 1:
		encLevel = zstd.SpeedFastest
	case 2:
		encLevel = zstd.SpeedDefault
	case 3:
		encLevel = zstd.SpeedBetterCompression
	case 4:
		encLevel = zstd.SpeedBestCompression
	default:
		encLevel = zstd.SpeedDefault
	}
	return &ZstdCompressor{Level: encLevel}
}

// Compress reads from src and writes zstd-compressed data to dst.
func (z *ZstdCompressor) Compress(src io.Reader, dst io.Writer) error {
	w, err := zstd.NewWriter(dst, zstd.WithEncoderLevel(z.Level))
	if err != nil {
		return fmt.Errorf("zstd: create writer: %w", err)
	}
	if _, err := io.Copy(w, src); err != nil {
		_ = w.Close()
		return fmt.Errorf("zstd: compress: %w", err)
	}
	if err := w.Close(); err != nil {
		return fmt.Errorf("zstd: close writer: %w", err)
	}
	return nil
}

// Extension returns the zstd file extension.
func (z *ZstdCompressor) Extension() string { return ".zst" }

// NoopCompressor passes data through without any compression.
type NoopCompressor struct{}

// Compress copies src to dst without modification.
func (n *NoopCompressor) Compress(src io.Reader, dst io.Writer) error {
	if _, err := io.Copy(dst, src); err != nil {
		return fmt.Errorf("noop compressor: copy: %w", err)
	}
	return nil
}

// Extension returns an empty string (no extra extension added).
func (n *NoopCompressor) Extension() string { return "" }