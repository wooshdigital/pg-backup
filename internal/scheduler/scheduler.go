package scheduler

import (
	"context"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/robfig/cron/v3"
)

// JobFunc is the function signature for a scheduled backup job.
// It receives a context that is cancelled when the scheduler is stopping.
type JobFunc func(ctx context.Context) error

// Scheduler wraps robfig/cron and provides a clean API for starting,
// stopping, and querying the next scheduled run.
type Scheduler struct {
	cron       *cron.Cron
	logger     *log.Logger
	entryID    cron.EntryID
	expression string

	// jobCtx / jobCancel allow us to propagate shutdown into a running job.
	mu        sync.Mutex
	jobCtx    context.Context    //nolint:containedctx
	jobCancel context.CancelFunc
}

// New creates a Scheduler that will execute fn on the given cron expression.
// The cron expression follows standard 5-field POSIX syntax (minute, hour,
// day-of-month, month, day-of-week), e.g. "0 2 * * *" for 02:00 daily.
func New(expression string, logger *log.Logger, fn JobFunc) (*Scheduler, error) {
	if expression == "" {
		return nil, fmt.Errorf("cron expression must not be empty")
	}

	s := &Scheduler{
		logger:     logger,
		expression: expression,
	}

	// Use SkipIfStillRunning so that a long backup does not queue up
	// a second run while the first is still in progress.
	c := cron.New(
		cron.WithLogger(cron.DefaultLogger),
		cron.WithChain(cron.SkipIfStillRunning(cron.DefaultLogger)),
	)

	id, err := c.AddFunc(expression, func() {
		// Create a child context that we can cancel on shutdown.
		s.mu.Lock()
		ctx, cancel := context.WithCancel(context.Background())
		s.jobCtx = ctx
		s.jobCancel = cancel
		s.mu.Unlock()

		defer func() {
			s.mu.Lock()
			cancel()
			s.jobCtx = nil
			s.jobCancel = nil
			s.mu.Unlock()
		}()

		if err := fn(ctx); err != nil {
			logger.Printf("[scheduler] job error: %v", err)
		} else {
			if next, ok := s.NextRun(); ok {
				logger.Printf("[scheduler] next run scheduled at %s", next.Format(time.RFC3339))
			}
		}
	})
	if err != nil {
		return nil, fmt.Errorf("invalid cron expression %q: %w", expression, err)
	}

	s.cron = c
	s.entryID = id
	return s, nil
}

// Start begins the cron scheduler in the background.
func (s *Scheduler) Start() {
	s.cron.Start()
}

// Stop halts the scheduler and waits for any currently-running job to finish.
// It also cancels the job context so long-running operations can react promptly.
func (s *Scheduler) Stop() {
	// Signal a running job that it should wrap up.
	s.mu.Lock()
	if s.jobCancel != nil {
		s.jobCancel()
	}
	s.mu.Unlock()

	// cron.Stop() returns a context that is done when all running jobs finish.
	stopCtx := s.cron.Stop()
	<-stopCtx.Done()
}

// NextRun returns the next scheduled execution time for the registered job.
// The second return value is false when the scheduler has no entries.
func (s *Scheduler) NextRun() (time.Time, bool) {
	entry := s.cron.Entry(s.entryID)
	if entry.ID == 0 {
		return time.Time{}, false
	}
	return entry.Next, true
}