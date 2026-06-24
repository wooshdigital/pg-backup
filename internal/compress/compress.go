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
	// FileExtension returns the file extension associated with this compressor (e.g. ".gz").
	FileExtension() string
}

// GzipCompressor compresses data using gzip.
type GzipCompressor struct {
	Level int // compression level, e.g. gzip.DefaultCompression
}

// NewGzipCompressor returns a GzipCompressor with the given level.
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
		return fmt.Errorf("gzip: create writer: %w", err)
	}
	if _, err := io.Copy(w, src); err != nil {
		_ = w.Close()
		return fmt.Errorf("gzip: copy: %w", err)
	}
	if err := w.Close(); err != nil {
		return fmt.Errorf("gzip: close writer: %w", err)
	}
	return nil
}

// FileExtension returns ".gz".
func (g *GzipCompressor) FileExtension() string {
	return ".gz"
}

// ZstdCompressor compresses data using zstd.
type ZstdCompressor struct {
	Level zstd.EncoderLevel
}

// NewZstdCompressor returns a ZstdCompressor with the given level.
// level maps 1–4 to zstd encoder speeds; 0 defaults to SpeedDefault.
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

// Compress reads from src, compresses with zstd, and writes to dst.
func (z *ZstdCompressor) Compress(src io.Reader, dst io.Writer) error {
	w, err := zstd.NewWriter(dst, zstd.WithEncoderLevel(z.Level))
	if err != nil {
		return fmt.Errorf("zstd: create writer: %w", err)
	}
	if _, err := io.Copy(w, src); err != nil {
		_ = w.Close()
		return fmt.Errorf("zstd: copy: %w", err)
	}
	if err := w.Close(); err != nil {
		return fmt.Errorf("zstd: close writer: %w", err)
	}
	return nil
}

// FileExtension returns ".zst".
func (z *ZstdCompressor) FileExtension() string {
	return ".zst"
}

// NoneCompressor passes data through without compression.
type NoneCompressor struct{}

// Compress copies src to dst without any compression.
func (n *NoneCompressor) Compress(src io.Reader, dst io.Writer) error {
	if _, err := io.Copy(dst, src); err != nil {
		return fmt.Errorf("none: copy: %w", err)
	}
	return nil
}

// FileExtension returns an empty string (no additional extension).
func (n *NoneCompressor) FileExtension() string {
	return ""
}