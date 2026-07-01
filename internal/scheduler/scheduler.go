package scheduler

import (
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/robfig/cron/v3"
)

// Scheduler wraps robfig/cron to provide a clean interface for scheduling
// backup jobs with overlap protection and next-run introspection.
type Scheduler struct {
	cron       *cron.Cron
	entryID    cron.EntryID
	expression string
	logger     *log.Logger
	mu         sync.Mutex
}

// New creates a new Scheduler that will call fn on the given cron expression.
// It uses cron.SkipIfStillRunning to prevent overlapping executions and
// cron.WithSeconds(false) so standard 5-field POSIX cron expressions are
// accepted (minute hour dom month dow).
//
// An error is returned if the cron expression cannot be parsed.
func New(expression string, fn func(), logger *log.Logger) (*Scheduler, error) {
	if expression == "" {
		return nil, fmt.Errorf("cron expression must not be empty")
	}

	// chainLogger bridges cron's logger interface to our *log.Logger.
	chainLogger := &cronLogger{logger: logger}

	c := cron.New(
		cron.WithLogger(chainLogger),
		cron.WithChain(
			cron.SkipIfStillRunning(chainLogger),
			cron.Recover(chainLogger),
		),
	)

	id, err := c.AddFunc(expression, fn)
	if err != nil {
		return nil, fmt.Errorf("invalid cron expression %q: %w", expression, err)
	}

	return &Scheduler{
		cron:       c,
		entryID:    id,
		expression: expression,
		logger:     logger,
	}, nil
}

// Start begins the scheduler's background goroutine.
func (s *Scheduler) Start() {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.cron.Start()
}

// Stop halts the scheduler and blocks until any currently-running job finishes.
func (s *Scheduler) Stop() {
	s.mu.Lock()
	defer s.mu.Unlock()
	ctx := s.cron.Stop()
	// Wait for any running job to finish.
	<-ctx.Done()
}

// NextRun returns the next scheduled execution time. Returns the zero value of
// time.Time if the scheduler has not been started or no entries are registered.
func (s *Scheduler) NextRun() time.Time {
	s.mu.Lock()
	defer s.mu.Unlock()
	entry := s.cron.Entry(s.entryID)
	return entry.Next
}

// cronLogger adapts *log.Logger to cron.Logger.
type cronLogger struct {
	logger *log.Logger
}

func (l *cronLogger) Info(msg string, keysAndValues ...interface{}) {
	l.logger.Printf("[cron] INFO  "+msg, formatKV(keysAndValues)...)
}

func (l *cronLogger) Error(err error, msg string, keysAndValues ...interface{}) {
	l.logger.Printf("[cron] ERROR "+msg+" error=%v", append(formatKV(keysAndValues), err)...)
}

// formatKV converts key-value pairs into printf-compatible arguments by
// building a flat slice where each pair becomes "key=value".
func formatKV(keysAndValues []interface{}) []interface{} {
	if len(keysAndValues) == 0 {
		return nil
	}
	args := make([]interface{}, 0, len(keysAndValues)/2)
	for i := 0; i+1 < len(keysAndValues); i += 2 {
		args = append(args, fmt.Sprintf("%v=%v", keysAndValues[i], keysAndValues[i+1]))
	}
	return args
}