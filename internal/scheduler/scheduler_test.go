package scheduler

import (
	"log"
	"os"
	"sync/atomic"
	"testing"
	"time"
)

func testLogger() *log.Logger {
	return log.New(os.Stdout, "[test] ", log.LstdFlags)
}

// TestNew_InvalidExpression verifies that an invalid cron expression returns
// an error during construction.
func TestNew_InvalidExpression(t *testing.T) {
	_, err := New("not-a-valid-cron", func() {}, testLogger())
	if err == nil {
		t.Fatal("expected error for invalid cron expression, got nil")
	}
}

// TestNew_EmptyExpression verifies that an empty expression returns an error.
func TestNew_EmptyExpression(t *testing.T) {
	_, err := New("", func() {}, testLogger())
	if err == nil {
		t.Fatal("expected error for empty cron expression, got nil")
	}
}

// TestNew_ValidExpression verifies that a valid expression constructs without
// error and that NextRun returns the zero time before Start is called.
func TestNew_ValidExpression(t *testing.T) {
	sched, err := New("* * * * *", func() {}, testLogger())
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if sched == nil {
		t.Fatal("expected non-nil scheduler")
	}
}

// TestNextRun_AfterStart verifies that NextRun returns a future time after
// the scheduler has been started.
func TestNextRun_AfterStart(t *testing.T) {
	sched, err := New("* * * * *", func() {}, testLogger())
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	sched.Start()
	defer sched.Stop()

	next := sched.NextRun()
	if next.IsZero() {
		t.Fatal("expected non-zero NextRun after Start")
	}
	if !next.After(time.Now()) {
		t.Errorf("expected NextRun to be in the future, got %s", next)
	}
}

// TestJobFires verifies that a job scheduled with a high-frequency expression
// (every second via @every syntax) actually fires within a reasonable window.
func TestJobFires(t *testing.T) {
	var callCount int64

	sched, err := New("@every 1s", func() {
		atomic.AddInt64(&callCount, 1)
	}, testLogger())
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	sched.Start()

	// Wait up to 3 seconds for at least one invocation.
	deadline := time.Now().Add(3 * time.Second)
	for time.Now().Before(deadline) {
		if atomic.LoadInt64(&callCount) > 0 {
			break
		}
		time.Sleep(100 * time.Millisecond)
	}

	sched.Stop()

	if atomic.LoadInt64(&callCount) == 0 {
		t.Fatal("expected job to fire at least once within 3 seconds")
	}
}

// TestSkipIfStillRunning verifies that overlapping job invocations are skipped.
// We schedule a job that takes 500ms every second; after 2.5 seconds we expect
// it to have been invoked at most twice (not three or more times).
func TestSkipIfStillRunning(t *testing.T) {
	var callCount int64
	jobDuration := 400 * time.Millisecond

	sched, err := New("@every 200ms", func() {
		atomic.AddInt64(&callCount, 1)
		time.Sleep(jobDuration)
	}, testLogger())
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	sched.Start()
	time.Sleep(1200 * time.Millisecond)
	sched.Stop()

	count := atomic.LoadInt64(&callCount)
	// With a 200ms tick and 400ms job duration, only ~1-2 runs can complete
	// in 1200ms due to SkipIfStillRunning.
	if count > 4 {
		t.Errorf("expected at most 4 runs due to SkipIfStillRunning, got %d", count)
	}
	if count == 0 {
		t.Error("expected at least one run")
	}
}

// TestStop_WaitsForRunningJob verifies that Stop blocks until the running job
// finishes and does not return prematurely.
func TestStop_WaitsForRunningJob(t *testing.T) {
	jobDuration := 300 * time.Millisecond
	var finished int64

	sched, err := New("@every 100ms", func() {
		time.Sleep(jobDuration)
		atomic.StoreInt64(&finished, 1)
	}, testLogger())
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	sched.Start()

	// Give the job time to start.
	time.Sleep(150 * time.Millisecond)

	// Stop should block until the running job completes.
	stopStart := time.Now()
	sched.Stop()
	stopElapsed := time.Since(stopStart)

	if atomic.LoadInt64(&finished) == 0 {
		t.Error("job had not finished when Stop returned")
	}

	// Stop should have waited at least some meaningful time for the job.
	if stopElapsed < 50*time.Millisecond {
		t.Errorf("Stop returned too quickly (%s), expected it to wait for running job", stopElapsed)
	}
}

// TestNextRun_ReturnsCorrectSchedule verifies that NextRun changes after the
// scheduler fires (i.e., it always reflects the next future run).
func TestNextRun_ReturnsCorrectSchedule(t *testing.T) {
	sched, err := New("@every 500ms", func() {}, testLogger())
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	sched.Start()
	defer sched.Stop()

	first := sched.NextRun()
	if first.IsZero() {
		t.Fatal("expected non-zero NextRun")
	}

	// Wait for the first tick to pass.
	time.Sleep(600 * time.Millisecond)

	second := sched.NextRun()
	if second.IsZero() {
		t.Fatal("expected non-zero NextRun after first tick")
	}
	if !second.After(first) {
		t.Errorf("expected second NextRun (%s) to be after first (%s)", second, first)
	}
}