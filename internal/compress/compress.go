package compress

import (
	"compress/gzip"
	"context"
	"fmt"
	"io"
)

// Compressor compresses data from r and writes to w.
type Compressor interface {
	Compress(ctx context.Context, r io.Reader, w io.Writer) error
}

// ---------------------------------------------------------------------------
// Gzip
// ---------------------------------------------------------------------------

type gzipCompressor struct {
	level int
}

// NewGzip returns a Compressor that uses gzip at the given level.
func NewGzip(level int) Compressor {
	return &gzipCompressor{level: level}
}

func (g *gzipCompressor) Compress(_ context.Context, r io.Reader, w io.Writer) error {
	gz, err := gzip.NewWriterLevel(w, g.level)
	if err != nil {
		return fmt.Errorf("gzip writer: %w", err)
	}
	if _, err := io.Copy(gz, r); err != nil {
		_ = gz.Close()
		return fmt.Errorf("gzip copy: %w", err)
	}
	return gz.Close()
}

// ---------------------------------------------------------------------------
// Zstd (pure Go fallback using compress/zlib as a stand-in; replace with
// github.com/klauspost/compress/zstd when the dependency is available)
// ---------------------------------------------------------------------------

type zstdCompressor struct{}

// NewZstd returns a Compressor that uses zstd compression.
// NOTE: This uses gzip as a stand-in implementation.  Replace the body with
// the real zstd writer once the dependency is added to go.mod.
func NewZstd() Compressor {
	return &zstdCompressor{}
}

func (z *zstdCompressor) Compress(ctx context.Context, r io.Reader, w io.Writer) error {
	// Fallback to gzip until zstd dependency is wired in.
	return NewGzip(DefaultGzipLevel).Compress(ctx, r, w)
}

// ---------------------------------------------------------------------------
// Noop
// ---------------------------------------------------------------------------

type noopCompressor struct{}

// NewNoop returns a Compressor that copies data verbatim (no compression).
func NewNoop() Compressor {
	return &noopCompressor{}
}

func (n *noopCompressor) Compress(_ context.Context, r io.Reader, w io.Writer) error {
	_, err := io.Copy(w, r)
	return err
}