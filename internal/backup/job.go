package backup

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/example/backupworker/internal/compress"
	"github.com/example/backupworker/internal/config"
	"github.com/example/backupworker/internal/dumper"
	"github.com/example/backupworker/internal/storage"
	"github.com/example/backupworker/internal/tempfile"
)

// Job holds the dependencies required to perform a single backup cycle.
type Job struct {
	cfg     *config.Config
	dumper  dumper.Dumper
	storage storage.Storage
}

// NewJob constructs a Job from the application configuration.
func NewJob(cfg *config.Config) (*Job, error) {
	d, err := dumper.New(cfg)
	if err != nil {
		return nil, fmt.Errorf("creating dumper: %w", err)
	}

	s, err := storage.New(cfg)
	if err != nil {
		return nil, fmt.Errorf("creating storage backend: %w", err)
	}

	return &Job{
		cfg:     cfg,
		dumper:  d,
		storage: s,
	}, nil
}

// Run executes one full backup pipeline:
//  1. Dump the database to a temporary file.
//  2. Compress the dump.
//  3. Upload the compressed file to the storage backend.
//
// The context is checked between each stage so that an OS signal received
// during a run causes a clean abort at the next safe boundary rather than
// partway through an upload.
func (j *Job) Run(ctx context.Context) error {
	start := time.Now()
	log.Printf("[backup] starting backup job at %s", start.Format(time.RFC3339))

	// ── Stage 1: Dump ────────────────────────────────────────────────────────
	if err := ctx.Err(); err != nil {
		return fmt.Errorf("backup aborted before dump stage: %w", err)
	}

	dumpFile, err := tempfile.New("backup-dump-*.sql")
	if err != nil {
		return fmt.Errorf("creating temp file for dump: %w", err)
	}
	defer dumpFile.Cleanup()

	log.Printf("[backup] dumping database to %s", dumpFile.Path())
	if err := j.dumper.Dump(ctx, dumpFile.Path()); err != nil {
		return fmt.Errorf("dump stage failed: %w", err)
	}
	log.Printf("[backup] dump complete (%.2fs)", time.Since(start).Seconds())

	// ── Stage 2: Compress ────────────────────────────────────────────────────
	if err := ctx.Err(); err != nil {
		return fmt.Errorf("backup aborted before compress stage: %w", err)
	}

	compressedFile, err := tempfile.New("backup-compressed-*.sql.gz")
	if err != nil {
		return fmt.Errorf("creating temp file for compressed output: %w", err)
	}
	defer compressedFile.Cleanup()

	compressor := compress.NewFromConfig(j.cfg)
	log.Printf("[backup] compressing dump")
	if err := compressor.Compress(ctx, dumpFile.Path(), compressedFile.Path()); err != nil {
		return fmt.Errorf("compress stage failed: %w", err)
	}
	log.Printf("[backup] compression complete (%.2fs)", time.Since(start).Seconds())

	// ── Stage 3: Upload ──────────────────────────────────────────────────────
	if err := ctx.Err(); err != nil {
		return fmt.Errorf("backup aborted before upload stage: %w", err)
	}

	key := storage.BuildKey(j.cfg, start)
	log.Printf("[backup] uploading to storage key %q", key)
	if err := j.storage.Put(ctx, key, compressedFile.Path()); err != nil {
		return fmt.Errorf("upload stage failed: %w", err)
	}

	elapsed := time.Since(start)
	log.Printf("[backup] backup job finished successfully in %.2fs", elapsed.Seconds())
	return nil
}