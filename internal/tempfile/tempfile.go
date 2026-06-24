// Package tempfile provides a helper for creating temporary files.
package tempfile

import (
	"fmt"
	"os"
)

// New creates a new temporary file in the given directory with the given pattern.
// The caller is responsible for closing and removing the file when done.
func New(dir, pattern string) (*os.File, error) {
	f, err := os.CreateTemp(dir, pattern)
	if err != nil {
		return nil, fmt.Errorf("tempfile: create: %w", err)
	}
	return f, nil
}