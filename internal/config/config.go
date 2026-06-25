package config

import (
	"fmt"
	"os"

	"gopkg.in/yaml.v3"

	"github.com/your-org/dbworker/internal/compress"
)

// Config holds the full application configuration.
type Config struct {
	Database    DatabaseConfig    `yaml:"database"`
	Storage     StorageConfig     `yaml:"storage"`
	Compression CompressionConfig `yaml:"compression"`
}

// DatabaseConfig holds PostgreSQL connection settings.
type DatabaseConfig struct {
	DSN string `yaml:"dsn"`
}

// StorageConfig holds output/storage settings.
type StorageConfig struct {
	OutputDir string `yaml:"output_dir"`
}

// CompressionConfig controls the compression pipeline.
type CompressionConfig struct {
	// Format is the compression algorithm: "gzip", "zstd", or "none".
	Format compress.Format `yaml:"format"`
	// Level is the compression level; interpretation is algorithm-specific.
	//   gzip: -1 (default), 1 (fastest) … 9 (best)
	//   zstd: 1 (fastest) … 4 (best)
	//   none: ignored
	Level int `yaml:"level"`
}

// Defaults applies sensible default values to zero-value fields.
func (c *Config) Defaults() {
	if c.Compression.Format == "" {
		c.Compression.Format = compress.FormatGzip
	}
	if c.Compression.Level == 0 && c.Compression.Format == compress.FormatGzip {
		c.Compression.Level = -1 // gzip.DefaultCompression
	}
	if c.Storage.OutputDir == "" {
		c.Storage.OutputDir = "/tmp/dbdumps"
	}
}

// Validate checks that required fields are set and values are sensible.
func (c *Config) Validate() error {
	if c.Database.DSN == "" {
		return fmt.Errorf("config: database.dsn is required")
	}
	switch c.Compression.Format {
	case compress.FormatNone, compress.FormatGzip, compress.FormatZstd:
		// valid
	default:
		return fmt.Errorf("config: unknown compression format %q", c.Compression.Format)
	}
	return nil
}

// CompressorConfig returns a compress.Config derived from this Config.
func (c *Config) CompressorConfig() compress.Config {
	return compress.Config{
		Format: c.Compression.Format,
		Level:  c.Compression.Level,
	}
}

// Load reads a YAML configuration file from path and returns a validated Config.
func Load(path string) (*Config, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, fmt.Errorf("config: open %s: %w", path, err)
	}
	defer f.Close()

	var cfg Config
	dec := yaml.NewDecoder(f)
	dec.KnownFields(true)
	if err := dec.Decode(&cfg); err != nil {
		return nil, fmt.Errorf("config: decode %s: %w", path, err)
	}

	cfg.Defaults()

	if err := cfg.Validate(); err != nil {
		return nil, err
	}

	return &cfg, nil
}