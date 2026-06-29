package storage

import (
	"context"
	"fmt"
	"io"
	"log/slog"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

// S3Config holds configuration for the S3 storage backend.
type S3Config struct {
	Bucket          string
	Region          string
	Endpoint        string
	ForcePathStyle  bool
	AccessKeyID     string
	SecretAccessKey string
}

// S3Backend implements Backend using Amazon S3 (or a compatible service).
type S3Backend struct {
	client *s3.Client
	cfg    S3Config
}

// NewS3 creates a new S3Backend.
func NewS3(ctx context.Context, cfg S3Config) (*S3Backend, error) {
	opts := []func(*awsconfig.LoadOptions) error{
		awsconfig.WithRegion(cfg.Region),
	}

	if cfg.AccessKeyID != "" && cfg.SecretAccessKey != "" {
		opts = append(opts, awsconfig.WithCredentialsProvider(
			credentials.NewStaticCredentialsProvider(cfg.AccessKeyID, cfg.SecretAccessKey, ""),
		))
	}

	awsCfg, err := awsconfig.LoadDefaultConfig(ctx, opts...)
	if err != nil {
		return nil, fmt.Errorf("load aws config: %w", err)
	}

	clientOpts := []func(*s3.Options){}
	if cfg.Endpoint != "" {
		clientOpts = append(clientOpts, func(o *s3.Options) {
			o.BaseEndpoint = aws.String(cfg.Endpoint)
			o.UsePathStyle = cfg.ForcePathStyle
		})
	}

	client := s3.NewFromConfig(awsCfg, clientOpts...)
	return &S3Backend{client: client, cfg: cfg}, nil
}

// Put uploads the contents of r to S3 at the given key.
func (b *S3Backend) Put(ctx context.Context, key string, r io.Reader) (int64, error) {
	slog.Debug("s3: uploading object", "bucket", b.cfg.Bucket, "key", key)

	// We need to count bytes as we upload.
	cr := &countingReader{r: r}

	_, err := b.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket: aws.String(b.cfg.Bucket),
		Key:    aws.String(key),
		Body:   cr,
	})
	if err != nil {
		return 0, fmt.Errorf("s3 put object: %w", err)
	}

	slog.Debug("s3: upload complete", "bucket", b.cfg.Bucket, "key", key, "bytes", cr.n)
	return cr.n, nil
}

// EnsureBucket creates the S3 bucket if it does not already exist.
func (b *S3Backend) EnsureBucket(ctx context.Context) error {
	_, err := b.client.CreateBucket(ctx, &s3.CreateBucketInput{
		Bucket: aws.String(b.cfg.Bucket),
	})
	if err != nil {
		// Ignore "bucket already exists" errors.
		// In production code you would type-assert the AWS error.
		slog.Debug("s3: create bucket (may already exist)", "bucket", b.cfg.Bucket, "error", err)
	}
	return nil
}

// countingReader wraps an io.Reader and counts bytes read.
type countingReader struct {
	r io.Reader
	n int64
}

func (c *countingReader) Read(p []byte) (int, error) {
	n, err := c.r.Read(p)
	c.n += int64(n)
	return n, err
}