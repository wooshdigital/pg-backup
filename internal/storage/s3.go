package storage

import (
	"context"
	"fmt"
	"io"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"

	"github.com/ssoready/conf/internal/config"
)

type s3Backend struct {
	client *s3.Client
	bucket string
}

func newS3Backend(ctx context.Context, cfg *config.Config) (*s3Backend, error) {
	opts := []func(*awsconfig.LoadOptions) error{
		awsconfig.WithRegion(cfg.Storage.S3Region),
	}

	// Use static test credentials when a custom endpoint is configured (LocalStack).
	if cfg.Storage.S3Endpoint != "" {
		opts = append(opts,
			awsconfig.WithCredentialsProvider(
				credentials.NewStaticCredentialsProvider("test", "test", ""),
			),
		)
	}

	awsCfg, err := awsconfig.LoadDefaultConfig(ctx, opts...)
	if err != nil {
		return nil, fmt.Errorf("load AWS config: %w", err)
	}

	s3Opts := []func(*s3.Options){}
	if cfg.Storage.S3Endpoint != "" {
		endpoint := cfg.Storage.S3Endpoint
		s3Opts = append(s3Opts, func(o *s3.Options) {
			o.BaseEndpoint = aws.String(endpoint)
			o.UsePathStyle = cfg.Storage.S3PathStyle
		})
	}

	client := s3.NewFromConfig(awsCfg, s3Opts...)

	return &s3Backend{
		client: client,
		bucket: cfg.Storage.S3Bucket,
	}, nil
}

func (b *s3Backend) Put(ctx context.Context, r io.Reader) (string, error) {
	key := GenerateKey(".gz")

	_, err := b.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket: aws.String(b.bucket),
		Key:    aws.String(key),
		Body:   r,
	})
	if err != nil {
		return "", fmt.Errorf("s3 put object %q: %w", key, err)
	}
	return key, nil
}