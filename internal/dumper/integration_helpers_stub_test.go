//go:build !integration

package dumper

import (
	"context"
	"fmt"
)

// startPostgresContainer is a stub used when the "integration" build tag is
// not present. The integration test that calls this will be skipped before
// reaching this function (via the INTEGRATION_TESTS env var check), but we
// need the symbol to exist for compilation.
func startPostgresContainer(_ context.Context) (string, func(), error) {
	return "", nil, fmt.Errorf("integration build tag not set")
}