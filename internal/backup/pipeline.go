package backup

import (
	"context"
	"fmt"
	"io"
)

// PipelineStage represents a processing stage in a backup pipeline.
type PipelineStage func(ctx context.Context, r io.Reader, w io.Writer) error

// Pipeline chains multiple stages together using io.Pipe, executing each
// stage concurrently. Data flows: source → stage[0] → stage[1] → … → sink.
type Pipeline struct {
	stages []PipelineStage
}

// NewPipeline creates a new Pipeline with the provided stages.
func NewPipeline(stages ...PipelineStage) *Pipeline {
	return &Pipeline{stages: stages}
}

// Run executes the pipeline reading from src and writing final output to dst.
// Each stage is run in its own goroutine, connected via io.Pipe.
func (p *Pipeline) Run(ctx context.Context, src io.Reader, dst io.Writer) error {
	if len(p.stages) == 0 {
		_, err := io.Copy(dst, src)
		return err
	}

	// Build a chain of pipes.
	readers := make([]io.Reader, len(p.stages))
	writers := make([]io.WriteCloser, len(p.stages))

	readers[0] = src
	for i := 1; i < len(p.stages); i++ {
		pr, pw := io.Pipe()
		readers[i] = pr
		writers[i-1] = pw
	}
	// Last writer goes to dst.
	writers[len(p.stages)-1] = &nopWriteCloser{dst}

	errCh := make(chan error, len(p.stages))

	for i, stage := range p.stages {
		i, stage := i, stage
		r := readers[i]
		w := writers[i]
		go func() {
			err := stage(ctx, r, w)
			if err != nil {
				_ = w.Close()
				errCh <- fmt.Errorf("stage %d: %w", i, err)
				return
			}
			errCh <- w.Close()
		}()
	}

	// Collect errors from all stages.
	var firstErr error
	for range p.stages {
		if err := <-errCh; err != nil && firstErr == nil {
			firstErr = err
		}
	}
	return firstErr
}

// nopWriteCloser wraps an io.Writer with a no-op Close method.
type nopWriteCloser struct {
	io.Writer
}

func (nopWriteCloser) Close() error { return nil }