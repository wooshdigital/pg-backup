package dumper

import (
	"context"
	"fmt"
	"io"
	"os/exec"
	"path/filepath"
	"time"

	"github.com/nicholasgasior/gsfmt/internal/compress"
	"github.com/nicholasgasior/gsfmt/internal/tempfile"
)

// Dumper orchestrates pg_dump execution and artifact creation.
type Dumper struct {
	DSN        string
	OutputDir  string
	Compressor compress.Compressor
}

// New returns a Dumper configured with the given DSN, output directory, and compressor.
// If compressor is nil, NoneCompressor is used (no compression).
func New(dsn, outputDir string, compressor compress.Compressor) *Dumper {
	if compressor == nil {
		compressor = &compress.NoneCompressor{}
	}
	return &Dumper{
		DSN:        dsn,
		OutputDir:  outputDir,
		Compressor: compressor,
	}
}

// Run executes pg_dump, pipes its stdout through the Compressor, and writes
// the result to a temp file in OutputDir. The temp file is atomically renamed
// to the final artifact filename and its path is returned.
func (d *Dumper) Run(ctx context.Context) (string, error) {
	timestamp := time.Now().UTC().Format("20060102T150405Z")
	ext := d.Compressor.FileExtension()
	filename := fmt.Sprintf("dump-%s.sql%s", timestamp, ext)
	finalPath := filepath.Join(d.OutputDir, filename)

	// Create a temp file in the output directory to write compressed output.
	tf, err := tempfile.New(d.OutputDir, "dump-*.tmp")
	if err != nil {
		return "", fmt.Errorf("dumper: create temp file: %w", err)
	}

	success := false
	defer func() {
		if !success {
			_ = tf.Cleanup()
		}
	}()

	// Start pg_dump
	cmd := exec.CommandContext(ctx, "pg_dump", "--format=plain", d.DSN)
	pgStdout, err := cmd.StdoutPipe()
	if err != nil {
		return "", fmt.Errorf("dumper: stdout pipe: %w", err)
	}

	stderrPipe, err := cmd.StderrPipe()
	if err != nil {
		return "", fmt.Errorf("dumper: stderr pipe: %w", err)
	}

	if err := cmd.Start(); err != nil {
		return "", fmt.Errorf("dumper: start pg_dump: %w", err)
	}

	// Drain stderr asynchronously to avoid blocking pg_dump.
	stderrDone := make(chan []byte, 1)
	go func() {
		data, _ := io.ReadAll(stderrPipe)
		stderrDone <- data
	}()

	// Compress pg_dump stdout into the temp file.
	if err := d.Compressor.Compress(pgStdout, tf.File()); err != nil {
		_ = cmd.Process.Kill()
		_, _ = cmd.Process.Wait()
		return "", fmt.Errorf("dumper: compress: %w", err)
	}

	stderrData := <-stderrDone

	if err := cmd.Wait(); err != nil {
		return "", fmt.Errorf("dumper: pg_dump failed: %w (stderr: %s)", err, string(stderrData))
	}

	// Atomically rename temp file to final destination.
	if err := tf.Commit(finalPath); err != nil {
		return "", fmt.Errorf("dumper: commit artifact: %w", err)
	}

	success = true
	return finalPath, nil
}