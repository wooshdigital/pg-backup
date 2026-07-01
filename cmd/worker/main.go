package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/soneralp/backup-worker/internal/backup"
	"github.com/soneralp/backup-worker/internal/config"
	"github.com/soneralp/backup-worker/internal/scheduler"
)

func main() {
	logger := log.New(os.Stdout, "[worker] ", log.LstdFlags|log.Lmsgprefix)

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

	// Create scheduler
	sched, err := scheduler.New(cfg.Schedule.CronExpression, logger)
	if err != nil {
		logger.Fatalf("failed to create scheduler: %v", err)
	}

	// Register backup job with the scheduler
	if err := sched.Register(func(ctx context.Context) error {
		logger.Println("starting backup job")
		if err := job.Run(ctx); err != nil {
			logger.Printf("backup job failed: %v", err)
			return err
		}
		logger.Println("backup job completed successfully")

		// Log next run after completion
		if next := sched.NextRun(); !next.IsZero() {
			logger.Printf("next scheduled run: %s", next.Format("2006-01-02 15:04:05 MST"))
		}
		return nil
	}); err != nil {
		logger.Fatalf("failed to register job: %v", err)
	}

	// Set up signal-aware context for graceful shutdown
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGTERM, syscall.SIGINT)
	defer stop()

	// Start the scheduler
	sched.Start()
	logger.Printf("scheduler started with cron expression: %q", cfg.Schedule.CronExpression)

	if next := sched.NextRun(); !next.IsZero() {
		logger.Printf("next scheduled run: %s", next.Format("2006-01-02 15:04:05 MST"))
	}

	// Block until OS signal is received
	<-ctx.Done()
	logger.Println("shutdown signal received, stopping scheduler (waiting for running job to finish)...")

	// Stop blocks until any in-progress job completes
	sched.Stop()
	logger.Println("scheduler stopped, exiting")
}