package dumper

import (
	"context"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"github.com/your-org/your-repo/internal/compress"
)

// Dumper orchestrates a pg_dump run and compresses the output.
type Dumper struct {
	pgDumpPath string
	outputDir  string
	compressor compress.Compressor
	env        []string
}

// Options configures the Dumper.
type Options struct {
	// PgDumpPath is the path to the pg_dump binary. Defaults to "pg_dump".
	PgDumpPath string
	// OutputDir is the directory where dump files are written.
	OutputDir string
	// Compressor is used to compress pg_dump output. If nil, NoopCompressor is used.
	Compressor compress.Compressor
	// Env is the environment variables to pass to pg_dump (e.g. PGPASSWORD).
	Env []string
}

// New creates a new Dumper with the given options.
func New(opts Options) *Dumper {
	pgDumpPath := opts.PgDumpPath
	if pgDumpPath == "" {
		pgDumpPath = "pg_dump"
	}
	c := opts.Compressor
	if c == nil {
		c = &compress.NoopCompressor{}
	}
	return &Dumper{
		pgDumpPath: pgDumpPath,
		outputDir:  opts.OutputDir,
		compressor: c,
		env:        opts.Env,
	}
}

// DumpResult holds information about a completed dump.
type DumpResult struct {
	FilePath string
	Duration time.Duration
	Bytes    int64
}

// Dump runs pg_dump with the given DSN, compresses the output, and writes it
// to a timestamped file in the configured output directory.
//
// The pipeline is: pg_dump stdout → compressor → temp file → atomic rename.
func (d *Dumper) Dump(ctx context.Context, dsn string) (*DumpResult, error) {
	if err := os.MkdirAll(d.outputDir, 0o750); err != nil {
		return nil, fmt.Errorf("dumper: create output dir: %w", err)
	}

	timestamp := time.Now().UTC().Format("20060102T150405Z")
	ext := ".sql" + d.compressor.FileExtension()
	filename := fmt.Sprintf("dump-%s%s", timestamp, ext)
	finalPath := filepath.Join(d.outputDir, filename)

	// Write to a temp file in the same directory so we can do an atomic rename.
	tmpFile, err := os.CreateTemp(d.outputDir, ".dump-tmp-*")
	if err != nil {
		return nil, fmt.Errorf("dumper: create temp file: %w", err)
	}
	tmpPath := tmpFile.Name()

	// Clean up temp file on failure.
	success := false
	defer func() {
		if !success {
			_ = os.Remove(tmpPath)
		}
	}()

	start := time.Now()

	// pg_dump stdout → pipe reader
	pr, pw := io.Pipe()

	cmd := exec.CommandContext(ctx, d.pgDumpPath, dsn) //nolint:gosec
	cmd.Stdout = pw
	cmd.Stderr = os.Stderr
	if len(d.env) > 0 {
		cmd.Env = append(os.Environ(), d.env...)
	}

	if err := cmd.Start(); err != nil {
		_ = pw.Close()
		_ = pr.Close()
		_ = tmpFile.Close()
		return nil, fmt.Errorf("dumper: start pg_dump: %w", err)
	}

	// Run compression in the current goroutine while pg_dump writes to the pipe.
	compressErrCh := make(chan error, 1)
	go func() {
		// Close the write end of the pipe when pg_dump exits.
		waitErr := cmd.Wait()
		if waitErr != nil {
			_ = pw.CloseWithError(fmt.Errorf("dumper: pg_dump: %w", waitErr))
		} else {
			_ = pw.Close()
		}
		compressErrCh <- waitErr
	}()

	// Compress from pipe reader → temp file.
	if err := d.compressor.Compress(pr, tmpFile); err != nil {
		_ = pr.Close()
		_ = tmpFile.Close()
		<-compressErrCh
		return nil, fmt.Errorf("dumper: compress: %w", err)
	}
	_ = pr.Close()

	// Wait for pg_dump to finish.
	if waitErr := <-compressErrCh; waitErr != nil {
		_ = tmpFile.Close()
		return nil, fmt.Errorf("dumper: pg_dump wait: %w", waitErr)
	}

	elapsed := time.Since(start)

	// Sync and close the temp file before rename.
	if err := tmpFile.Sync(); err != nil {
		_ = tmpFile.Close()
		return nil, fmt.Errorf("dumper: sync temp file: %w", err)
	}
	if err := tmpFile.Close(); err != nil {
		return nil, fmt.Errorf("dumper: close temp file: %w", err)
	}

	// Stat to get the written size.
	fi, err := os.Stat(tmpPath)
	if err != nil {
		return nil, fmt.Errorf("dumper: stat temp file: %w", err)
	}
	writtenBytes := fi.Size()

	// Atomic rename.
	if err := os.Rename(tmpPath, finalPath); err != nil {
		return nil, fmt.Errorf("dumper: rename to final path: %w", err)
	}
	success = true

	return &DumpResult{
		FilePath: finalPath,
		Duration: elapsed,
		Bytes:    writtenBytes,
	}, nil
}