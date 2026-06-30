package dumper

import (
	"testing"
)

func TestBuildDSNFromEnv_Defaults(t *testing.T) {
	// When no PG* vars are set the function should return a valid DSN string.
	dsn := buildDSNFromEnv()
	if dsn == "" {
		t.Error("expected non-empty DSN")
	}
}