// export_test.go exposes internal types and functions needed by external test
// packages (those using package storage_test).
package storage

// Re-export S3Uploader and its constructor so integration tests in the
// storage_test package can use them without importing internal symbols directly.
// (Go allows this pattern via the export_test.go convention.)

// S3Uploader is already exported; this file exists to document the convention
// and to export any unexported helpers needed by tests.

// Ensure LocalStorage satisfies StorageBackend at compile time.
var _ StorageBackend = (*LocalStorage)(nil)

// Ensure S3Uploader satisfies StorageBackend at compile time.
var _ StorageBackend = (*S3Uploader)(nil)