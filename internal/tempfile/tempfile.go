package tempfile

import (
	"fmt"
	"os"
)

// New creates a new temporary file in dir with the given pattern.
// The caller is responsible for closing and removing the file.
func New(dir, pattern string) (*os.File, error) {
	f, err := os.CreateTemp(dir, pattern)
	if err != nil {
		return nil, fmt.Errorf("tempfile: create in %q with pattern %q: %w", dir, pattern, err)
	}
	return f, nil
}