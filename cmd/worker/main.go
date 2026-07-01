package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/example/backupworker/internal/backup"
	"github.com/example/backupworker/internal/config"
	"github.com/example/backupworker/internal/scheduler"
)

func main() {
	// ── Load configuration ────────────────────────────────────────────────────
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load configuration: %v", err)
	}

	log.Printf("backup worker starting (schedule: %q)", cfg.Schedule)

	// ── Build the backup job ──────────────────────────────────────────────────
	job, err := backup.NewJob(cfg)
	if err != nil {
		log.Fatalf("failed to initialise backup job: %v", err)
	}

	// ── Set up OS signal handling ─────────────────────────────────────────────
	// signal.NotifyContext cancels the returned context when SIGTERM or SIGINT
	// is received. We pass this context into the scheduler so that any running
	// backup job can detect cancellation and stop cleanly between pipeline
	// stages.
	rootCtx, stop := signal.NotifyContext(context.Background(), syscall.SIGTERM, syscall.SIGINT)
	defer stop()

	// ── Set up the cron scheduler ─────────────────────────────────────────────
	sched := scheduler.New()

	if err := sched.Register(rootCtx, cfg.Schedule, func(ctx context.Context) error {
		if err := job.Run(ctx); err != nil {
			log.Printf("[worker] backup job returned error: %v", err)
			return err
		}
		// Log the next scheduled run time after a successful backup.
		if next := sched.NextRun(); !next.IsZero() {
			log.Printf("[worker] next backup scheduled for %s", next.Format(time.RFC3339))
		}
		return nil
	}); err != nil {
		log.Fatalf("failed to register backup job with scheduler: %v", err)
	}

	sched.Start()

	next := sched.NextRun()
	if !next.IsZero() {
		log.Printf("[worker] scheduler started – next backup at %s", next.Format(time.RFC3339))
	} else {
		log.Printf("[worker] scheduler started")
	}

	// ── Block until a signal is received ─────────────────────────────────────
	<-rootCtx.Done()

	receivedSignal := rootCtx.Err()
	log.Printf("[worker] received shutdown signal (%v) – waiting for in-progress backup to finish…", receivedSignal)

	// Stop the scheduler. cron.Stop() returns a context that is cancelled once
	// all running jobs have returned, so we can wait on it safely.
	shutdownCtx := sched.Stop()

	// Give the in-flight job up to 10 minutes to complete before we give up
	// and exit anyway. Adjust this timeout to suit the longest acceptable
	// backup duration.
	const shutdownTimeout = 10 * time.Minute
	timer := time.NewTimer(shutdownTimeout)
	defer timer.Stop()

	select {
	case <-shutdownCtx.Done():
		log.Printf("[worker] all jobs finished – exiting cleanly")
	case <-timer.C:
		log.Printf("[worker] shutdown timeout (%s) exceeded – forcing exit", shutdownTimeout)
		os.Exit(1)
	}
}