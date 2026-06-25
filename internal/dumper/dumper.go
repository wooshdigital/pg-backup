// Package dumper runs pg_dump and streams the output through a compressor into a temp file.
package dumper

import (
	"context"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"github.com/your-org/your-project/internal/compress"
	"github.com/your-org/your-project/internal/tempfile"
)

const (
	dumpFilePrefix = "dump-"
	dumpFileBase   = ".sql"
)

// Dumper orchestrates pg_dump execution and writes compressed output to a file.
type Dumper struct {
	// DSN is the PostgreSQL connection string passed to pg_dump.
	DSN string

	// OutputDir is the directory where completed dump files are written.
	// Defaults to the OS temp directory when empty.
	OutputDir string

	// Compressor is applied to the pg_dump output stream. When nil, a
	// NoneCompressor is used (no compression).
	Compressor compress.Compressor

	// PgDumpPath overrides the pg_dump binary location. Defaults to "pg_dump"
	// (resolved via PATH).
	PgDumpPath string
}

// Result holds information about a successfully completed dump.
type Result struct {
	// Path is the absolute path to the dump file.
	Path string

	// Size is the compressed (on-disk) size in bytes.
	Size int64

	// Duration is how long the dump took end-to-end.
	Duration time.Duration
}

// Run executes pg_dump, pipes its stdout through the configured Compressor, and
// writes the result to a timestamped file in OutputDir.
//
// The context is forwarded to the pg_dump process; cancellation aborts the dump.
func (d *Dumper) Run(ctx context.Context) (*Result, error) {
	start := time.Now()

	compressor := d.Compressor
	if compressor == nil {
		compressor = &compress.NoneCompressor{}
	}

	pgDump := d.PgDumpPath
	if pgDump == "" {
		pgDump = "pg_dump"
	}

	// Build output filename: dump-<timestamp>.sql[.gz|.zst]
	ts := time.Now().UTC().Format("20060102T150405Z")
	filename := dumpFilePrefix + ts + dumpFileBase + compressor.FileExtension()

	outDir := d.OutputDir
	if outDir == "" {
		outDir = os.TempDir()
	}

	// Create a temporary file in the output directory so that we can rename it
	// atomically on success.
	tmp, err := tempfile.New(outDir, dumpFilePrefix+"*.tmp")
	if err != nil {
		return nil, fmt.Errorf("dumper: create temp file: %w", err)
	}
	tmpPath := tmp.Name()

	success := false
	defer func() {
		if !success {
			_ = tmp.Close()
			_ = os.Remove(tmpPath)
		}
	}()

	// Build pg_dump command.
	//nolint:gosec // DSN is provided by trusted configuration.
	cmd := exec.CommandContext(ctx, pgDump, d.DSN)
	cmd.Stderr = os.Stderr

	pgStdout, err := cmd.StdoutPipe()
	if err != nil {
		return nil, fmt.Errorf("dumper: stdout pipe: %w", err)
	}

	if err := cmd.Start(); err != nil {
		return nil, fmt.Errorf("dumper: start pg_dump: %w", err)
	}

	// Stream pg_dump stdout → compressor → temp file.
	compressErr := d.compress(compressor, pgStdout, tmp)

	// Always wait for the process; capture its exit code.
	waitErr := cmd.Wait()

	if compressErr != nil {
		return nil, fmt.Errorf("dumper: compression failed: %w", compressErr)
	}
	if waitErr != nil {
		return nil, fmt.Errorf("dumper: pg_dump exited with error: %w", waitErr)
	}

	// Flush and sync the temp file before rename.
	if err := tmp.Sync(); err != nil {
		return nil, fmt.Errorf("dumper: sync temp file: %w", err)
	}

	info, err := tmp.Stat()
	if err != nil {
		return nil, fmt.Errorf("dumper: stat temp file: %w", err)
	}
	size := info.Size()

	if err := tmp.Close(); err != nil {
		return nil, fmt.Errorf("dumper: close temp file: %w", err)
	}

	// Rename to final filename.
	finalPath := filepath.Join(outDir, filename)
	if err := os.Rename(tmpPath, finalPath); err != nil {
		return nil, fmt.Errorf("dumper: rename to final path: %w", err)
	}

	success = true

	return &Result{
		Path:     finalPath,
		Size:     size,
		Duration: time.Since(start),
	}, nil
}

// compress pipes src through the compressor into dst.
func (d *Dumper) compress(c compress.Compressor, src io.Reader, dst io.Writer) error {
	return c.Compress(src, dst)
}