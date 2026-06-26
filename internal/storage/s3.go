package storage

import (
	"context"
	"fmt"
	"io"
	"log"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/aws/retry"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/feature/s3/manager"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

const (
	// DefaultPartSize is the default size (in bytes) of each multipart upload part (5 MB).
	DefaultPartSize = 5 * 1024 * 1024
	// DefaultConcurrency is the default number of concurrent goroutines used for multipart upload.
	DefaultConcurrency = 5
	// DefaultMaxRetries is the maximum number of upload attempts before giving up.
	DefaultMaxRetries = 3
)

// S3UploaderConfig holds all configuration needed to construct an S3Uploader.
type S3UploaderConfig struct {
	// Bucket is the name of the S3 bucket.
	Bucket string
	// Region is the AWS region (e.g. "us-east-1").
	Region string
	// Endpoint overrides the default S3 endpoint; useful for LocalStack / MinIO.
	Endpoint string
	// ForcePathStyle forces path-style S3 URLs (required for LocalStack).
	ForcePathStyle bool
	// AccessKeyID and SecretAccessKey are optional explicit credentials.
	// If empty, the default credential chain (IAM roles, env vars, ~/.aws, etc.) is used.
	AccessKeyID     string
	SecretAccessKey string
	// PartSize is the size in bytes of each multipart upload part.
	// Defaults to DefaultPartSize when zero.
	PartSize int64
	// Concurrency is the number of goroutines used for parallel part uploads.
	// Defaults to DefaultConcurrency when zero.
	Concurrency int
	// MaxRetries is the maximum number of retry attempts for transient errors.
	// Defaults to DefaultMaxRetries when zero.
	MaxRetries int
}

// S3Uploader implements StorageBackend by uploading artifacts to Amazon S3
// (or an S3-compatible service) using the AWS SDK v2 multipart transfer manager.
type S3Uploader struct {
	cfg      S3UploaderConfig
	uploader *manager.Uploader
	bucket   string
}

// NewS3Uploader creates a new S3Uploader from the given config.
// It constructs the AWS SDK v2 client, applies retry and credential settings,
// and wraps it in a multipart transfer manager.
func NewS3Uploader(ctx context.Context, cfg S3UploaderConfig) (*S3Uploader, error) {
	if cfg.Bucket == "" {
		return nil, fmt.Errorf("storage: S3 bucket name must not be empty")
	}
	if cfg.Region == "" {
		return nil, fmt.Errorf("storage: AWS region must not be empty")
	}

	partSize := cfg.PartSize
	if partSize == 0 {
		partSize = DefaultPartSize
	}
	concurrency := cfg.Concurrency
	if concurrency == 0 {
		concurrency = DefaultConcurrency
	}
	maxRetries := cfg.MaxRetries
	if maxRetries == 0 {
		maxRetries = DefaultMaxRetries
	}

	// Build AWS load options.
	loadOpts := []func(*config.LoadOptions) error{
		config.WithRegion(cfg.Region),
		// Exponential backoff with jitter, capped at maxRetries attempts.
		config.WithRetryer(func() aws.Retryer {
			return retry.NewStandard(func(o *retry.StandardOptions) {
				o.MaxAttempts = maxRetries
				o.Backoff = retry.NewExponentialJitterBackoff(30 * time.Second)
			})
		}),
	}

	// Use explicit credentials if provided; otherwise fall back to the default
	// credential chain (environment variables, shared credentials file, IAM role, etc.).
	if cfg.AccessKeyID != "" && cfg.SecretAccessKey != "" {
		loadOpts = append(loadOpts,
			config.WithCredentialsProvider(
				credentials.NewStaticCredentialsProvider(cfg.AccessKeyID, cfg.SecretAccessKey, ""),
			),
		)
	}

	awsCfg, err := config.LoadDefaultConfig(ctx, loadOpts...)
	if err != nil {
		return nil, fmt.Errorf("storage: failed to load AWS config: %w", err)
	}

	// Build the S3 client, optionally overriding the endpoint for local testing.
	s3ClientOpts := []func(*s3.Options){}
	if cfg.Endpoint != "" {
		s3ClientOpts = append(s3ClientOpts,
			func(o *s3.Options) {
				o.BaseEndpoint = aws.String(cfg.Endpoint)
				o.UsePathStyle = cfg.ForcePathStyle
			},
		)
	}
	s3Client := s3.NewFromConfig(awsCfg, s3ClientOpts...)

	uploader := manager.NewUploader(s3Client, func(u *manager.Uploader) {
		u.PartSize = partSize
		u.Concurrency = concurrency
	})

	return &S3Uploader{
		cfg:      cfg,
		uploader: uploader,
		bucket:   cfg.Bucket,
	}, nil
}

// Upload streams r to S3 under the given key using multipart upload.
// size is used as a hint; pass -1 if the total size is unknown.
// Transient errors are retried automatically by the underlying AWS SDK retryer.
func (u *S3Uploader) Upload(ctx context.Context, key string, r io.Reader, size int64) error {
	log.Printf("storage: uploading to s3://%s/%s (size=%d)", u.bucket, key, size)

	input := &s3.PutObjectInput{
		Bucket: aws.String(u.bucket),
		Key:    aws.String(key),
		Body:   r,
	}
	if size >= 0 {
		input.ContentLength = aws.Int64(size)
	}

	result, err := u.uploader.Upload(ctx, input)
	if err != nil {
		return fmt.Errorf("storage: s3 upload to %s/%s failed: %w", u.bucket, key, err)
	}

	log.Printf("storage: upload complete – location=%s", result.Location)
	return nil
}