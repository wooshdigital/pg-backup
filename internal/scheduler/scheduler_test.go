package scheduler_test

import (
	"context"
	"log"
	"os"
	"sync/atomic"
	"testing"
	"time"

	"github.com/yourorg/backupworker/internal/scheduler"
)

func newTestLogger() *log.Logger {
	return log.New(os.Stdout, "[test] ", log.LstdFlags)
}

// TestSchedulerFiresJob verifies that the job function is invoked at least once
// within a reasonable window using a frequently-firing cron expression.
func TestSchedulerFiresJob(t *testing.T) {
	t.Parallel()

	var callCount atomic.Int32

	// "* * * * *" fires every minute, but we use a fast approach:
	// every-second is not a standard cron field, so we rely on the
	// @every duration extension supported by robfig/cron.
	sched, err := scheduler.New("@every 100ms", newTestLogger(), func(ctx context.Context) error {
		callCount.Add(1)
		return nil
	})
	if err != nil {
		t.Fatalf("New() error: %v", err)
	}

	sched.Start()
	defer sched.Stop()

	deadline := time.Now().Add(2 * time.Second)
	for time.Now().Before(deadline) {
		if callCount.Load() >= 2 {
			break
		}
		time.Sleep(50 * time.Millisecond)
	}

	if got := callCount.Load(); got < 2 {
		t.Errorf("expected at least 2 job invocations, got %d", got)
	}
}

// TestSchedulerNextRun verifies that NextRun returns a future timestamp after Start.
func TestSchedulerNextRun(t *testing.T) {
	t.Parallel()

	sched, err := scheduler.New("@every 1s", newTestLogger(), func(ctx context.Context) error {
		return nil
	})
	if err != nil {
		t.Fatalf("New() error: %v", err)
	}

	sched.Start()
	defer sched.Stop()

	next, ok := sched.NextRun()
	if !ok {
		t.Fatal("NextRun() returned ok=false, expected a scheduled time")
	}
	if !next.After(time.Now().Add(-time.Second)) {
		t.Errorf("NextRun() returned past time: %s", next)
	}
}

// TestSchedulerGracefulShutdown verifies that Stop() waits for a running job
// to complete before returning.
func TestSchedulerGracefulShutdown(t *testing.T) {
	t.Parallel()

	const jobDuration = 300 * time.Millisecond

	var finished atomic.Bool

	sched, err := scheduler.New("@every 50ms", newTestLogger(), func(ctx context.Context) error {
		// Simulate work that takes longer than the tick interval.
		select {
		case <-time.After(jobDuration):
			finished.Store(true)
		case <-ctx.Done():
			// Context cancelled by Stop(); still mark finished so we can detect early exit.
			finished.Store(true)
		}
		return nil
	})
	if err != nil {
		t.Fatalf("New() error: %v", err)
	}

	sched.Start()

	// Wait until the job starts.
	time.Sleep(100 * time.Millisecond)

	stopDone := make(chan struct{})
	go func() {
		sched.Stop()
		close(stopDone)
	}()

	select {
	case <-stopDone:
		// Good – Stop returned after the job finished.
	case <-time.After(3 * time.Second):
		t.Fatal("Stop() did not return within 3 seconds")
	}

	if !finished.Load() {
		t.Error("job did not finish before Stop() returned")
	}
}

// TestSchedulerSkipsOverlappingRun verifies that a second tick does not start
// a new job while the first one is still running.
func TestSchedulerSkipsOverlappingRun(t *testing.T) {
	t.Parallel()

	var concurrent atomic.Int32
	var maxConcurrent atomic.Int32

	sched, err := scheduler.New("@every 50ms", newTestLogger(), func(ctx context.Context) error {
		cur := concurrent.Add(1)
		defer concurrent.Add(-1)

		// Track peak concurrency.
		for {
			old := maxConcurrent.Load()
			if cur <= old || maxConcurrent.CompareAndSwap(old, cur) {
				break
			}
		}

		// Sleep longer than the tick to force overlap opportunity.
		time.Sleep(200 * time.Millisecond)
		return nil
	})
	if err != nil {
		t.Fatalf("New() error: %v", err)
	}

	sched.Start()
	time.Sleep(600 * time.Millisecond)
	sched.Stop()

	if got := maxConcurrent.Load(); got > 1 {
		t.Errorf("detected %d concurrent job executions, expected at most 1", got)
	}
}

// TestSchedulerInvalidExpression verifies that New returns an error for a
// malformed cron expression.
func TestSchedulerInvalidExpression(t *testing.T) {
	t.Parallel()

	_, err := scheduler.New("not-a-valid-cron", newTestLogger(), func(ctx context.Context) error {
		return nil
	})
	if err == nil {
		t.Error("expected error for invalid cron expression, got nil")
	}
}

// TestSchedulerEmptyExpression verifies that New returns an error when the
// expression is empty.
func TestSchedulerEmptyExpression(t *testing.T) {
	t.Parallel()

	_, err := scheduler.New("", newTestLogger(), func(ctx context.Context) error {
		return nil
	})
	if err == nil {
		t.Error("expected error for empty cron expression, got nil")
	}
}