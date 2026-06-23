package dumper

import "os"

// currentEnv returns a copy of the current process environment.
// Extracted into its own file so tests can override it if needed.
func currentEnv() []string {
	return os.Environ()
}