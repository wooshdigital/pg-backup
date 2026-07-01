package backup

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/soneralp/backup-worker/internal/compress"
	"github.com/soneralp/backup-worker/internal/config"
	"github.com/soneralp/backup-worker/internal/dumper"
	"github.com/soneralp/backup-worker/internal/storage"
	"github.com/soneralp/backup-worker/internal/tempfile"
)

// Job holds everything needed to execute a single backup pipeline.
type Job struct {
	cfg    *config.Config
	logger *log.Logger
}

// NewJob constructs a Job, validating that the configuration is usable.
func NewJob(cfg *config.Config, logger *log.Logger) (*Job, error) {
	if cfg == nil {
		return nil, fmt.Errorf("config must not be nil")
	}
	if logger == nil {
		logger = log.Default()
	}
	return &Job{cfg: cfg, logger: logger}, nil
}

// Run executes the full backup pipeline. It respects ctx cancellation between
// each stage so that a graceful shutdown never leaves a partially-uploaded
// archive without cleaning up temporary files.
func (j *Job) Run(ctx context.Context) error {
	startedAt := time.Now()
	j.logger.Printf("backup pipeline started at %s", startedAt.Format(time.RFC3339))

	// --- Stage 0: early cancellation check ---
	if err := ctx.Err(); err != nil {
		return fmt.Errorf("cancelled before dump stage: %w", err)
	}

	// --- Stage 1: create temp file for the raw dump ---
	tmpDump, err := tempfile.New(j.cfg.TempDir, "backup-dump-*.sql")
	if err != nil {
		return fmt.Errorf("create temp dump file: %w", err)
	}
	defer func() {
		if removeErr := tmpDump.Remove(); removeErr != nil {
			j.logger.Printf("warning: failed to remove temp dump file %s: %v", tmpDump.Path(), removeErr)
		}
	}()

	// --- Stage 2: dump the database ---
	j.logger.Println("stage 1/3: dumping database")
	d, err := dumper.New(j.cfg)
	if err != nil {
		return fmt.Errorf("create dumper: %w", err)
	}
	if err := d.Dump(ctx, tmpDump.Path()); err != nil {
		return fmt.Errorf("dump database: %w", err)
	}

	// Check cancellation after potentially long dump
	if err := ctx.Err(); err != nil {
		return fmt.Errorf("cancelled after dump stage: %w", err)
	}

	// --- Stage 3: compress the dump ---
	j.logger.Println("stage 2/3: compressing dump")
	tmpArchive, err := tempfile.New(j.cfg.TempDir, "backup-archive-*.sql.gz")
	if err != nil {
		return fmt.Errorf("create temp archive file: %w", err)
	}
	defer func() {
		if removeErr := tmpArchive.Remove(); removeErr != nil {
			j.logger.Printf("warning: failed to remove temp archive file %s: %v", tmpArchive.Path(), removeErr)
		}
	}()

	compressor, err := compress.NewCompressor(j.cfg.Compress.Algorithm)
	if err != nil {
		return fmt.Errorf("create compressor: %w", err)
	}
	if err := compressor.Compress(ctx, tmpDump.Path(), tmpArchive.Path()); err != nil {
		return fmt.Errorf("compress dump: %w", err)
	}

	// Check cancellation after compression
	if err := ctx.Err(); err != nil {
		return fmt.Errorf("cancelled after compress stage: %w", err)
	}

	// --- Stage 4: upload to storage ---
	j.logger.Println("stage 3/3: uploading archive to storage")
	store, err := storage.New(j.cfg)
	if err != nil {
		return fmt.Errorf("create storage: %w", err)
	}

	key := storage.BuildKey(j.cfg, startedAt)
	if err := store.Upload(ctx, tmpArchive.Path(), key); err != nil {
		return fmt.Errorf("upload archive: %w", err)
	}

	elapsed := time.Since(startedAt).Round(time.Millisecond)
	j.logger.Printf("backup pipeline completed in %s, stored as %q", elapsed, key)
	return nil
}