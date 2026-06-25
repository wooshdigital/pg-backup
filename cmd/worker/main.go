package main

import (
	"context"
	"flag"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/yourusername/pg-dump-worker/internal/compress"
	"github.com/yourusername/pg-dump-worker/internal/config"
	"github.com/yourusername/pg-dump-worker/internal/dumper"
)

func main() {
	configPath := flag.String("config", "config.yaml", "path to config file")
	flag.Parse()

	cfg, err := config.Load(*configPath)
	if err != nil {
		log.Fatalf("load config: %v", err)
	}

	compressor, err := compress.NewCompressor(compress.Config{
		Format: string(cfg.CompressionFormat),
		Level:  cfg.CompressionLevel,
	})
	if err != nil {
		log.Fatalf("create compressor: %v", err)
	}

	d := dumper.New(cfg.OutputDir, compressor)

	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

	ctx, cancelTimeout := context.WithTimeout(ctx, cfg.DumpTimeout)
	defer cancelTimeout()

	result, err := d.Dump(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("dump failed: %v", err)
	}

	log.Printf("dump complete: path=%s size=%d bytes duration=%s",
		result.Path, result.Size, result.Duration)
}