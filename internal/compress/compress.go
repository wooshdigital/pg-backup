package compress

import (
	"compress/gzip"
	"io"

	"github.com/klauspost/compress/zstd"
)

// Compressor is the interface for compression implementations.
type Compressor interface {
	// Compress reads from r, compresses the data, and writes to w.
	// Returns the number of bytes written to w.
	Compress(r io.Reader, w io.Writer) (int64, error)
}

// GzipCompressor compresses using gzip.
type GzipCompressor struct {
	Level int // 0 means default
}

func (g *GzipCompressor) Compress(r io.Reader, w io.Writer) (int64, error) {
	level := g.Level
	if level == 0 {
		level = gzip.DefaultCompression
	}
	gz, err := gzip.NewWriterLevel(w, level)
	if err != nil {
		return 0, err
	}
	n, err := io.Copy(gz, r)
	if err != nil {
		gz.Close()
		return n, err
	}
	return n, gz.Close()
}

// ZstdCompressor compresses using zstd.
type ZstdCompressor struct{}

func (z *ZstdCompressor) Compress(r io.Reader, w io.Writer) (int64, error) {
	enc, err := zstd.NewWriter(w)
	if err != nil {
		return 0, err
	}
	n, err := io.Copy(enc, r)
	if err != nil {
		enc.Close()
		return n, err
	}
	return n, enc.Close()
}

// NoopCompressor passes data through without compression.
type NoopCompressor struct{}

func (n *NoopCompressor) Compress(r io.Reader, w io.Writer) (int64, error) {
	return io.Copy(w, r)
}