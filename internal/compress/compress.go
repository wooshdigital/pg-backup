package compress

import (
	"compress/gzip"
	"io"
)

// Compressor wraps an io.Reader with compression.
type Compressor interface {
	Compress(r io.Reader) (io.Reader, error)
}

// GzipCompressor compresses data using gzip.
type GzipCompressor struct {
	level int
}

// NewGzip creates a GzipCompressor with the given compression level.
// Use gzip.DefaultCompression (-1) for the default.
func NewGzip(level int) *GzipCompressor {
	return &GzipCompressor{level: level}
}

// Compress wraps r with gzip compression and returns the compressed reader.
func (g *GzipCompressor) Compress(r io.Reader) (io.Reader, error) {
	pr, pw := io.Pipe()

	gz, err := gzip.NewWriterLevel(pw, g.level)
	if err != nil {
		return nil, err
	}

	go func() {
		_, copyErr := io.Copy(gz, r)
		if closeErr := gz.Close(); closeErr != nil && copyErr == nil {
			copyErr = closeErr
		}
		pw.CloseWithError(copyErr)
	}()

	return pr, nil
}