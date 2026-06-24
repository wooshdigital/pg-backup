package tempfile

import (
	"fmt"
	"os"
)

// New creates a new temporary file in dir with the given pattern.
// The caller is responsible for closing and removing the file.
// This is a thin wrapper around os.CreateTemp that validates inputs.
func New(dir, pattern string) (*os.File, error) {
	f, err := os.CreateTemp(dir, pattern)
	if err != nil {
		return nil, fmt.Errorf("creating temp file in %q with pattern %q: %w", dir, pattern, err)
	}
	return f, nil
}