package storage

import (
	"context"
	"fmt"
	"io"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/aws/retry"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/feature/s3/manager"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

const (
	// DefaultPartSize is the default multipart upload chunk size (5 MiB).
	DefaultPartSize = 5 * 1024 * 1024
	// DefaultConcurrency is the default number of parallel upload goroutines.
	DefaultConcurrency = 5
	// DefaultMaxRetries is the maximum number of retry attempts on transient errors.
	DefaultMaxRetries = 3
)

// S3Config holds all configuration required to construct an S3Uploader.
type S3Config struct {
	// Bucket is the target S3 bucket name (required).
	Bucket string
	// Region is the AWS region, e.g. "us-east-1" (required).
	Region string
	// Endpoint overrides the S3 endpoint URL (useful for LocalStack / MinIO).
	Endpoint string
	// ForcePathStyle forces path-style S3 addressing (required for LocalStack).
	ForcePathStyle bool

	// AccessKeyID and SecretAccessKey provide explicit static credentials.
	// When both are empty the SDK will use the default credential chain
	// (IAM role, env vars, ~/.aws/credentials, etc.).
	AccessKeyID     string
	SecretAccessKey string

	// PartSize is the size of each multipart upload part in bytes.
	// Defaults to DefaultPartSize (5 MiB) when zero.
	PartSize int64
	// Concurrency is the number of parallel goroutines used by the transfer
	// manager.  Defaults to DefaultConcurrency (5) when zero.
	Concurrency int
	// MaxRetries is the maximum number of retry attempts.
	// Defaults to DefaultMaxRetries (3) when zero.
	MaxRetries int
}

// S3Uploader implements StorageBackend using the AWS SDK v2 transfer manager.
type S3Uploader struct {
	bucket   string
	uploader *manager.Uploader
}

// NewS3Uploader constructs a ready-to-use S3Uploader from cfg.
func NewS3Uploader(ctx context.Context, cfg S3Config) (*S3Uploader, error) {
	if cfg.Bucket == "" {
		return nil, fmt.Errorf("storage: S3 bucket name must not be empty")
	}
	if cfg.Region == "" {
		return nil, fmt.Errorf("storage: AWS region must not be empty")
	}

	// Apply defaults.
	if cfg.PartSize <= 0 {
		cfg.PartSize = DefaultPartSize
	}
	if cfg.Concurrency <= 0 {
		cfg.Concurrency = DefaultConcurrency
	}
	if cfg.MaxRetries <= 0 {
		cfg.MaxRetries = DefaultMaxRetries
	}

	// Build the list of SDK option functions.
	optFns := []func(*awsconfig.LoadOptions) error{
		awsconfig.WithRegion(cfg.Region),
		// Exponential backoff retry with configurable max attempts.
		awsconfig.WithRetryer(func() aws.Retryer {
			return retry.NewStandard(func(o *retry.StandardOptions) {
				o.MaxAttempts = cfg.MaxRetries
				o.Backoff = retry.NewExponentialJitterBackoff(20 * time.Second)
			})
		}),
	}

	// Explicit static credentials (optional; IAM role is preferred in prod).
	if cfg.AccessKeyID != "" && cfg.SecretAccessKey != "" {
		optFns = append(optFns,
			awsconfig.WithCredentialsProvider(
				credentials.NewStaticCredentialsProvider(
					cfg.AccessKeyID,
					cfg.SecretAccessKey,
					"", // session token – not used for static creds
				),
			),
		)
	}

	awsCfg, err := awsconfig.LoadDefaultConfig(ctx, optFns...)
	if err != nil {
		return nil, fmt.Errorf("storage: loading AWS config: %w", err)
	}

	// Build the S3 client, applying any endpoint override.
	s3Client := s3.NewFromConfig(awsCfg, func(o *s3.Options) {
		if cfg.Endpoint != "" {
			o.BaseEndpoint = aws.String(cfg.Endpoint)
		}
		o.UsePathStyle = cfg.ForcePathStyle
	})

	uploader := manager.NewUploader(s3Client, func(u *manager.Uploader) {
		u.PartSize    = cfg.PartSize
		u.Concurrency = cfg.Concurrency
	})

	return &S3Uploader{
		bucket:   cfg.Bucket,
		uploader: uploader,
	}, nil
}

// Upload streams the content of r to s3://bucket/key using multipart upload.
// size is accepted for interface compatibility but the S3 transfer manager
// determines the actual part layout dynamically.
func (u *S3Uploader) Upload(ctx context.Context, key string, r io.Reader, size int64) error {
	_, err := u.uploader.Upload(ctx, &s3.PutObjectInput{
		Bucket: aws.String(u.bucket),
		Key:    aws.String(key),
		Body:   r,
	})
	if err != nil {
		return fmt.Errorf("storage: S3 upload to %s/%s failed: %w", u.bucket, key, err)
	}
	return nil
}

// Close is a no-op for S3Uploader; it exists to satisfy StorageBackend.
func (u *S3Uploader) Close() error {
	return nil
}