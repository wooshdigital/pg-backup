package storage

import (
	"context"
	"fmt"
	"io"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/aws/retry"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/feature/s3/manager"
	"github.com/aws/aws-sdk-go-v2/service/s3"

	appcfg "github.com/yourusername/dbbackup/internal/config"
)

// S3Uploader implements StorageBackend using AWS S3 with the AWS SDK v2
// s3manager TransferManager for automatic multipart upload.
type S3Uploader struct {
	bucket   string
	uploader *manager.Uploader
	client   *s3.Client
}

// NewS3Uploader constructs an S3Uploader from the application S3 config.
//
// Credential resolution order:
//  1. Explicit key/secret in cfg.Credentials (if AccessKeyID is non-empty).
//  2. Standard AWS credential chain (env vars, ~/.aws/credentials, IAM role, etc.).
func NewS3Uploader(ctx context.Context, cfg appcfg.S3Config) (*S3Uploader, error) {
	maxRetries := cfg.MaxRetries
	if maxRetries <= 0 {
		maxRetries = 3
	}

	maxBackoff := cfg.RetryMaxBackoff
	if maxBackoff <= 0 {
		maxBackoff = 30 * time.Second
	}

	// Build the list of SDK config options.
	opts := []func(*config.LoadOptions) error{
		config.WithRegion(cfg.Region),
		// Exponential backoff with jitter, bounded by maxBackoff.
		config.WithRetryer(func() aws.Retryer {
			return retry.NewStandard(func(o *retry.StandardOptions) {
				o.MaxAttempts = maxRetries
				o.MaxBackoff = maxBackoff
			})
		}),
	}

	// Explicit static credentials take priority over the default chain.
	if cfg.Credentials.AccessKeyID != "" {
		opts = append(opts, config.WithCredentialsProvider(
			credentials.NewStaticCredentialsProvider(
				cfg.Credentials.AccessKeyID,
				cfg.Credentials.SecretAccessKey,
				cfg.Credentials.SessionToken,
			),
		))
	}

	awsCfg, err := config.LoadDefaultConfig(ctx, opts...)
	if err != nil {
		return nil, fmt.Errorf("s3uploader: loading AWS config: %w", err)
	}

	// Build the S3 client, optionally overriding the endpoint for LocalStack.
	s3Opts := []func(*s3.Options){}
	if cfg.Endpoint != "" {
		s3Opts = append(s3Opts, func(o *s3.Options) {
			o.BaseEndpoint = aws.String(cfg.Endpoint)
			o.UsePathStyle = cfg.ForcePathStyle
		})
	} else if cfg.ForcePathStyle {
		s3Opts = append(s3Opts, func(o *s3.Options) {
			o.UsePathStyle = true
		})
	}

	client := s3.NewFromConfig(awsCfg, s3Opts...)

	partSize := cfg.PartSize
	if partSize <= 0 {
		partSize = 5 * 1024 * 1024 // 5 MiB default
	}

	concurrency := cfg.Concurrency
	if concurrency <= 0 {
		concurrency = 5
	}

	uploader := manager.NewUploader(client, func(u *manager.Uploader) {
		u.PartSize = partSize
		u.Concurrency = concurrency
	})

	return &S3Uploader{
		bucket:   cfg.Bucket,
		uploader: uploader,
		client:   client,
	}, nil
}

// Upload streams r to S3 under bucket/key using multipart upload.
// size is informational and passed as the Content-Length hint; pass -1 if unknown.
func (u *S3Uploader) Upload(ctx context.Context, key string, r io.Reader, size int64) error {
	input := &s3.PutObjectInput{
		Bucket: aws.String(u.bucket),
		Key:    aws.String(key),
		Body:   r,
	}
	if size >= 0 {
		input.ContentLength = aws.Int64(size)
	}

	_, err := u.uploader.Upload(ctx, input)
	if err != nil {
		return fmt.Errorf("s3uploader: uploading key %q to bucket %q: %w", key, u.bucket, err)
	}
	return nil
}

// Close is a no-op for the S3 backend; the SDK client holds no persistent
// connections that need explicit teardown.
func (u *S3Uploader) Close() error {
	return nil
}

// Ensure S3Uploader satisfies the StorageBackend interface at compile time.
var _ StorageBackend = (*S3Uploader)(nil)