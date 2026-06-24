package dumper

import (
	"context"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"github.com/example/myapp/internal/compress"
	"github.com/example/myapp/internal/tempfile"
)

// Dumper orchestrates a pg_dump run and writes the (optionally compressed)
// output to a file in the configured output directory.
type Dumper struct {
	cfg        Config
	compressor compress.Compressor
}

// Config holds the settings needed by the Dumper.
type Config struct {
	// DSN is the PostgreSQL connection string.
	DSN string
	// OutputDir is the directory where dump files are written.
	OutputDir string
	// PgDumpPath is the path to the pg_dump binary (defaults to "pg_dump").
	PgDumpPath string
}

// New creates a Dumper that will compress output with the given Compressor.
// Pass a *compress.NoopCompressor to skip compression.
func New(cfg Config, c compress.Compressor) (*Dumper, error) {
	if c == nil {
		c = &compress.NoopCompressor{}
	}
	if cfg.PgDumpPath == "" {
		cfg.PgDumpPath = "pg_dump"
	}
	if cfg.OutputDir == "" {
		cfg.OutputDir = os.TempDir()
	}
	return &Dumper{cfg: cfg, compressor: c}, nil
}

// DumpResult contains metadata about a completed dump operation.
type DumpResult struct {
	// Path is the absolute path to the dump file.
	Path string
	// Size is the size of the dump file in bytes.
	Size int64
	// Duration is how long the dump took.
	Duration time.Duration
	// StartedAt is when the dump started.
	StartedAt time.Time
}

// Dump runs pg_dump, pipes its stdout through the configured compressor,
// and writes the result to a timestamped file in the output directory.
// It streams data so memory usage stays flat regardless of database size.
func (d *Dumper) Dump(ctx context.Context) (*DumpResult, error) {
	startedAt := time.Now().UTC()

	// Build the output filename before starting so we can name the temp file correctly.
	timestamp := startedAt.Format("20060102T150405Z")
	ext := ".sql" + d.compressor.Extension()
	filename := fmt.Sprintf("dump-%s%s", timestamp, ext)

	if err := os.MkdirAll(d.cfg.OutputDir, 0o750); err != nil {
		return nil, fmt.Errorf("creating output directory %q: %w", d.cfg.OutputDir, err)
	}

	// Create a temp file in the output directory so the final rename is atomic.
	tmp, err := tempfile.New(d.cfg.OutputDir, "pgdump-*"+ext)
	if err != nil {
		return nil, fmt.Errorf("creating temp file: %w", err)
	}
	tmpPath := tmp.Name()

	// Ensure the temp file is cleaned up on any error path.
	success := false
	defer func() {
		if !success {
			_ = tmp.Close()
			_ = os.Remove(tmpPath)
		}
	}()

	// Set up pg_dump command.
	args, err := buildPgDumpArgs(d.cfg.DSN)
	if err != nil {
		return nil, fmt.Errorf("building pg_dump arguments: %w", err)
	}

	cmd := exec.CommandContext(ctx, d.cfg.PgDumpPath, args...)
	cmd.Env = pgDumpEnv(d.cfg.DSN, os.Environ())

	// Connect pg_dump stdout to a pipe so we can stream through the compressor.
	pgDumpOut, err := cmd.StdoutPipe()
	if err != nil {
		return nil, fmt.Errorf("creating pg_dump stdout pipe: %w", err)
	}

	// Capture stderr for error reporting.
	stderrPipe, err := cmd.StderrPipe()
	if err != nil {
		return nil, fmt.Errorf("creating pg_dump stderr pipe: %w", err)
	}

	if err := cmd.Start(); err != nil {
		return nil, fmt.Errorf("starting pg_dump: %w", err)
	}

	// Read stderr asynchronously so it doesn't block stdout.
	stderrCh := make(chan []byte, 1)
	go func() {
		b, _ := io.ReadAll(stderrPipe)
		stderrCh <- b
	}()

	// Stream pg_dump stdout → compressor → temp file.
	compressErr := d.compressor.Compress(pgDumpOut, tmp)

	// Always wait for pg_dump to exit so we get its exit code.
	waitErr := cmd.Wait()

	stderr := <-stderrCh

	if compressErr != nil {
		return nil, fmt.Errorf("compressing pg_dump output: %w", compressErr)
	}
	if waitErr != nil {
		if len(stderr) > 0 {
			return nil, fmt.Errorf("pg_dump failed: %w\nstderr: %s", waitErr, stderr)
		}
		return nil, fmt.Errorf("pg_dump failed: %w", waitErr)
	}

	// Flush and get size before closing.
	size, err := tmp.Seek(0, io.SeekEnd)
	if err != nil {
		return nil, fmt.Errorf("seeking temp file: %w", err)
	}
	if err := tmp.Close(); err != nil {
		return nil, fmt.Errorf("closing temp file: %w", err)
	}

	// Atomically rename to the final destination.
	finalPath := filepath.Join(d.cfg.OutputDir, filename)
	if err := os.Rename(tmpPath, finalPath); err != nil {
		return nil, fmt.Errorf("renaming dump file to %q: %w", finalPath, err)
	}

	success = true
	return &DumpResult{
		Path:      finalPath,
		Size:      size,
		Duration:  time.Since(startedAt),
		StartedAt: startedAt,
	}, nil
}