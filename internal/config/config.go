package config

import (
	"compress/gzip"
	"fmt"
	"os"
	"time"

	"gopkg.in/yaml.v3"

	"github.com/your-org/your-repo/internal/compress"
)

// Config holds the application configuration.
type Config struct {
	Database           DatabaseConfig    `yaml:"database"`
	OutputDir          string            `yaml:"output_dir"`
	CompressionFormat  compress.Format   `yaml:"compression_format"`
	CompressionLevel   int               `yaml:"compression_level"`
	DumpTimeout        time.Duration     `yaml:"dump_timeout"`
}

// DatabaseConfig holds database connection details.
type DatabaseConfig struct {
	DSN      string `yaml:"dsn"`
	Host     string `yaml:"host"`
	Port     int    `yaml:"port"`
	User     string `yaml:"user"`
	Password string `yaml:"password"`
	Name     string `yaml:"name"`
	SSLMode  string `yaml:"ssl_mode"`
}

// Validate checks that the configuration is valid.
func (c *Config) Validate() error {
	if c.OutputDir == "" {
		return fmt.Errorf("config: output_dir is required")
	}

	switch c.CompressionFormat {
	case compress.FormatGzip, compress.FormatZstd, compress.FormatNone, "":
		// valid
	default:
		return fmt.Errorf("config: unknown compression_format %q (must be gzip, zstd, or none)", c.CompressionFormat)
	}

	if c.CompressionFormat == compress.FormatGzip || c.CompressionFormat == "" {
		if c.CompressionLevel != 0 {
			if c.CompressionLevel < gzip.HuffmanOnly || c.CompressionLevel > gzip.BestCompression {
				return fmt.Errorf("config: compression_level %d out of range for gzip (must be %d–%d or 0 for default)",
					c.CompressionLevel, gzip.HuffmanOnly, gzip.BestCompression)
			}
		}
	}

	return nil
}

// CompressorConfig returns the compress.Config derived from this Config.
func (c *Config) CompressorConfig() compress.Config {
	format := c.CompressionFormat
	if format == "" {
		format = compress.FormatGzip
	}
	return compress.Config{
		Format:    format,
		GzipLevel: c.CompressionLevel,
	}
}

// Load reads a Config from the given YAML file path.
func Load(path string) (*Config, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, fmt.Errorf("config: open %q: %w", path, err)
	}
	defer f.Close()

	var cfg Config
	dec := yaml.NewDecoder(f)
	dec.KnownFields(true)
	if err := dec.Decode(&cfg); err != nil {
		return nil, fmt.Errorf("config: decode %q: %w", path, err)
	}

	if err := cfg.Validate(); err != nil {
		return nil, err
	}

	return &cfg, nil
}