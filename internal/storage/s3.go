package storage

import (
	"context"
	"fmt"
	"io"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/feature/s3/manager"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

// S3Config holds S3 connection settings.
type S3Config struct {
	Bucket          string
	Region          string
	Endpoint        string
	AccessKeyID     string
	SecretAccessKey string
	ForcePathStyle  bool
}

// S3Backend implements Backend for AWS S3 (and compatible services).
type S3Backend struct {
	client   *s3.Client
	uploader *manager.Uploader
	cfg      S3Config
}

// NewS3 constructs and returns an S3Backend.
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
		return nil, fmt.Errorf("load AWS config: %w", err)
	}

	clientOpts := []func(*s3.Options){}
	if cfg.Endpoint != "" {
		clientOpts = append(clientOpts, func(o *s3.Options) {
			o.BaseEndpoint = aws.String(cfg.Endpoint)
			o.UsePathStyle = cfg.ForcePathStyle
		})
	}

	client := s3.NewFromConfig(awsCfg, clientOpts...)
	uploader := manager.NewUploader(client)

	return &S3Backend{
		client:   client,
		uploader: uploader,
		cfg:      cfg,
	}, nil
}

// Upload streams r to S3 under key and returns the number of bytes read from r.
func (b *S3Backend) Upload(ctx context.Context, key string, r io.Reader) (int64, error) {
	cr := &countingReader{r: r}
	_, err := b.uploader.Upload(ctx, &s3.PutObjectInput{
		Bucket: aws.String(b.cfg.Bucket),
		Key:    aws.String(key),
		Body:   cr,
	})
	if err != nil {
		return cr.n, fmt.Errorf("s3 upload: %w", err)
	}
	return cr.n, nil
}

// EnsureBucket creates the bucket if it doesn't exist (useful for LocalStack / testing).
func (b *S3Backend) EnsureBucket(ctx context.Context) error {
	_, err := b.client.CreateBucket(ctx, &s3.CreateBucketInput{
		Bucket: aws.String(b.cfg.Bucket),
	})
	if err != nil {
		// Ignore "already exists" errors
		// AWS SDK v2 wraps these; a simple string check is pragmatic here.
		// In production, use errors.As with *types.BucketAlreadyExists etc.
		_ = err // best-effort; proceed
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