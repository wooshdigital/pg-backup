// Package dumper orchestrates pg_dump execution and streams the output
// through a configurable compression pipeline into a temporary file.
package dumper

import (
	"context"
	"fmt"
	"os/exec"
	"path/filepath"
	"time"

	"github.com/your-org/dbworker/internal/compress"
	"github.com/your-org/dbworker/internal/tempfile"
)

// Dumper runs pg_dump and writes the (optionally compressed) output to a file.
type Dumper struct {
	DSN        string
	OutputDir  string
	Compressor compress.Compressor
}

// New creates a Dumper from the provided options.
func New(dsn, outputDir string, c compress.Compressor) *Dumper {
	if c == nil {
		c = &compress.NopCompressor{}
	}
	return &Dumper{
		DSN:        dsn,
		OutputDir:  outputDir,
		Compressor: c,
	}
}

// Result holds the outcome of a successful dump.
type Result struct {
	// Path is the absolute path to the produced dump file.
	Path string
	// Size is the size of the produced file in bytes.
	Size int64
	// Duration is how long the dump + compression took.
	Duration time.Duration
}

// Run executes pg_dump for the configured DSN, pipes the output through the
// Compressor, and writes the result to OutputDir. The file is named using the
// current UTC timestamp and the compressor's extension, e.g.
//
//	dump-20260619T120000Z.sql.gz
//
// On success it returns a Result describing the artifact.
func (d *Dumper) Run(ctx context.Context) (*Result, error) {
	start := time.Now()

	ext := ".sql" + d.Compressor.Extension()
	filename := fmt.Sprintf("dump-%sZ%s", time.Now().UTC().Format("20060102T150405"), ext)
	destPath := filepath.Join(d.OutputDir, filename)

	// Create the destination temp file (atomic rename on close).
	tf, err := tempfile.New(destPath)
	if err != nil {
		return nil, fmt.Errorf("dumper: create temp file: %w", err)
	}

	// Build the pg_dump command.
	//nolint:gosec // DSN is supplied by trusted config, not user input.
	cmd := exec.CommandContext(ctx, "pg_dump", "--no-password", d.DSN)
	cmd.Stdout = nil // we capture via pipe below

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		_ = tf.Discard()
		return nil, fmt.Errorf("dumper: stdout pipe: %w", err)
	}

	if err := cmd.Start(); err != nil {
		_ = tf.Discard()
		return nil, fmt.Errorf("dumper: start pg_dump: %w", err)
	}

	// Stream pg_dump stdout → compressor → temp file.
	compressErr := d.Compressor.Compress(stdout, tf)

	// Always wait for the child process.
	waitErr := cmd.Wait()

	if compressErr != nil {
		_ = tf.Discard()
		return nil, fmt.Errorf("dumper: compress: %w", compressErr)
	}
	if waitErr != nil {
		_ = tf.Discard()
		return nil, fmt.Errorf("dumper: pg_dump: %w", waitErr)
	}

	size, err := tf.Commit()
	if err != nil {
		return nil, fmt.Errorf("dumper: commit: %w", err)
	}

	return &Result{
		Path:     destPath,
		Size:     size,
		Duration: time.Since(start),
	}, nil
}