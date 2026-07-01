package scheduler

import (
	"context"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/robfig/cron/v3"
)

// JobFunc is the function signature for jobs registered with the Scheduler.
// The context is cancelled when the scheduler is stopping.
type JobFunc func(ctx context.Context) error

// Scheduler wraps robfig/cron to provide a simpler, context-aware interface
// with built-in skip-if-still-running protection.
type Scheduler struct {
	mu         sync.Mutex
	cr         *cron.Cron
	entryID    cron.EntryID
	logger     *log.Logger
	expression string
	cancelRun  context.CancelFunc
	stopCtx    context.Context
	stopCancel context.CancelFunc
}

// New creates a new Scheduler that will fire jobs according to the given cron
// expression. The logger is used for informational messages.
func New(expression string, logger *log.Logger) (*Scheduler, error) {
	if expression == "" {
		return nil, fmt.Errorf("cron expression must not be empty")
	}

	// Validate the expression up-front.
	parser := cron.NewParser(cron.Minute | cron.Hour | cron.Dom | cron.Month | cron.Dow)
	if _, err := parser.Parse(expression); err != nil {
		return nil, fmt.Errorf("invalid cron expression %q: %w", expression, err)
	}

	if logger == nil {
		logger = log.Default()
	}

	stopCtx, stopCancel := context.WithCancel(context.Background())

	cr := cron.New(
		cron.WithParser(parser),
		cron.WithChain(
			cron.SkipIfStillRunning(cron.DefaultLogger),
		),
		cron.WithLogger(cron.DefaultLogger),
	)

	return &Scheduler{
		cr:         cr,
		logger:     logger,
		expression: expression,
		stopCtx:    stopCtx,
		stopCancel: stopCancel,
	}, nil
}

// Register adds a JobFunc to the scheduler. It must be called before Start().
// Only one job can be registered at a time; calling Register again replaces
// the previous job.
func (s *Scheduler) Register(fn JobFunc) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Remove any previously registered entry.
	if s.entryID != 0 {
		s.cr.Remove(s.entryID)
	}

	id, err := s.cr.AddFunc(s.expression, func() {
		// Each invocation gets its own cancellable context derived from the
		// scheduler-level stop context so that Stop() propagates cancellation
		// to any in-flight job.
		ctx, cancel := context.WithCancel(s.stopCtx)
		s.mu.Lock()
		s.cancelRun = cancel
		s.mu.Unlock()

		defer func() {
			cancel()
			s.mu.Lock()
			s.cancelRun = nil
			s.mu.Unlock()
		}()

		if err := fn(ctx); err != nil {
			s.logger.Printf("scheduler: job error: %v", err)
		}
	})
	if err != nil {
		return fmt.Errorf("register cron job: %w", err)
	}

	s.entryID = id
	return nil
}

// Start begins the cron scheduler in the background.
func (s *Scheduler) Start() {
	s.cr.Start()
}

// Stop signals any in-progress job to cancel via context, then waits for the
// cron scheduler to drain (robfig/cron's Stop() returns a context that is done
// when all running jobs have finished).
func (s *Scheduler) Stop() {
	// Cancel the stop context so running jobs see ctx.Done().
	s.stopCancel()

	// cron.Stop() returns after all running jobs finish.
	stopCtx := s.cr.Stop()

	select {
	case <-stopCtx.Done():
		s.logger.Println("scheduler: all jobs finished")
	case <-time.After(5 * time.Minute):
		s.logger.Println("scheduler: timed out waiting for jobs to finish")
	}
}

// NextRun returns the next scheduled run time for the registered job.
// Returns a zero time if no job is registered or the scheduler has not started.
func (s *Scheduler) NextRun() time.Time {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.entryID == 0 {
		return time.Time{}
	}
	entry := s.cr.Entry(s.entryID)
	return entry.Next
}