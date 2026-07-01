package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/yourusername/backupworker/internal/backup"
	"github.com/yourusername/backupworker/internal/config"
	"github.com/yourusername/backupworker/internal/scheduler"
)

func main() {
	logger := log.New(os.Stdout, "[worker] ", log.LstdFlags|log.Lmicroseconds)

	// Load configuration
	cfg, err := config.Load("config.yaml")
	if err != nil {
		logger.Fatalf("failed to load config: %v", err)
	}

	// Create a context that is cancelled on SIGTERM or SIGINT
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGTERM, syscall.SIGINT)
	defer stop()

	// Build the backup job
	job := backup.NewJob(cfg, logger)

	// Create and configure the scheduler
	sched, err := scheduler.New(cfg.Schedule, func() {
		logger.Println("backup job starting")
		if runErr := job.Run(ctx); runErr != nil {
			logger.Printf("backup job failed: %v", runErr)
		} else {
			logger.Println("backup job completed successfully")
		}
	}, logger)
	if err != nil {
		logger.Fatalf("failed to create scheduler: %v", err)
	}

	// Start the scheduler
	sched.Start()
	logger.Printf("scheduler started; next run at %s", sched.NextRun().Format("2006-01-02 15:04:05 MST"))

	// Block until signal received
	<-ctx.Done()
	logger.Println("shutdown signal received, waiting for in-progress backup to complete...")

	// Stop the scheduler – waits for any running job to finish
	sched.Stop()
	logger.Println("scheduler stopped cleanly, exiting")
}