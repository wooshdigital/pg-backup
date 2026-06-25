// Package tempfile provides helpers for creating temporary files.
package tempfile

import (
	"os"
)

// New creates a new temporary file in dir with the given pattern.
// It is a thin wrapper around os.CreateTemp that ensures consistent
// error handling across the codebase.
func New(dir, pattern string) (*os.File, error) {
	return os.CreateTemp(dir, pattern)
}