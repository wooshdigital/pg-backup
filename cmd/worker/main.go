package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/yourorg/backupworker/internal/backup"
	"github.com/yourorg/backupworker/internal/config"
	"github.com/yourorg/backupworker/internal/scheduler"
)

func main() {
	logger := log.New(os.Stdout, "[worker] ", log.LstdFlags|log.LUTC)

	// Load configuration
	cfg, err := config.Load("config.yaml")
	if err != nil {
		logger.Fatalf("failed to load config: %v", err)
	}

	// Build the backup job
	job, err := backup.NewJob(cfg, logger)
	if err != nil {
		logger.Fatalf("failed to create backup job: %v", err)
	}

	// Create signal-aware context so we can shut down cleanly
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGTERM, syscall.SIGINT)
	defer stop()

	// Build the scheduler
	sched, err := scheduler.New(cfg.Schedule, logger, func(jobCtx context.Context) error {
		start := time.Now()
		logger.Printf("backup job started")
		if err := job.Run(jobCtx); err != nil {
			return fmt.Errorf("backup job failed: %w", err)
		}
		logger.Printf("backup job completed successfully in %s", time.Since(start).Round(time.Millisecond))
		return nil
	})
	if err != nil {
		logger.Fatalf("failed to create scheduler: %v", err)
	}

	// Start the cron scheduler
	sched.Start()
	logger.Printf("scheduler started; cron expression: %q", cfg.Schedule)

	if next, ok := sched.NextRun(); ok {
		logger.Printf("next scheduled run: %s", next.Format(time.RFC3339))
	}

	// Block until a signal is received
	<-ctx.Done()
	logger.Printf("shutdown signal received, waiting for any running job to finish...")

	// Stop() blocks until the currently-running job (if any) completes
	sched.Stop()
	logger.Printf("scheduler stopped; exiting")
}