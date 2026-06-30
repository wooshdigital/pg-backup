//go:build integration

package dumper_test

import (
	"bytes"
	"context"
	"os"
	"strings"
	"testing"

	"github.com/ssoready/conf/internal/config"
	"github.com/ssoready/conf/internal/dumper"
)

func TestPgDumper_Integration(t *testing.T) {
	dsn := os.Getenv("POSTGRES_DSN")
	if dsn == "" {
		t.Skip("POSTGRES_DSN not set; skipping dumper integration test")
	}

	cfg := &config.Config{
		Database: config.DatabaseConfig{DSN: dsn},
	}

	d, err := dumper.New(cfg)
	if err != nil {
		t.Fatalf("dumper.New: %v", err)
	}

	var buf bytes.Buffer
	if err = d.Dump(context.Background(), &buf); err != nil {
		t.Fatalf("Dump: %v", err)
	}

	if buf.Len() == 0 {
		t.Error("expected non-empty dump output")
	}

	output := buf.String()
	if !strings.Contains(output, "PostgreSQL") {
		t.Logf("dump output (first 200 bytes): %s", output[:min(200, len(output))])
	}
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}