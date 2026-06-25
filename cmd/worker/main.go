package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"

	"github.com/example/pgdumpworker/internal/compress"
	"github.com/example/pgdumpworker/internal/config"
	"github.com/example/pgdumpworker/internal/dumper"
)

func main() {
	cfgPath := flag.String("config", "config.yaml", "path to configuration file")
	flag.Parse()

	cfg, err := config.Load(*cfgPath)
	if err != nil {
		log.Fatalf("load config: %v", err)
	}

	c, err := compress.NewCompressor(cfg.CompressorConfig())
	if err != nil {
		log.Fatalf("create compressor: %v", err)
	}

	result, err := dumper.Run(context.Background(), dumper.Options{
		DSN:        cfg.DatabaseURL,
		OutputDir:  cfg.OutputDir,
		Compressor: c,
	})
	if err != nil {
		fmt.Fprintf(os.Stderr, "dump failed: %v\n", err)
		os.Exit(1)
	}

	log.Printf("dump complete: %s (%d bytes)", result.FilePath, result.BytesWritten)
}