package main

import (
	"context"
	"flag"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/sno6/gosane/internal/compress"
	"github.com/sno6/gosane/internal/config"
	"github.com/sno6/gosane/internal/dumper"
)

func main() {
	cfgPath := flag.String("config", "config.yaml", "path to config file")
	flag.Parse()

	cfg, err := config.Load(*cfgPath)
	if err != nil {
		log.Fatalf("load config: %v", err)
	}
	cfg.Defaults()

	compressor, err := compress.NewCompressor(compress.Config{
		Format: compress.Format(cfg.Compression.Format),
		Level:  cfg.Compression.Level,
	})
	if err != nil {
		log.Fatalf("create compressor: %v", err)
	}

	dsn, err := buildDSN(cfg)
	if err != nil {
		log.Fatalf("build DSN: %v", err)
	}

	d := dumper.New(dumper.Options{
		DSN:        dsn,
		OutputDir:  cfg.Storage.OutputDir,
		Compressor: compressor,
	})

	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

	log.Printf("starting dump (format=%s level=%d)", cfg.Compression.Format, cfg.Compression.Level)

	result, err := d.Dump(ctx)
	if err != nil {
		log.Fatalf("dump failed: %v", err)
	}

	log.Printf("dump complete: file=%s size=%d bytes duration=%s",
		result.FilePath, result.CompressedSize, result.Duration)
}

// buildDSN constructs a PostgreSQL connection URI from config.
func buildDSN(cfg *config.Config) (string, error) {
	db := cfg.Database
	dsn := "postgres://" + db.User
	if db.Password != "" {
		dsn += ":" + db.Password
	}
	host := db.Host
	if db.Port != 0 {
		host += ":"
		host += itoa(db.Port)
	}
	dsn += "@" + host + "/" + db.Name
	if db.SSLMode != "" {
		dsn += "?sslmode=" + db.SSLMode
	}
	return dsn, nil
}

func itoa(n int) string {
	buf := make([]byte, 0, 10)
	if n == 0 {
		return "0"
	}
	for n > 0 {
		buf = append([]byte{byte('0' + n%10)}, buf...)
		n /= 10
	}
	return string(buf)
}