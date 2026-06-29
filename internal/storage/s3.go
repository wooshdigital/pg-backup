package storage

import (
	"context"
	"fmt"
	"io"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

// S3Config holds the settings required to connect to an S3-compatible store.
type S3Config struct {
	Endpoint        string
	Bucket          string
	Region          string
	AccessKeyID     string
	SecretAccessKey string
	ForcePathStyle  bool
}

// s3Backend implements StorageBackend backed by Amazon S3 (or compatible).
type s3Backend struct {
	client *s3.Client
	bucket string
}

// NewS3 creates a new StorageBackend that writes to the configured S3 bucket.
func NewS3(ctx context.Context, cfg S3Config) (StorageBackend, error) {
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

	return &s3Backend{
		client: client,
		bucket: cfg.Bucket,
	}, nil
}

// Upload streams r to the S3 object at key.
func (b *s3Backend) Upload(ctx context.Context, key string, r io.Reader, size int64) error {
	input := &s3.PutObjectInput{
		Bucket: aws.String(b.bucket),
		Key:    aws.String(key),
		Body:   r,
	}
	if size >= 0 {
		input.ContentLength = aws.Int64(size)
	}

	_, err := b.client.PutObject(ctx, input)
	if err != nil {
		return fmt.Errorf("s3 put object %q: %w", key, err)
	}
	return nil
}

// Delete removes the object at key from S3.
func (b *s3Backend) Delete(ctx context.Context, key string) error {
	_, err := b.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(b.bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return fmt.Errorf("s3 delete object %q: %w", key, err)
	}
	return nil
}

// List returns all object keys in the bucket that share the given prefix.
func (b *s3Backend) List(ctx context.Context, prefix string) ([]string, error) {
	var keys []string
	paginator := s3.NewListObjectsV2Paginator(b.client, &s3.ListObjectsV2Input{
		Bucket: aws.String(b.bucket),
		Prefix: aws.String(prefix),
	})

	for paginator.HasMorePages() {
		page, err := paginator.NextPage(ctx)
		if err != nil {
			return nil, fmt.Errorf("s3 list objects (prefix=%q): %w", prefix, err)
		}
		for _, obj := range page.Contents {
			if obj.Key != nil && !strings.HasSuffix(*obj.Key, "/") {
				keys = append(keys, *obj.Key)
			}
		}
	}
	return keys, nil
}