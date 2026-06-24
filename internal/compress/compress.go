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
	// Extension returns the file extension for the compressed output (e.g., ".gz", ".zst", "").
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
	if level != gzip.DefaultCompression && level != gzip.NoCompression &&
		(level < gzip.BestSpeed || level > gzip.BestCompression) {
		return nil, fmt.Errorf("invalid gzip compression level: %d", level)
	}
	return &GzipCompressor{Level: level}, nil
}

// Compress reads from src, compresses with gzip, and writes to dst.
func (g *GzipCompressor) Compress(src io.Reader, dst io.Writer) error {
	w, err := gzip.NewWriterLevel(dst, g.Level)
	if err != nil {
		return fmt.Errorf("creating gzip writer: %w", err)
	}
	if _, err := io.Copy(w, src); err != nil {
		_ = w.Close()
		return fmt.Errorf("compressing data with gzip: %w", err)
	}
	if err := w.Close(); err != nil {
		return fmt.Errorf("closing gzip writer: %w", err)
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

// NewZstdCompressor creates a new ZstdCompressor with the given compression level.
// Level should be between 1 (fastest) and 4 (best compression) for zstd.
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
		// Default to SpeedDefault for out-of-range values
		encoderLevel = zstd.SpeedDefault
	}
	return &ZstdCompressor{Level: encoderLevel}, nil
}

// Compress reads from src, compresses with zstd, and writes to dst.
func (z *ZstdCompressor) Compress(src io.Reader, dst io.Writer) error {
	w, err := zstd.NewWriter(dst, zstd.WithEncoderLevel(z.Level))
	if err != nil {
		return fmt.Errorf("creating zstd writer: %w", err)
	}
	if _, err := io.Copy(w, src); err != nil {
		_ = w.Close()
		return fmt.Errorf("compressing data with zstd: %w", err)
	}
	if err := w.Close(); err != nil {
		return fmt.Errorf("closing zstd writer: %w", err)
	}
	return nil
}

// Extension returns the zstd file extension.
func (z *ZstdCompressor) Extension() string {
	return ".zst"
}

// NoopCompressor passes data through without compression.
type NoopCompressor struct{}

// Compress copies src to dst without any compression.
func (n *NoopCompressor) Compress(src io.Reader, dst io.Writer) error {
	if _, err := io.Copy(dst, src); err != nil {
		return fmt.Errorf("copying data (no compression): %w", err)
	}
	return nil
}

// Extension returns an empty string (no additional extension for uncompressed data).
func (n *NoopCompressor) Extension() string {
	return ""
}

// Format represents the compression format.
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
		return NewGzipCompressor(level)
	case FormatZstd:
		return NewZstdCompressor(level)
	case FormatNone, "":
		return &NoopCompressor{}, nil
	default:
		return nil, fmt.Errorf("unsupported compression format: %q", format)
	}
}