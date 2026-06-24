package dumper

import (
	"context"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"github.com/example/worker/internal/compress"
	"github.com/example/worker/internal/tempfile"
)

// Dumper orchestrates a pg_dump and optional compression into a local file.
type Dumper struct {
	// StorageDir is the directory where completed dump files are written.
	StorageDir string
	// Compressor is applied to the pg_dump stdout stream. If nil, no compression
	// is applied and the raw SQL is written directly.
	Compressor compress.Compressor
	// PgDumpPath overrides the pg_dump binary path. Defaults to "pg_dump" (PATH lookup).
	PgDumpPath string
}

// New creates a Dumper with the given options.
func New(storageDir string, c compress.Compressor) *Dumper {
	return &Dumper{
		StorageDir: storageDir,
		Compressor: c,
		PgDumpPath: "pg_dump",
	}
}

// DumpResult contains metadata about a completed dump.
type DumpResult struct {
	// Path is the absolute path of the written dump file.
	Path string
	// Size is the on-disk size of the compressed (or raw) dump file.
	Size int64
	// Duration is the wall-clock time taken to complete the dump.
	Duration time.Duration
}

// Run performs a pg_dump of the database identified by dsn, pipes the output
// through the configured Compressor (if any), and writes the result to a file
// in StorageDir. The filename includes an RFC3339-formatted UTC timestamp and
// the appropriate compression extension.
func (d *Dumper) Run(ctx context.Context, dsn string) (*DumpResult, error) {
	start := time.Now()

	if err := os.MkdirAll(d.StorageDir, 0o750); err != nil {
		return nil, fmt.Errorf("creating storage dir %q: %w", d.StorageDir, err)
	}

	// Build the output filename.
	ts := time.Now().UTC().Format("20060102T150405Z")
	ext := ".sql"
	if d.Compressor != nil {
		ext += d.Compressor.FileExtension()
	}
	filename := fmt.Sprintf("dump-%s%s", ts, ext)
	outPath := filepath.Join(d.StorageDir, filename)

	// Write to a temp file first so we never leave a partial artifact.
	tmp, err := tempfile.New(d.StorageDir, "dump-*.tmp")
	if err != nil {
		return nil, fmt.Errorf("creating temp file: %w", err)
	}
	defer func() {
		// Clean up the temp file if it still exists (i.e. we didn't rename it).
		if _, statErr := os.Stat(tmp.Name()); statErr == nil {
			_ = os.Remove(tmp.Name())
		}
	}()

	// Set up pg_dump.
	pgDumpPath := d.PgDumpPath
	if pgDumpPath == "" {
		pgDumpPath = "pg_dump"
	}

	connStr, err := dsnToConnectionString(dsn)
	if err != nil {
		return nil, fmt.Errorf("parsing DSN: %w", err)
	}

	cmd := exec.CommandContext(ctx, pgDumpPath, connStr)
	cmd.Env = buildEnv(dsn, os.Environ())

	// Pipe pg_dump stdout through the compressor into the temp file.
	if d.Compressor != nil {
		pr, pw := io.Pipe()

		cmd.Stdout = pw

		// Run the compressor in a goroutine: it reads from the pipe and writes
		// to the temp file. This keeps memory usage O(1) regardless of dump size.
		compressErrCh := make(chan error, 1)
		go func() {
			compressErrCh <- d.Compressor.Compress(pr, tmp)
			_ = pr.Close()
		}()

		// Run pg_dump; close the write-end of the pipe when it exits so that
		// the compressor goroutine can detect EOF.
		runErr := cmd.Run()
		_ = pw.CloseWithError(runErr)

		if compressErr := <-compressErrCh; compressErr != nil {
			_ = tmp.Close()
			return nil, fmt.Errorf("compression failed: %w", compressErr)
		}
		if runErr != nil {
			_ = tmp.Close()
			return nil, fmt.Errorf("pg_dump failed: %w", runErr)
		}
	} else {
		// No compression – write stdout directly to the temp file.
		cmd.Stdout = tmp

		if err := cmd.Run(); err != nil {
			_ = tmp.Close()
			return nil, fmt.Errorf("pg_dump failed: %w", err)
		}
	}

	// Flush and close the temp file before renaming.
	if err := tmp.Close(); err != nil {
		return nil, fmt.Errorf("closing temp file: %w", err)
	}

	// Atomic rename to the final destination.
	if err := os.Rename(tmp.Name(), outPath); err != nil {
		return nil, fmt.Errorf("renaming temp file to %q: %w", outPath, err)
	}

	info, err := os.Stat(outPath)
	if err != nil {
		return nil, fmt.Errorf("stat output file: %w", err)
	}

	return &DumpResult{
		Path:     outPath,
		Size:     info.Size(),
		Duration: time.Since(start),
	}, nil
}