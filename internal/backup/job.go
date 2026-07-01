package backup

import (
	"context"
	"fmt"
	"log"

	"github.com/yourorg/backupworker/internal/config"
	"github.com/yourorg/backupworker/internal/compress"
	"github.com/yourorg/backupworker/internal/dumper"
	"github.com/yourorg/backupworker/internal/storage"
	"github.com/yourorg/backupworker/internal/tempfile"
)

// Job holds all dependencies needed to execute a single backup run.
type Job struct {
	cfg     *config.Config
	logger  *log.Logger
	dumper  dumper.Dumper
	storage storage.Storage
}

// NewJob constructs a Job from the given configuration.
func NewJob(cfg *config.Config, logger *log.Logger) (*Job, error) {
	d, err := dumper.New(cfg)
	if err != nil {
		return nil, fmt.Errorf("dumper: %w", err)
	}

	s, err := storage.New(cfg)
	if err != nil {
		return nil, fmt.Errorf("storage: %w", err)
	}

	return &Job{
		cfg:    cfg,
		logger: logger,
		dumper: d,
		storage: s,
	}, nil
}

// Run executes a full backup pipeline: dump → compress → upload.
// It honours ctx cancellation between each stage so a graceful shutdown
// does not leave partial artefacts on the remote storage.
func (j *Job) Run(ctx context.Context) error {
	// Stage 0: pre-flight cancellation check
	if err := ctx.Err(); err != nil {
		return fmt.Errorf("backup cancelled before start: %w", err)
	}

	// Stage 1: create a temporary file for the dump
	tmp, err := tempfile.New(j.cfg.TempDir, "backup-*.sql")
	if err != nil {
		return fmt.Errorf("tempfile: %w", err)
	}
	defer tmp.Cleanup()

	j.logger.Printf("stage 1/3: dumping database to %s", tmp.Path())

	if err := j.dumper.Dump(ctx, tmp.Path()); err != nil {
		return fmt.Errorf("dump: %w", err)
	}

	// Check for cancellation between stages
	if err := ctx.Err(); err != nil {
		return fmt.Errorf("backup cancelled after dump: %w", err)
	}

	// Stage 2: compress the dump
	j.logger.Printf("stage 2/3: compressing dump")

	compressor, err := compress.NewFromConfig(j.cfg)
	if err != nil {
		return fmt.Errorf("compressor: %w", err)
	}

	compressedPath, err := compressor.Compress(ctx, tmp.Path())
	if err != nil {
		return fmt.Errorf("compress: %w", err)
	}
	defer compressor.Cleanup(compressedPath)

	// Check for cancellation between stages
	if err := ctx.Err(); err != nil {
		return fmt.Errorf("backup cancelled after compress: %w", err)
	}

	// Stage 3: upload to storage backend
	key := storage.BuildKey(j.cfg, compressedPath)
	j.logger.Printf("stage 3/3: uploading to storage key=%s", key)

	if err := j.storage.Put(ctx, key, compressedPath); err != nil {
		return fmt.Errorf("upload: %w", err)
	}

	return nil
}