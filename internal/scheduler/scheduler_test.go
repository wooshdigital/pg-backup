package scheduler_test

import (
	"context"
	"sync/atomic"
	"testing"
	"time"

	"github.com/example/backupworker/internal/scheduler"
)

// TestJobFiresAtInterval verifies that a job registered with a sub-second
// cron expression (using NewWithSeconds) fires the expected number of times
// within a short window.
func TestJobFiresAtInterval(t *testing.T) {
	t.Parallel()

	s := scheduler.NewWithSeconds()

	var callCount atomic.Int64

	ctx := context.Background()
	// Fire every second using the seconds-enabled scheduler.
	err := s.Register(ctx, "*/1 * * * * *", func(jobCtx context.Context) error {
		callCount.Add(1)
		return nil
	})
	if err != nil {
		t.Fatalf("Register returned unexpected error: %v", err)
	}

	s.Start()
	defer func() {
		stopCtx := s.Stop()
		<-stopCtx.Done()
	}()

	// Wait long enough for the job to fire at least twice (≥2 s) but no more
	// than 5 seconds to keep the test fast.
	time.Sleep(2500 * time.Millisecond)

	count := callCount.Load()
	if count < 2 {
		t.Errorf("expected job to fire at least 2 times, got %d", count)
	}
}

// TestNextRunIsInFuture checks that NextRun returns a time after the scheduler
// has been started.
func TestNextRunIsInFuture(t *testing.T) {
	t.Parallel()

	s := scheduler.NewWithSeconds()

	ctx := context.Background()
	err := s.Register(ctx, "*/5 * * * * *", func(jobCtx context.Context) error {
		return nil
	})
	if err != nil {
		t.Fatalf("Register returned unexpected error: %v", err)
	}

	before := time.Now()
	s.Start()
	defer func() {
		stopCtx := s.Stop()
		<-stopCtx.Done()
	}()

	next := s.NextRun()
	if next.IsZero() {
		t.Fatal("NextRun returned zero time after Start()")
	}
	if !next.After(before) {
		t.Errorf("NextRun %v is not after start time %v", next, before)
	}
}

// TestSkipIfStillRunning verifies that a slow job is skipped rather than
// overlapped when the next tick arrives.
func TestSkipIfStillRunning(t *testing.T) {
	t.Parallel()

	s := scheduler.NewWithSeconds()

	var concurrentRuns atomic.Int64
	var maxConcurrent atomic.Int64

	ctx := context.Background()
	err := s.Register(ctx, "*/1 * * * * *", func(jobCtx context.Context) error {
		current := concurrentRuns.Add(1)
		defer concurrentRuns.Add(-1)

		// Track max concurrent.
		for {
			old := maxConcurrent.Load()
			if current <= old {
				break
			}
			if maxConcurrent.CompareAndSwap(old, current) {
				break
			}
		}

		// Simulate a job that takes longer than the tick interval.
		time.Sleep(1500 * time.Millisecond)
		return nil
	})
	if err != nil {
		t.Fatalf("Register returned unexpected error: %v", err)
	}

	s.Start()
	// Run for 3 seconds; with a 1s tick and a 1.5s job, we would get overlaps
	// without SkipIfStillRunning.
	time.Sleep(3 * time.Second)

	stopCtx := s.Stop()
	<-stopCtx.Done()

	if max := maxConcurrent.Load(); max > 1 {
		t.Errorf("expected max concurrent runs to be 1, got %d", max)
	}
}

// TestRegisterInvalidExpression checks that an invalid cron expression returns
// an error instead of panicking.
func TestRegisterInvalidExpression(t *testing.T) {
	t.Parallel()

	s := scheduler.New()
	ctx := context.Background()

	err := s.Register(ctx, "not-a-cron-expression", func(_ context.Context) error {
		return nil
	})
	if err == nil {
		t.Error("expected error for invalid cron expression, got nil")
	}
}

// TestStopWaitsForRunningJob confirms that Stop() blocks until the active job
// finishes, so no job is torn down mid-execution.
func TestStopWaitsForRunningJob(t *testing.T) {
	t.Parallel()

	s := scheduler.NewWithSeconds()

	jobStarted := make(chan struct{})
	jobFinished := make(chan struct{})

	ctx := context.Background()
	err := s.Register(ctx, "*/1 * * * * *", func(jobCtx context.Context) error {
		close(jobStarted)
		time.Sleep(500 * time.Millisecond)
		close(jobFinished)
		return nil
	})
	if err != nil {
		t.Fatalf("Register returned unexpected error: %v", err)
	}

	s.Start()

	// Wait until the job has actually started.
	select {
	case <-jobStarted:
	case <-time.After(3 * time.Second):
		t.Fatal("job never started within timeout")
	}

	// Stop should block until the job is done.
	stopCtx := s.Stop()
	<-stopCtx.Done()

	select {
	case <-jobFinished:
		// Good – the job finished before Stop returned.
	default:
		t.Error("Stop() returned before the running job finished")
	}
}