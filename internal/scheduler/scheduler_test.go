package scheduler_test

import (
	"context"
	"log"
	"os"
	"sync/atomic"
	"testing"
	"time"

	"github.com/soneralp/backup-worker/internal/scheduler"
)

func testLogger() *log.Logger {
	return log.New(os.Stdout, "[test-scheduler] ", log.LstdFlags)
}

// TestSchedulerNew verifies that invalid cron expressions are rejected and
// valid ones are accepted.
func TestSchedulerNew(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name       string
		expression string
		wantErr    bool
	}{
		{
			name:       "valid daily expression",
			expression: "0 2 * * *",
			wantErr:    false,
		},
		{
			name:       "valid every minute",
			expression: "* * * * *",
			wantErr:    false,
		},
		{
			name:       "empty expression",
			expression: "",
			wantErr:    true,
		},
		{
			name:       "invalid expression",
			expression: "not-a-cron",
			wantErr:    true,
		},
		{
			name:       "too many fields",
			expression: "0 0 2 * * *", // 6 fields – standard parser expects 5
			wantErr:    true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			_, err := scheduler.New(tc.expression, testLogger())
			if (err != nil) != tc.wantErr {
				t.Errorf("New(%q) error = %v, wantErr %v", tc.expression, err, tc.wantErr)
			}
		})
	}
}

// TestSchedulerFiresJob verifies that the scheduler calls the registered job
// at least once when given an "every minute" cron expression, by using a very
// short poll interval and waiting up to 90 s (standard CI budget).
//
// Because we cannot inject a fake clock into robfig/cron without modifying the
// library, we use a "* * * * *" expression and wait for it to tick naturally.
// The test is skipped in short mode to keep `go test -short` fast.
func TestSchedulerFiresJob(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping timing-dependent test in short mode")
	}

	var callCount int64

	sched, err := scheduler.New("* * * * *", testLogger())
	if err != nil {
		t.Fatalf("New: %v", err)
	}

	if err := sched.Register(func(ctx context.Context) error {
		atomic.AddInt64(&callCount, 1)
		return nil
	}); err != nil {
		t.Fatalf("Register: %v", err)
	}

	sched.Start()
	defer sched.Stop()

	deadline := time.Now().Add(90 * time.Second)
	for time.Now().Before(deadline) {
		if atomic.LoadInt64(&callCount) >= 1 {
			break
		}
		time.Sleep(500 * time.Millisecond)
	}

	if atomic.LoadInt64(&callCount) == 0 {
		t.Error("job was never called within 90 seconds")
	}
}

// TestSchedulerSkipsOverlappingRun verifies that a second invocation is
// skipped while the first is still running.
func TestSchedulerSkipsOverlappingRun(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping timing-dependent test in short mode")
	}

	var callCount int64
	jobStarted := make(chan struct{})
	jobBlock := make(chan struct{})

	sched, err := scheduler.New("* * * * *", testLogger())
	if err != nil {
		t.Fatalf("New: %v", err)
	}

	if err := sched.Register(func(ctx context.Context) error {
		count := atomic.AddInt64(&callCount, 1)
		if count == 1 {
			close(jobStarted)
			// Block until the test unblocks us.
			select {
			case <-jobBlock:
			case <-ctx.Done():
			}
		}
		return nil
	}); err != nil {
		t.Fatalf("Register: %v", err)
	}

	sched.Start()

	// Wait for the first invocation.
	select {
	case <-jobStarted:
	case <-time.After(90 * time.Second):
		t.Fatal("first job invocation never started")
	}

	// Wait more than one minute to give the scheduler a chance to fire again.
	time.Sleep(65 * time.Second)

	// Unblock the first job.
	close(jobBlock)

	sched.Stop()

	// The second tick should have been skipped.
	if got := atomic.LoadInt64(&callCount); got != 1 {
		t.Errorf("expected exactly 1 job execution (overlapping run skipped), got %d", got)
	}
}

// TestSchedulerNextRun verifies that NextRun returns a non-zero time after the
// scheduler has started.
func TestSchedulerNextRun(t *testing.T) {
	t.Parallel()

	sched, err := scheduler.New("* * * * *", testLogger())
	if err != nil {
		t.Fatalf("New: %v", err)
	}

	if err := sched.Register(func(ctx context.Context) error {
		return nil
	}); err != nil {
		t.Fatalf("Register: %v", err)
	}

	// Before Start(), next run may be zero depending on implementation.
	sched.Start()
	defer sched.Stop()

	// Give the cron engine a moment to compute the first schedule.
	time.Sleep(100 * time.Millisecond)

	next := sched.NextRun()
	if next.IsZero() {
		t.Error("NextRun() returned zero time after scheduler started")
	}
	if next.Before(time.Now()) {
		t.Errorf("NextRun() = %s is in the past", next)
	}
}

// TestSchedulerGracefulShutdown verifies that Stop() waits for an in-progress
// job to finish before returning.
func TestSchedulerGracefulShutdown(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping timing-dependent test in short mode")
	}

	jobDone := make(chan struct{})

	sched, err := scheduler.New("* * * * *", testLogger())
	if err != nil {
		t.Fatalf("New: %v", err)
	}

	if err := sched.Register(func(ctx context.Context) error {
		// Simulate a job that takes 2 seconds.
		select {
		case <-time.After(2 * time.Second):
		case <-ctx.Done():
		}
		close(jobDone)
		return nil
	}); err != nil {
		t.Fatalf("Register: %v", err)
	}

	sched.Start()

	// Wait for the job to start.
	time.Sleep(62 * time.Second) // wait past the minute boundary

	stopDone := make(chan struct{})
	go func() {
		sched.Stop()
		close(stopDone)
	}()

	select {
	case <-stopDone:
	case <-time.After(10 * time.Second):
		t.Fatal("Stop() did not return within 10 seconds after job should have completed")
	}

	select {
	case <-jobDone:
	default:
		t.Error("Stop() returned before the job finished")
	}
}

// TestSchedulerContextCancelledOnStop verifies that the job's context is
// cancelled when Stop() is called.
func TestSchedulerContextCancelledOnStop(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping timing-dependent test in short mode")
	}

	ctxCancelled := make(chan struct{})

	sched, err := scheduler.New("* * * * *", testLogger())
	if err != nil {
		t.Fatalf("New: %v", err)
	}

	if err := sched.Register(func(ctx context.Context) error {
		// Wait for context cancellation.
		<-ctx.Done()
		close(ctxCancelled)
		return ctx.Err()
	}); err != nil {
		t.Fatalf("Register: %v", err)
	}

	sched.Start()

	// Wait for first job tick.
	time.Sleep(62 * time.Second)

	// Stop should cancel the running job's context.
	sched.Stop()

	select {
	case <-ctxCancelled:
		// Good – context was cancelled.
	case <-time.After(5 * time.Second):
		t.Error("job context was not cancelled within 5 seconds of Stop()")
	}
}