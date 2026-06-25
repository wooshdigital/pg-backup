package dumper

import (
	"context"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"github.com/yourusername/pg-dump-worker/internal/compress"
	"github.com/yourusername/pg-dump-worker/internal/tempfile"
)

// Dumper orchestrates running pg_dump and persisting the compressed output.
type Dumper struct {
	// OutputDir is the directory where final dump files are written.
	OutputDir string

	// Compressor is used to compress the pg_dump stdout stream.
	// Use a NoopCompressor for uncompressed output.
	Compressor compress.Compressor

	// PgDumpPath overrides the pg_dump binary path (defaults to "pg_dump").
	PgDumpPath string
}

// New creates a Dumper with the given output directory and compressor.
func New(outputDir string, c compress.Compressor) *Dumper {
	return &Dumper{
		OutputDir:  outputDir,
		Compressor: c,
		PgDumpPath: "pg_dump",
	}
}

// DumpResult holds metadata about a completed dump.
type DumpResult struct {
	// Path is the absolute path to the dump file.
	Path string
	// Size is the size of the compressed artifact in bytes.
	Size int64
	// Duration is how long the dump took.
	Duration time.Duration
}

// Dump runs pg_dump against dsn and writes the (optionally compressed) output
// to a timestamped file in OutputDir. The output is streamed through the
// configured Compressor so memory usage is bounded regardless of database size.
func (d *Dumper) Dump(ctx context.Context, dsn string) (*DumpResult, error) {
	start := time.Now()

	if err := os.MkdirAll(d.OutputDir, 0o750); err != nil {
		return nil, fmt.Errorf("dumper: mkdir %q: %w", d.OutputDir, err)
	}

	// Build the output filename: dump-<timestamp>.sql[.gz|.zst]
	ts := time.Now().UTC().Format("20060102T150405Z")
	ext := ".sql" + d.Compressor.Extension()
	filename := fmt.Sprintf("dump-%s%s", ts, ext)
	finalPath := filepath.Join(d.OutputDir, filename)

	// Write to a temp file in the same directory so we can atomically rename.
	tmp, err := tempfile.New(d.OutputDir, "dump-*.tmp")
	if err != nil {
		return nil, fmt.Errorf("dumper: create temp file: %w", err)
	}
	tmpPath := tmp.Name()
	// Ensure temp file is cleaned up on failure.
	success := false
	defer func() {
		if !success {
			tmp.Close()
			os.Remove(tmpPath)
		}
	}()

	// Start pg_dump.
	pgDump := d.PgDumpPath
	if pgDump == "" {
		pgDump = "pg_dump"
	}
	cmd := exec.CommandContext(ctx, pgDump, "--no-password", "--format=plain", dsn)
	cmd.Env = buildEnv(dsn)

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return nil, fmt.Errorf("dumper: stdout pipe: %w", err)
	}
	cmd.Stderr = os.Stderr

	if err := cmd.Start(); err != nil {
		return nil, fmt.Errorf("dumper: start pg_dump: %w", err)
	}

	// Stream pg_dump stdout → compressor → temp file.
	compressErr := d.Compressor.Compress(stdout, tmp)

	// Wait for pg_dump to exit. We check this even if compress failed so the
	// process is properly reaped.
	waitErr := cmd.Wait()

	if compressErr != nil {
		return nil, fmt.Errorf("dumper: compress: %w", compressErr)
	}
	if waitErr != nil {
		return nil, fmt.Errorf("dumper: pg_dump: %w", waitErr)
	}

	// Flush and close the temp file before renaming.
	if err := tmp.Sync(); err != nil {
		return nil, fmt.Errorf("dumper: sync temp file: %w", err)
	}
	stat, err := tmp.Stat()
	if err != nil {
		return nil, fmt.Errorf("dumper: stat temp file: %w", err)
	}
	size := stat.Size()

	if err := tmp.Close(); err != nil {
		return nil, fmt.Errorf("dumper: close temp file: %w", err)
	}

	// Atomically move temp file to final destination.
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

// buildEnv constructs the environment for pg_dump, inheriting the current
// process environment. DSN is passed as an argument, not PGPASSWORD, to keep
// secrets out of environment variables where possible.
func buildEnv(dsn string) []string {
	// Inherit the current environment so PATH, locale settings etc. are
	// preserved. Callers may extend this list if needed.
	return os.Environ()
}

// DumpToWriter runs pg_dump and writes compressed output to dst.
// Useful for testing or streaming to object storage without a temp file.
func (d *Dumper) DumpToWriter(ctx context.Context, dsn string, dst io.Writer) error {
	pgDump := d.PgDumpPath
	if pgDump == "" {
		pgDump = "pg_dump"
	}
	cmd := exec.CommandContext(ctx, pgDump, "--no-password", "--format=plain", dsn)
	cmd.Env = buildEnv(dsn)

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return fmt.Errorf("dumper: stdout pipe: %w", err)
	}
	cmd.Stderr = os.Stderr

	if err := cmd.Start(); err != nil {
		return fmt.Errorf("dumper: start pg_dump: %w", err)
	}

	compressErr := d.Compressor.Compress(stdout, dst)
	waitErr := cmd.Wait()

	if compressErr != nil {
		return fmt.Errorf("dumper: compress: %w", compressErr)
	}
	if waitErr != nil {
		return fmt.Errorf("dumper: pg_dump: %w", waitErr)
	}
	return nil
}