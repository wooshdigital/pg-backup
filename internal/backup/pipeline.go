package backup

import (
	"context"
	"fmt"
	"io"
	"log/slog"

	"github.com/soapboxsys/ombudslib/internal/compress"
	"github.com/soapboxsys/ombudslib/internal/dumper"
	"github.com/soapboxsys/ombudslib/internal/storage"
)

// Pipeline represents a streaming backup pipeline that connects a Dumper,
// Compressor, and StorageBackend via io.Pipe without intermediate temp files.
type Pipeline struct {
	Dumper     dumper.Dumper
	Compressor compress.Compressor
	Storage    storage.Backend
	Logger     *slog.Logger
}

// NewPipeline creates a new streaming Pipeline.
func NewPipeline(d dumper.Dumper, c compress.Compressor, s storage.Backend, logger *slog.Logger) *Pipeline {
	if logger == nil {
		logger = slog.Default()
	}
	return &Pipeline{
		Dumper:     d,
		Compressor: c,
		Storage:    s,
		Logger:     logger,
	}
}

// PipelineResult holds the outcome of a streaming pipeline run.
type PipelineResult struct {
	Key  string
	Size int64
}

// Run executes the streaming pipeline:
//
//	pg_dump → [pipe1] → compressor → [pipe2] → storage upload
func (p *Pipeline) Run(ctx context.Context) (PipelineResult, error) {
	key := storage.GenerateKey(p.Compressor.Extension())

	// pipe1 connects dumper output to compressor input
	dumpReader, dumpWriter := io.Pipe()
	// pipe2 connects compressor output to storage input
	compReader, compWriter := io.Pipe()

	dumpErrCh := make(chan error, 1)
	compErrCh := make(chan error, 1)

	// Stage 1: run dump into dumpWriter
	go func() {
		defer dumpWriter.Close()
		p.Logger.InfoContext(ctx, "pipeline: starting dump stage")
		if err := p.Dumper.Dump(ctx, dumpWriter); err != nil {
			dumpWriter.CloseWithError(err)
			dumpErrCh <- fmt.Errorf("dump stage: %w", err)
			return
		}
		dumpErrCh <- nil
	}()

	// Stage 2: compress dumpReader → compWriter
	go func() {
		defer compWriter.Close()
		p.Logger.InfoContext(ctx, "pipeline: starting compress stage")
		if err := p.Compressor.Compress(ctx, dumpReader, compWriter); err != nil {
			compWriter.CloseWithError(err)
			compErrCh <- fmt.Errorf("compress stage: %w", err)
			return
		}
		compErrCh <- nil
	}()

	// Stage 3: upload compReader to storage (runs in current goroutine)
	p.Logger.InfoContext(ctx, "pipeline: starting upload stage", slog.String("key", key))
	size, uploadErr := p.Storage.Upload(ctx, key, compReader)
	if uploadErr != nil {
		compReader.CloseWithError(uploadErr)
		// drain channels
		<-dumpErrCh
		<-compErrCh
		return PipelineResult{}, fmt.Errorf("upload stage: %w", uploadErr)
	}

	// Collect errors from goroutines
	if err := <-compErrCh; err != nil {
		<-dumpErrCh
		return PipelineResult{}, err
	}
	if err := <-dumpErrCh; err != nil {
		return PipelineResult{}, err
	}

	p.Logger.InfoContext(ctx, "pipeline: all stages complete",
		slog.String("key", key),
		slog.Int64("size_bytes", size),
	)

	return PipelineResult{Key: key, Size: size}, nil
}