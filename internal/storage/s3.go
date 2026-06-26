package storage

import (
	"context"
	"fmt"
	"io"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/feature/s3/manager"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

const (
	// DefaultPartSize is the size of each part in a multipart upload (5 MB).
	DefaultPartSize = 5 * 1024 * 1024
	// DefaultConcurrency is the number of goroutines used for multipart upload.
	DefaultConcurrency = 5
	// DefaultMaxRetries is the maximum number of upload attempts.
	DefaultMaxRetries = 3
)

// S3Config holds configuration for the S3Uploader.
type S3Config struct {
	// Bucket is the target S3 bucket name. Required.
	Bucket string
	// Region is the AWS region (e.g. "us-east-1"). Required.
	Region string
	// Endpoint is an optional custom endpoint URL (e.g. for LocalStack).
	Endpoint string
	// UsePathStyle forces path-style addressing (required for LocalStack / MinIO).
	UsePathStyle bool
	// AccessKeyID and SecretAccessKey are optional static credentials.
	// When empty, the default credential chain (env vars, IAM role, etc.) is used.
	AccessKeyID     string
	SecretAccessKey string
	// SessionToken is an optional STS session token.
	SessionToken string
	// PartSize is the size of each multipart part in bytes. Defaults to DefaultPartSize.
	PartSize int64
	// Concurrency is the number of parallel upload goroutines. Defaults to DefaultConcurrency.
	Concurrency int
	// MaxRetries is the maximum number of attempts on transient failures. Defaults to DefaultMaxRetries.
	MaxRetries int
}

// S3Uploader implements StorageBackend for Amazon S3 (and S3-compatible stores).
type S3Uploader struct {
	cfg      S3Config
	uploader *manager.Uploader
	client   *s3.Client
}

// NewS3Uploader creates a new S3Uploader using the provided S3Config.
// It configures the AWS SDK v2 client with the supplied options and wraps it
// in an s3manager.Uploader for automatic multipart upload support.
func NewS3Uploader(ctx context.Context, cfg S3Config) (*S3Uploader, error) {
	if cfg.Bucket == "" {
		return nil, fmt.Errorf("s3: bucket name must not be empty")
	}
	if cfg.Region == "" {
		return nil, fmt.Errorf("s3: region must not be empty")
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

	// Build AWS SDK load options.
	loadOpts := []func(*awsconfig.LoadOptions) error{
		awsconfig.WithRegion(cfg.Region),
	}

	// Static credentials take priority over the default chain.
	if cfg.AccessKeyID != "" && cfg.SecretAccessKey != "" {
		staticCreds := credentials.NewStaticCredentialsProvider(
			cfg.AccessKeyID,
			cfg.SecretAccessKey,
			cfg.SessionToken,
		)
		loadOpts = append(loadOpts, awsconfig.WithCredentialsProvider(staticCreds))
	}

	// Configure exponential backoff retry.
	loadOpts = append(loadOpts, awsconfig.WithRetryMaxAttempts(cfg.MaxRetries))
	loadOpts = append(loadOpts, awsconfig.WithRetryMode(aws.RetryModeAdaptive))

	awsCfg, err := awsconfig.LoadDefaultConfig(ctx, loadOpts...)
	if err != nil {
		return nil, fmt.Errorf("s3: failed to load AWS config: %w", err)
	}

	// Build S3 client options.
	s3Opts := []func(*s3.Options){}
	if cfg.Endpoint != "" {
		s3Opts = append(s3Opts, func(o *s3.Options) {
			o.BaseEndpoint = aws.String(cfg.Endpoint)
		})
	}
	if cfg.UsePathStyle {
		s3Opts = append(s3Opts, func(o *s3.Options) {
			o.UsePathStyle = true
		})
	}

	client := s3.NewFromConfig(awsCfg, s3Opts...)

	uploader := manager.NewUploader(client, func(u *manager.Uploader) {
		u.PartSize = cfg.PartSize
		u.Concurrency = cfg.Concurrency
	})

	return &S3Uploader{
		cfg:      cfg,
		uploader: uploader,
		client:   client,
	}, nil
}

// Upload streams r to S3 under the given key with automatic multipart chunking
// and exponential-backoff retry (configured at the AWS client level).
//
// The size parameter is informational; the s3manager handles unknown sizes
// gracefully by reading in parts.
func (u *S3Uploader) Upload(ctx context.Context, key string, r io.Reader, size int64) error {
	if key == "" {
		return fmt.Errorf("s3: upload key must not be empty")
	}

	input := &s3.PutObjectInput{
		Bucket: aws.String(u.cfg.Bucket),
		Key:    aws.String(key),
		Body:   r,
	}
	if size > 0 {
		input.ContentLength = aws.Int64(size)
	}

	_, err := u.uploader.Upload(ctx, input)
	if err != nil {
		return fmt.Errorf("s3: upload to s3://%s/%s failed: %w", u.cfg.Bucket, key, err)
	}
	return nil
}

// Close is a no-op for S3Uploader (connections are managed by the HTTP transport).
func (u *S3Uploader) Close() error {
	return nil
}

// EnsureBucketExists creates the bucket if it does not already exist.
// This is primarily useful in development / integration-test scenarios.
func (u *S3Uploader) EnsureBucketExists(ctx context.Context) error {
	_, err := u.client.HeadBucket(ctx, &s3.HeadBucketInput{
		Bucket: aws.String(u.cfg.Bucket),
	})
	if err == nil {
		return nil // Bucket already exists.
	}

	_, createErr := u.client.CreateBucket(ctx, &s3.CreateBucketInput{
		Bucket: aws.String(u.cfg.Bucket),
	})
	if createErr != nil {
		return fmt.Errorf("s3: failed to create bucket %q: %w", u.cfg.Bucket, createErr)
	}
	return nil
}

// retryWithBackoff is a helper used by callers that need manual retry logic
// outside the AWS SDK layer (e.g., for non-SDK operations).
func retryWithBackoff(ctx context.Context, maxAttempts int, fn func() error) error {
	var lastErr error
	delay := 200 * time.Millisecond
	for attempt := 0; attempt < maxAttempts; attempt++ {
		if attempt > 0 {
			select {
			case <-ctx.Done():
				return ctx.Err()
			case <-time.After(delay):
			}
			delay *= 2 // Exponential backoff.
		}
		if err := fn(); err != nil {
			lastErr = err
			continue
		}
		return nil
	}
	return fmt.Errorf("all %d attempts failed, last error: %w", maxAttempts, lastErr)
}