// Package dumper runs pg_dump and writes the compressed output to a temp file.
package dumper

import (
	"context"
	"fmt"
	"io"
	"os/exec"
	"path/filepath"
	"time"

	"github.com/example/pgdumpworker/internal/compress"
	"github.com/example/pgdumpworker/internal/tempfile"
)

// Options controls a single dump run.
type Options struct {
	// DSN is the PostgreSQL connection string passed to pg_dump.
	DSN string

	// OutputDir is the directory where the dump file is created.
	OutputDir string

	// Compressor is applied between pg_dump's stdout and the output file.
	// If nil, a NopCompressor is used (no compression).
	Compressor compress.Compressor

	// Now is an optional override for the timestamp embedded in the file name.
	// When zero, time.Now().UTC() is used.
	Now time.Time
}

// Result is returned by Run on success.
type Result struct {
	// FilePath is the absolute path to the completed dump file.
	FilePath string
	// BytesWritten is the number of (possibly compressed) bytes written to FilePath.
	BytesWritten int64
}

// Run executes pg_dump and pipes its output through opts.Compressor into a
// temporary file that is atomically renamed to the final destination.
//
// The output filename format is:
//
//	dump-<timestamp>.sql[.gz|.zst]
//
// where the extension depends on the compressor's Extension() method.
func Run(ctx context.Context, opts Options) (*Result, error) {
	if opts.DSN == "" {
		return nil, fmt.Errorf("dumper: DSN is required")
	}
	if opts.OutputDir == "" {
		return nil, fmt.Errorf("dumper: OutputDir is required")
	}

	c := opts.Compressor
	if c == nil {
		c = &compress.NopCompressor{}
	}

	now := opts.Now
	if now.IsZero() {
		now = time.Now().UTC()
	}

	filename := fmt.Sprintf("dump-%s.sql%s", now.Format("20060102T150405Z"), c.Extension())
	finalPath := filepath.Join(opts.OutputDir, filename)

	// Create a temp file in the same directory so that the final rename is
	// atomic on most POSIX file systems.
	tmp, err := tempfile.New(opts.OutputDir, "pgdump-*.tmp")
	if err != nil {
		return nil, fmt.Errorf("dumper: create temp file: %w", err)
	}

	var n int64
	runErr := func() error {
		defer tmp.Cleanup()

		cmd := exec.CommandContext(ctx, "pg_dump", "--no-password", "--format=plain", opts.DSN)

		stdout, err := cmd.StdoutPipe()
		if err != nil {
			return fmt.Errorf("dumper: stdout pipe: %w", err)
		}

		if err := cmd.Start(); err != nil {
			return fmt.Errorf("dumper: start pg_dump: %w", err)
		}

		// Wrap the temp file with a byte-counting writer so we can report size.
		cw := &countingWriter{w: tmp}

		// Stream: pg_dump stdout → compressor → temp file.
		compressErr := c.Compress(stdout, cw)

		// Always wait for pg_dump to exit, even if compression failed.
		waitErr := cmd.Wait()

		if compressErr != nil {
			return fmt.Errorf("dumper: compress: %w", compressErr)
		}
		if waitErr != nil {
			return fmt.Errorf("dumper: pg_dump exited with error: %w", waitErr)
		}

		n = cw.n

		// Flush and sync the temp file before rename.
		if err := tmp.Sync(); err != nil {
			return fmt.Errorf("dumper: sync temp file: %w", err)
		}

		// Atomically move the temp file to the final destination.
		if err := tmp.Commit(finalPath); err != nil {
			return fmt.Errorf("dumper: commit dump file: %w", err)
		}

		return nil
	}()

	if runErr != nil {
		return nil, runErr
	}

	return &Result{
		FilePath:     finalPath,
		BytesWritten: n,
	}, nil
}

// countingWriter wraps an io.Writer and records the total number of bytes
// written.
type countingWriter struct {
	w io.Writer
	n int64
}

func (cw *countingWriter) Write(p []byte) (int, error) {
	nn, err := cw.w.Write(p)
	cw.n += int64(nn)
	return nn, err
}