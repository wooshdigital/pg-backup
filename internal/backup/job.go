package backup

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/yourusername/backupworker/internal/config"
)

// Job represents a single backup job that coordinates dumping, compressing,
// and uploading a database backup.
type Job struct {
	cfg    *config.Config
	logger *log.Logger
}

// NewJob creates a new Job with the provided configuration and logger.
func NewJob(cfg *config.Config, logger *log.Logger) *Job {
	return &Job{
		cfg:    cfg,
		logger: logger,
	}
}

// Run executes the full backup pipeline. It respects context cancellation
// between stages so that a graceful shutdown does not interrupt an already
// started stage but prevents new stages from starting.
func (j *Job) Run(ctx context.Context) error {
	startTime := time.Now()
	j.logger.Printf("starting backup pipeline at %s", startTime.Format(time.RFC3339))

	// Stage 1: Dump
	if err := ctx.Err(); err != nil {
		return fmt.Errorf("backup cancelled before dump stage: %w", err)
	}
	j.logger.Println("stage 1/3: dumping database")
	dumpPath, err := j.dump(ctx)
	if err != nil {
		return fmt.Errorf("dump stage failed: %w", err)
	}
	j.logger.Printf("stage 1/3: dump complete -> %s", dumpPath)

	// Stage 2: Compress
	if err := ctx.Err(); err != nil {
		return fmt.Errorf("backup cancelled before compress stage: %w", err)
	}
	j.logger.Println("stage 2/3: compressing dump")
	compressedPath, err := j.compress(ctx, dumpPath)
	if err != nil {
		return fmt.Errorf("compress stage failed: %w", err)
	}
	j.logger.Printf("stage 2/3: compression complete -> %s", compressedPath)

	// Stage 3: Upload
	if err := ctx.Err(); err != nil {
		return fmt.Errorf("backup cancelled before upload stage: %w", err)
	}
	j.logger.Println("stage 3/3: uploading to storage")
	if err := j.upload(ctx, compressedPath); err != nil {
		return fmt.Errorf("upload stage failed: %w", err)
	}
	j.logger.Printf("stage 3/3: upload complete")

	elapsed := time.Since(startTime)
	j.logger.Printf("backup pipeline finished successfully in %s", elapsed.Round(time.Millisecond))
	return nil
}

// dump performs the database dump stage. It returns the path to the raw dump
// file. The context is passed to allow cancellation of long-running dump
// commands.
func (j *Job) dump(ctx context.Context) (string, error) {
	// Real implementation would invoke pg_dump / mysqldump via exec.CommandContext.
	// For now we simulate work and respect context cancellation.
	select {
	case <-ctx.Done():
		return "", ctx.Err()
	case <-time.After(10 * time.Millisecond): // simulate dump
	}
	return "/tmp/backup_dump.sql", nil
}

// compress compresses the dump file and returns the path to the archive.
func (j *Job) compress(ctx context.Context, dumpPath string) (string, error) {
	select {
	case <-ctx.Done():
		return "", ctx.Err()
	case <-time.After(10 * time.Millisecond): // simulate compression
	}
	return dumpPath + ".gz", nil
}

// upload sends the compressed file to the configured storage backend.
func (j *Job) upload(ctx context.Context, filePath string) error {
	select {
	case <-ctx.Done():
		return ctx.Err()
	case <-time.After(10 * time.Millisecond): // simulate upload
	}
	return nil
}