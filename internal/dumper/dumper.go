// Package dumper runs pg_dump and writes the output through a compression pipeline.
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

// Dumper orchestrates running pg_dump and compressing its output to a file.
type Dumper struct {
	// DSN is the PostgreSQL connection string passed to pg_dump.
	DSN string

	// OutputDir is the directory where the final dump file is written.
	OutputDir string

	// Compressor is the compression pipeline to use.
	Compressor compress.Compressor

	// PgDumpPath is the path to the pg_dump binary. Defaults to "pg_dump".
	PgDumpPath string

	// Clock is used for generating timestamps. Defaults to time.Now (UTC).
	Clock func() time.Time
}

// New creates a Dumper with the given DSN, output directory, and compressor.
func New(dsn, outputDir string, compressor compress.Compressor) *Dumper {
	return &Dumper{
		DSN:        dsn,
		OutputDir:  outputDir,
		Compressor: compressor,
		PgDumpPath: "pg_dump",
		Clock:      func() time.Time { return time.Now().UTC() },
	}
}

// DumpResult holds information about a completed dump.
type DumpResult struct {
	// Path is the absolute path to the written dump file.
	Path string

	// Size is the compressed size of the dump file in bytes.
	Size int64

	// Duration is the total wall-clock time for the dump.
	Duration time.Duration
}

// Run executes pg_dump, pipes its stdout through the configured Compressor,
// and writes the result to a timestamped file in OutputDir.
//
// The process is:
//
//	pg_dump → compressor writer (streaming) → temp file → atomic rename
//
// Memory usage is O(compression buffer) regardless of database size.
func (d *Dumper) Run(ctx context.Context) (*DumpResult, error) {
	start := time.Now()

	if err := os.MkdirAll(d.OutputDir, 0o755); err != nil {
		return nil, fmt.Errorf("dumper: create output dir %q: %w", d.OutputDir, err)
	}

	// Determine final filename with timestamp and compression extension.
	ts := d.Clock().Format("20060102T150405Z")
	ext := d.Compressor.Extension()
	filename := fmt.Sprintf("dump-%s.sql%s", ts, ext)
	finalPath := filepath.Join(d.OutputDir, filename)

	// Write to a temp file first for atomic rename.
	tmp, err := tempfile.New(d.OutputDir, "dump-*.sql"+ext+".tmp")
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

	// Set up pg_dump command.
	pgDumpPath := d.PgDumpPath
	if pgDumpPath == "" {
		pgDumpPath = "pg_dump"
	}

	//nolint:gosec // DSN is controlled by configuration, not user input.
	cmd := exec.CommandContext(ctx, pgDumpPath, d.DSN)
	cmd.Stderr = os.Stderr

	// Pipe pg_dump stdout through the compressor to the temp file.
	pgDumpStdout, err := cmd.StdoutPipe()
	if err != nil {
		return nil, fmt.Errorf("dumper: stdout pipe: %w", err)
	}

	if err := cmd.Start(); err != nil {
		return nil, fmt.Errorf("dumper: start pg_dump: %w", err)
	}

	// compressErr channels any error from the compress goroutine.
	compressErr := make(chan error, 1)
	go func() {
		compressErr <- d.Compressor.Compress(pgDumpStdout, tmp)
	}()

	// Wait for pg_dump to finish.
	pgErr := cmd.Wait()

	// Wait for compression to finish.
	cErr := <-compressErr

	if pgErr != nil {
		return nil, fmt.Errorf("dumper: pg_dump: %w", pgErr)
	}
	if cErr != nil {
		return nil, fmt.Errorf("dumper: compress: %w", cErr)
	}

	// Flush and sync the temp file before renaming.
	if err := tmp.Sync(); err != nil {
		return nil, fmt.Errorf("dumper: sync temp file: %w", err)
	}

	// Get compressed size.
	info, err := tmp.Stat()
	if err != nil {
		return nil, fmt.Errorf("dumper: stat temp file: %w", err)
	}
	size := info.Size()

	if err := tmp.Close(); err != nil {
		return nil, fmt.Errorf("dumper: close temp file: %w", err)
	}

	// Atomic rename to final path.
	if err := os.Rename(tmpPath, finalPath); err != nil {
		return nil, fmt.Errorf("dumper: rename %q -> %q: %w", tmpPath, finalPath, err)
	}

	success = true
	return &DumpResult{
		Path:     finalPath,
		Size:     size,
		Duration: time.Since(start),
	}, nil
}

// RunWithReader is a testable variant of Run that accepts an io.Reader instead
// of spawning pg_dump. This is used in unit tests to inject synthetic dump data.
func (d *Dumper) RunWithReader(ctx context.Context, src io.Reader) (*DumpResult, error) {
	start := time.Now()

	if err := os.MkdirAll(d.OutputDir, 0o755); err != nil {
		return nil, fmt.Errorf("dumper: create output dir: %w", err)
	}

	ts := d.Clock().Format("20060102T150405Z")
	ext := d.Compressor.Extension()
	filename := fmt.Sprintf("dump-%s.sql%s", ts, ext)
	finalPath := filepath.Join(d.OutputDir, filename)

	tmp, err := tempfile.New(d.OutputDir, "dump-*.sql"+ext+".tmp")
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

	if err := d.Compressor.Compress(src, tmp); err != nil {
		return nil, fmt.Errorf("dumper: compress: %w", err)
	}

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

	if err := os.Rename(tmpPath, finalPath); err != nil {
		return nil, fmt.Errorf("dumper: rename: %w", err)
	}

	success = true
	return &DumpResult{
		Path:     finalPath,
		Size:     size,
		Duration: time.Since(start),
	}, nil
}