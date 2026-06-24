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
	// FileExtension returns the file extension associated with this compression format.
	FileExtension() string
}

// GzipCompressor compresses data using gzip.
type GzipCompressor struct {
	Level int
}

// NewGzipCompressor creates a new GzipCompressor with the given compression level.
// Level should be between gzip.BestSpeed (1) and gzip.BestCompression (9),
// or gzip.DefaultCompression (-1).
func NewGzipCompressor(level int) (*GzipCompressor, error) {
	if level != gzip.DefaultCompression && level != gzip.NoCompression &&
		(level < gzip.BestSpeed || level > gzip.BestCompression) {
		return nil, fmt.Errorf("invalid gzip compression level: %d", level)
	}
	return &GzipCompressor{Level: level}, nil
}

// Compress reads from src, compresses using gzip, and writes to dst.
func (g *GzipCompressor) Compress(src io.Reader, dst io.Writer) error {
	w, err := gzip.NewWriterLevel(dst, g.Level)
	if err != nil {
		return fmt.Errorf("creating gzip writer: %w", err)
	}

	if _, err := io.Copy(w, src); err != nil {
		_ = w.Close()
		return fmt.Errorf("compressing data: %w", err)
	}

	if err := w.Close(); err != nil {
		return fmt.Errorf("closing gzip writer: %w", err)
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

// NewZstdCompressor creates a new ZstdCompressor with the given compression level.
func NewZstdCompressor(level int) (*ZstdCompressor, error) {
	var encoderLevel zstd.EncoderLevel
	switch level {
	case 1:
		encoderLevel = zstd.SpeedFastest
	case 2:
		encoderLevel = zstd.SpeedDefault
	case 3:
		encoderLevel = zstd.SpeedBetterCompression
	case 4:
		encoderLevel = zstd.SpeedBestCompression
	default:
		encoderLevel = zstd.SpeedDefault
	}
	return &ZstdCompressor{Level: encoderLevel}, nil
}

// Compress reads from src, compresses using zstd, and writes to dst.
func (z *ZstdCompressor) Compress(src io.Reader, dst io.Writer) error {
	w, err := zstd.NewWriter(dst, zstd.WithEncoderLevel(z.Level))
	if err != nil {
		return fmt.Errorf("creating zstd writer: %w", err)
	}

	if _, err := io.Copy(w, src); err != nil {
		_ = w.Close()
		return fmt.Errorf("compressing data: %w", err)
	}

	if err := w.Close(); err != nil {
		return fmt.Errorf("closing zstd writer: %w", err)
	}

	return nil
}

// FileExtension returns ".zst".
func (z *ZstdCompressor) FileExtension() string {
	return ".zst"
}

// NoOpCompressor passes data through without any compression.
type NoOpCompressor struct{}

// Compress copies src to dst without compression.
func (n *NoOpCompressor) Compress(src io.Reader, dst io.Writer) error {
	if _, err := io.Copy(dst, src); err != nil {
		return fmt.Errorf("copying data: %w", err)
	}
	return nil
}

// FileExtension returns "" (no additional extension).
func (n *NoOpCompressor) FileExtension() string {
	return ""
}

// Format represents a compression format.
type Format string

const (
	FormatGzip Format = "gzip"
	FormatZstd Format = "zstd"
	FormatNone Format = "none"
)

// NewCompressor creates a Compressor based on the format and level.
func NewCompressor(format Format, level int) (Compressor, error) {
	switch format {
	case FormatGzip:
		if level == 0 {
			level = gzip.DefaultCompression
		}
		return NewGzipCompressor(level)
	case FormatZstd:
		return NewZstdCompressor(level)
	case FormatNone, "":
		return &NoOpCompressor{}, nil
	default:
		return nil, fmt.Errorf("unknown compression format: %q", format)
	}
}