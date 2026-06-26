// export_test.go exposes internal constructors for use in _test packages
// (i.e. files in package storage_test).  This file is compiled only during
// testing.
package storage

// NewLocalStorageForTest is a test-only alias for NewLocalStorage so that
// external test packages (package storage_test) can construct a LocalStorage
// without importing the unexported constructor directly.
var NewLocalStorageForTest = NewLocalStorage