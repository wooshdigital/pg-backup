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
	// FileExtension returns the file extension for the compressed output (e.g. ".gz", ".zst", "").
	FileExtension() string
}

// Format represents the compression format.
type Format string

const (
	FormatGzip Format = "gzip"
	FormatZstd Format = "zstd"
	FormatNone Format = "none"
)

// GzipCompressor compresses data using gzip.
type GzipCompressor struct {
	Level int // compress/gzip level constants, e.g. gzip.BestSpeed, gzip.BestCompression, gzip.DefaultCompression
}

// NewGzipCompressor creates a new GzipCompressor with the given compression level.
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

// FileExtension returns ".gz".
func (g *GzipCompressor) FileExtension() string {
	return ".gz"
}

// ZstdCompressor compresses data using zstd.
type ZstdCompressor struct {
	Level zstd.EncoderLevel
}

// NewZstdCompressor creates a new ZstdCompressor with the given encoder level.
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

// FileExtension returns ".zst".
func (z *ZstdCompressor) FileExtension() string {
	return ".zst"
}

// NoopCompressor passes data through without any compression.
type NoopCompressor struct{}

// Compress copies src to dst without compression.
func (n *NoopCompressor) Compress(src io.Reader, dst io.Writer) error {
	if _, err := io.Copy(dst, src); err != nil {
		return fmt.Errorf("compress/none: copy: %w", err)
	}
	return nil
}

// FileExtension returns "" (no additional extension).
func (n *NoopCompressor) FileExtension() string {
	return ""
}

// Config holds configuration for creating a Compressor.
type Config struct {
	Format           Format
	GzipLevel        int             // used when Format == FormatGzip
	ZstdEncoderLevel zstd.EncoderLevel // used when Format == FormatZstd
}

// NewCompressor creates a Compressor based on the provided Config.
func NewCompressor(cfg Config) (Compressor, error) {
	switch cfg.Format {
	case FormatGzip, "":
		level := cfg.GzipLevel
		if level == 0 {
			level = gzip.DefaultCompression
		}
		return NewGzipCompressor(level), nil
	case FormatZstd:
		level := cfg.ZstdEncoderLevel
		if level == 0 {
			level = zstd.SpeedDefault
		}
		return NewZstdCompressor(level), nil
	case FormatNone:
		return &NoopCompressor{}, nil
	default:
		return nil, fmt.Errorf("compress: unknown format %q", cfg.Format)
	}
}