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
	s3types "github.com/aws/aws-sdk-go-v2/service/s3/types"
)

const (
	defaultPartSizeBytes = 5 * 1024 * 1024 // 5 MB
	defaultConcurrency   = 5
	defaultMaxRetries    = 3
	megabyte             = 1024 * 1024
)

// S3UploaderConfig holds all the settings needed to configure an S3Uploader.
type S3UploaderConfig struct {
	// Bucket is the target S3 bucket name (required).
	Bucket string

	// Region is the AWS region (required).
	Region string

	// Endpoint overrides the S3 endpoint (e.g. http://localhost:4566 for LocalStack).
	Endpoint string

	// ForcePathStyle enables path-style S3 URLs (required for LocalStack/MinIO).
	ForcePathStyle bool

	// PartSizeMB is the multipart upload part size in MiB (default 5).
	PartSizeMB int64

	// Concurrency is the number of concurrent upload goroutines (default 5).
	Concurrency int

	// MaxRetries is the maximum number of retry attempts for transient errors (default 3).
	MaxRetries int

	// AccessKeyID / SecretAccessKey are optional explicit credentials.
	// When empty the default credential chain is used (IAM role, env vars, shared config).
	AccessKeyID     string
	SecretAccessKey string
	SessionToken    string

	// ServerSideEncryption specifies the SSE algorithm (e.g. "AES256"). Optional.
	ServerSideEncryption string

	// StorageClass sets the S3 storage class (e.g. "STANDARD_IA"). Optional.
	StorageClass string
}

// S3Uploader implements StorageBackend backed by Amazon S3 (or a compatible service).
type S3Uploader struct {
	cfg      S3UploaderConfig
	client   *s3.Client
	uploader *manager.Uploader
}

// NewS3Uploader creates and returns a new S3Uploader ready for use.
func NewS3Uploader(ctx context.Context, cfg S3UploaderConfig) (*S3Uploader, error) {
	if cfg.Bucket == "" {
		return nil, fmt.Errorf("s3: bucket name must not be empty")
	}
	if cfg.Region == "" {
		return nil, fmt.Errorf("s3: region must not be empty")
	}

	// Apply defaults.
	if cfg.PartSizeMB <= 0 {
		cfg.PartSizeMB = defaultPartSizeBytes / megabyte
	}
	if cfg.Concurrency <= 0 {
		cfg.Concurrency = defaultConcurrency
	}
	if cfg.MaxRetries <= 0 {
		cfg.MaxRetries = defaultMaxRetries
	}

	// Build the AWS config options.
	var awsOpts []func(*awsconfig.LoadOptions) error

	awsOpts = append(awsOpts, awsconfig.WithRegion(cfg.Region))

	// Explicit credentials take priority over the default chain.
	if cfg.AccessKeyID != "" && cfg.SecretAccessKey != "" {
		awsOpts = append(awsOpts, awsconfig.WithCredentialsProvider(
			credentials.NewStaticCredentialsProvider(
				cfg.AccessKeyID,
				cfg.SecretAccessKey,
				cfg.SessionToken,
			),
		))
	}

	// Configure retries with exponential back-off.
	awsOpts = append(awsOpts, awsconfig.WithRetryMaxAttempts(cfg.MaxRetries))
	awsOpts = append(awsOpts, awsconfig.WithRetryMode(aws.RetryModeStandard))

	awsCfg, err := awsconfig.LoadDefaultConfig(ctx, awsOpts...)
	if err != nil {
		return nil, fmt.Errorf("s3: loading AWS config: %w", err)
	}

	// Build the S3 client with optional endpoint override and path-style.
	s3Opts := []func(*s3.Options){}
	if cfg.Endpoint != "" {
		s3Opts = append(s3Opts, func(o *s3.Options) {
			o.BaseEndpoint = aws.String(cfg.Endpoint)
		})
	}
	if cfg.ForcePathStyle {
		s3Opts = append(s3Opts, func(o *s3.Options) {
			o.UsePathStyle = true
		})
	}

	client := s3.NewFromConfig(awsCfg, s3Opts...)

	partSizeBytes := cfg.PartSizeMB * megabyte
	up := manager.NewUploader(client, func(u *manager.Uploader) {
		u.PartSize = partSizeBytes
		u.Concurrency = cfg.Concurrency
		// Leave BufferProvider at default (nil → no extra buffering).
	})

	return &S3Uploader{
		cfg:      cfg,
		client:   client,
		uploader: up,
	}, nil
}

// Upload streams r to S3 under the given key. size is used as a hint only.
func (u *S3Uploader) Upload(ctx context.Context, key string, r io.Reader, size int64) error {
	if key == "" {
		return fmt.Errorf("s3: key must not be empty")
	}

	input := &s3.PutObjectInput{
		Bucket: aws.String(u.cfg.Bucket),
		Key:    aws.String(key),
		Body:   r,
	}

	if u.cfg.ServerSideEncryption != "" {
		input.ServerSideEncryption = s3types.ServerSideEncryption(u.cfg.ServerSideEncryption)
	}

	if u.cfg.StorageClass != "" {
		input.StorageClass = s3types.StorageClass(u.cfg.StorageClass)
	}

	// size > 0 lets the SDK skip an extra HeadObject call on some paths.
	if size > 0 {
		input.ContentLength = aws.Int64(size)
	}

	_, err := u.uploader.Upload(ctx, input)
	if err != nil {
		return fmt.Errorf("s3: uploading key %q to bucket %q: %w", key, u.cfg.Bucket, err)
	}
	return nil
}

// Delete removes the object at key from S3. Returns nil if the object did not exist.
func (u *S3Uploader) Delete(ctx context.Context, key string) error {
	_, err := u.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(u.cfg.Bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return fmt.Errorf("s3: deleting key %q from bucket %q: %w", key, u.cfg.Bucket, err)
	}
	return nil
}

// Exists reports whether an object with the given key exists in the bucket.
func (u *S3Uploader) Exists(ctx context.Context, key string) (bool, error) {
	_, err := u.client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(u.cfg.Bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		// A 404 / NoSuchKey response means the object does not exist.
		if isNotFound(err) {
			return false, nil
		}
		return false, fmt.Errorf("s3: checking existence of key %q in bucket %q: %w", key, u.cfg.Bucket, err)
	}
	return true, nil
}

// UploadWithRetry attempts to upload up to maxAttempts times with exponential back-off.
// This is a convenience wrapper for callers that need retry logic independent of the
// AWS SDK's built-in retry (e.g. when wrapping a non-retryable error at a higher level).
func (u *S3Uploader) UploadWithRetry(ctx context.Context, key string, readerFactory func() (io.Reader, int64, error)) error {
	var lastErr error
	for attempt := 0; attempt < u.cfg.MaxRetries; attempt++ {
		if attempt > 0 {
			backoff := time.Duration(1<<uint(attempt-1)) * time.Second // 1s, 2s, 4s …
			select {
			case <-ctx.Done():
				return ctx.Err()
			case <-time.After(backoff):
			}
		}

		r, size, err := readerFactory()
		if err != nil {
			return fmt.Errorf("s3: creating reader for retry attempt %d: %w", attempt+1, err)
		}

		if err = u.Upload(ctx, key, r, size); err == nil {
			return nil
		}
		lastErr = err
	}
	return fmt.Errorf("s3: upload failed after %d attempts: %w", u.cfg.MaxRetries, lastErr)
}

// isNotFound returns true when err represents a 404 / NoSuchKey S3 response.
func isNotFound(err error) bool {
	if err == nil {
		return false
	}
	errStr := err.Error()
	return contains(errStr, "NoSuchKey") ||
		contains(errStr, "NotFound") ||
		contains(errStr, "404")
}

func contains(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || len(s) > 0 && containsStr(s, substr))
}

func containsStr(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}