package compress

import "io"

// Compressor reads uncompressed data from r and writes compressed data to w.
type Compressor interface {
	Compress(r io.Reader, w io.Writer) error
	Extension() string
}