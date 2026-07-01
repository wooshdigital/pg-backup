package scheduler

import (
	"context"
	"sync"
	"time"

	"github.com/robfig/cron/v3"
)

// Job is a function that can be scheduled. It receives a context so it can
// respect cancellation signals.
type Job func(ctx context.Context) error

// Scheduler wraps robfig/cron and provides a clean interface for registering
// jobs, querying the next run time, and stopping gracefully.
type Scheduler struct {
	c          *cron.Cron
	mu         sync.Mutex
	nextRun    time.Time
	entryID    cron.EntryID
	expression string
}

// New creates a new Scheduler. It uses the local timezone by default and
// enables second-level precision for testing (using cron.WithSeconds() is
// opt-in; here we keep standard 5-field expressions for production).
func New() *Scheduler {
	c := cron.New(
		cron.WithLocation(time.Local),
		cron.WithChain(
			cron.SkipIfStillRunning(cron.DefaultLogger),
		),
	)
	return &Scheduler{c: c}
}

// NewWithSeconds creates a Scheduler that accepts 6-field cron expressions
// (with a leading seconds field). Useful in tests where you want sub-minute
// precision.
func NewWithSeconds() *Scheduler {
	c := cron.New(
		cron.WithSeconds(),
		cron.WithLocation(time.UTC),
		cron.WithChain(
			cron.SkipIfStillRunning(cron.DefaultLogger),
		),
	)
	return &Scheduler{c: c}
}

// Register adds a job to the scheduler using the given cron expression. The
// job function receives the provided context so it can honour cancellation.
// Only one job can be registered at a time; calling Register again replaces
// the previous job.
func (s *Scheduler) Register(ctx context.Context, expression string, job Job) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Remove previous entry if one exists.
	if s.entryID != 0 {
		s.c.Remove(s.entryID)
	}

	id, err := s.c.AddFunc(expression, func() {
		if err := job(ctx); err != nil {
			cron.DefaultLogger.Error(err, "backup job failed")
		}
		// Update next run time after the job completes.
		s.mu.Lock()
		entry := s.c.Entry(s.entryID)
		s.nextRun = entry.Next
		s.mu.Unlock()
	})
	if err != nil {
		return err
	}

	s.entryID = id
	s.expression = expression
	return nil
}

// Start begins the scheduler in a background goroutine.
func (s *Scheduler) Start() {
	s.c.Start()

	// Capture the initial next-run time.
	s.mu.Lock()
	if s.entryID != 0 {
		entry := s.c.Entry(s.entryID)
		s.nextRun = entry.Next
	}
	s.mu.Unlock()
}

// Stop signals the scheduler to stop accepting new jobs and waits for any
// currently-running job to finish before returning. This makes it safe to call
// during graceful shutdown.
func (s *Scheduler) Stop() context.Context {
	return s.c.Stop()
}

// NextRun returns the next scheduled execution time for the registered job.
// Returns the zero time if no job has been registered.
func (s *Scheduler) NextRun() time.Time {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.entryID == 0 {
		return time.Time{}
	}
	entry := s.c.Entry(s.entryID)
	return entry.Next
}

// Expression returns the cron expression that was used to register the job.
func (s *Scheduler) Expression() string {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.expression
}