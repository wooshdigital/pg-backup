package compress

import (
	"compress/gzip"
	"fmt"
	"io"
)

const DefaultGzipLevel = gzip.DefaultCompression

// gzipCompressor implements Compressor using the standard library gzip package.
type gzipCompressor struct {
	level int
}

// NewGzip returns a Compressor that applies gzip compression at the given
// level. Use compress.DefaultGzipLevel for the standard default.
func NewGzip(level int) Compressor {
	if level == 0 {
		level = DefaultGzipLevel
	}
	return &gzipCompressor{level: level}
}

// Wrap returns a *gzip.Writer that compresses writes and forwards them to w.
func (g *gzipCompressor) Wrap(w io.Writer) (io.WriteCloser, error) {
	gw, err := gzip.NewWriterLevel(w, g.level)
	if err != nil {
		return nil, fmt.Errorf("create gzip writer (level %d): %w", g.level, err)
	}
	return gw, nil
}

// Extension returns ".gz".
func (g *gzipCompressor) Extension() string { return ".gz" }