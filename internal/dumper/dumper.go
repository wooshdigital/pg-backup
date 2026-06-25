package dumper

import (
	"context"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"github.com/sno6/gosane/internal/compress"
)

const dumpTimestampFormat = "20060102T150405Z"

// Options configures a single dump operation.
type Options struct {
	// DSN is the PostgreSQL connection string.
	DSN string

	// OutputDir is where the dump file will be written.
	OutputDir string

	// Compressor is used to compress the pg_dump output.
	// Pass a *compress.NopCompressor (or nil) for no compression.
	Compressor compress.Compressor
}

// Result holds information about a completed dump.
type Result struct {
	// FilePath is the absolute path to the dump artifact.
	FilePath string

	// Duration is the time taken to produce the dump.
	Duration time.Duration

	// CompressedSize is the size of the output file in bytes.
	CompressedSize int64
}

// Dumper orchestrates pg_dump and optional compression.
type Dumper struct {
	opts Options
}

// New creates a Dumper with the provided options.
// If opts.Compressor is nil a NopCompressor is used (no compression).
func New(opts Options) *Dumper {
	if opts.Compressor == nil {
		opts.Compressor = &compress.NopCompressor{}
	}
	return &Dumper{opts: opts}
}

// Dump runs pg_dump and writes the (optionally compressed) output to a file
// inside opts.OutputDir.  The pipeline is:
//
//	pg_dump stdout → Compressor.Compress → output file
//
// Memory usage is O(1) regardless of dump size because io.Pipe keeps at most
// one write buffer in flight at a time.
func (d *Dumper) Dump(ctx context.Context) (*Result, error) {
	if err := os.MkdirAll(d.opts.OutputDir, 0o755); err != nil {
		return nil, fmt.Errorf("dumper: mkdir %q: %w", d.opts.OutputDir, err)
	}

	filename := dumpFilename(time.Now().UTC(), d.opts.Compressor.Extension())
	outPath := filepath.Join(d.opts.OutputDir, filename)

	outFile, err := os.Create(outPath)
	if err != nil {
		return nil, fmt.Errorf("dumper: create output file %q: %w", outPath, err)
	}
	// outFile is closed by the deferred cleanup or at the end of this function.

	start := time.Now()

	if err := d.runPipeline(ctx, outFile); err != nil {
		outFile.Close()
		os.Remove(outPath) // clean up partial file on error
		return nil, err
	}

	if err := outFile.Close(); err != nil {
		os.Remove(outPath)
		return nil, fmt.Errorf("dumper: close output file: %w", err)
	}

	info, err := os.Stat(outPath)
	if err != nil {
		return nil, fmt.Errorf("dumper: stat output file: %w", err)
	}

	return &Result{
		FilePath:       outPath,
		Duration:       time.Since(start),
		CompressedSize: info.Size(),
	}, nil
}

// runPipeline wires pg_dump stdout through the compressor into dst.
func (d *Dumper) runPipeline(ctx context.Context, dst io.Writer) error {
	args, err := pgDumpArgs(d.opts.DSN)
	if err != nil {
		return fmt.Errorf("dumper: build pg_dump args: %w", err)
	}

	cmd := exec.CommandContext(ctx, "pg_dump", args...)
	cmd.Stderr = os.Stderr // surface pg_dump errors to our stderr

	pgOut, err := cmd.StdoutPipe()
	if err != nil {
		return fmt.Errorf("dumper: stdout pipe: %w", err)
	}

	if err := cmd.Start(); err != nil {
		return fmt.Errorf("dumper: start pg_dump: %w", err)
	}

	// Compress streams pg_dump output directly into dst; no intermediate buffer.
	compressErr := d.opts.Compressor.Compress(pgOut, dst)

	// Always wait for pg_dump to finish so we capture its exit code.
	waitErr := cmd.Wait()

	if compressErr != nil {
		return fmt.Errorf("dumper: compression failed: %w", compressErr)
	}
	if waitErr != nil {
		return fmt.Errorf("dumper: pg_dump exited with error: %w", waitErr)
	}

	return nil
}

// dumpFilename produces a timestamped filename with the appropriate extension.
// Example: dump-20260619T120000Z.sql.gz
func dumpFilename(t time.Time, compressionExt string) string {
	base := fmt.Sprintf("dump-%s.sql", t.Format(dumpTimestampFormat))
	return base + compressionExt
}

// pgDumpArgs builds the argument list for pg_dump from a DSN.
func pgDumpArgs(dsn string) ([]string, error) {
	if dsn == "" {
		return nil, fmt.Errorf("DSN must not be empty")
	}
	// --no-password prevents interactive prompts.
	// The DSN / connection URI is passed directly to pg_dump.
	return []string{
		"--no-password",
		"--format=plain",
		dsn,
	}, nil
}