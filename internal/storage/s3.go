package storage

import (
	"context"
	"fmt"
	"io"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
)

// S3Backend uploads backup files to an Amazon S3 (or compatible) bucket.
type S3Backend struct {
	client   *s3.Client
	bucket   string
	endpoint string
}

// NewS3Backend constructs an S3Backend.
// endpoint is optional; when non-empty it overrides the AWS endpoint (LocalStack / MinIO).
func NewS3Backend(ctx context.Context, bucket, region, endpoint string) (*S3Backend, error) {
	opts := []func(*awsconfig.LoadOptions) error{
		awsconfig.WithRegion(region),
	}

	cfg, err := awsconfig.LoadDefaultConfig(ctx, opts...)
	if err != nil {
		return nil, fmt.Errorf("load AWS config: %w", err)
	}

	clientOpts := []func(*s3.Options){}
	if endpoint != "" {
		clientOpts = append(clientOpts, func(o *s3.Options) {
			o.BaseEndpoint = aws.String(endpoint)
			o.UsePathStyle = true // required for LocalStack / MinIO
		})
	}

	client := s3.NewFromConfig(cfg, clientOpts...)
	return &S3Backend{client: client, bucket: bucket, endpoint: endpoint}, nil
}

// EnsureBucket creates the bucket if it does not already exist.
func (b *S3Backend) EnsureBucket(ctx context.Context) error {
	_, err := b.client.CreateBucket(ctx, &s3.CreateBucketInput{
		Bucket: aws.String(b.bucket),
	})
	if err != nil {
		// Ignore "bucket already exists" errors.
		var bae *types.BucketAlreadyExists
		var baoby *types.BucketAlreadyOwnedByYou
		if isErr(err, bae) || isErr(err, baoby) {
			return nil
		}
		return fmt.Errorf("create bucket %q: %w", b.bucket, err)
	}
	return nil
}

// Upload streams r to S3 under key and returns the number of bytes written.
// It uses the S3 PutObject API which buffers the body in memory for the
// content-length requirement. For very large backups, switch to multipart.
func (b *S3Backend) Upload(ctx context.Context, key string, r io.Reader) (int64, error) {
	// Read all so we can provide ContentLength; for streaming without
	// buffering, use a multipart upload instead.
	data, err := io.ReadAll(r)
	if err != nil {
		return 0, fmt.Errorf("read backup data: %w", err)
	}

	size := int64(len(data))

	_, err = b.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:        aws.String(b.bucket),
		Key:           aws.String(key),
		Body:          newBytesReader(data),
		ContentLength: aws.Int64(size),
	})
	if err != nil {
		return 0, fmt.Errorf("put object %q: %w", key, err)
	}

	return size, nil
}

// isErr is a helper for errors.As without needing an import alias clash.
func isErr[T error](err error, target T) bool {
	import_errors_as := func(err error, target interface{}) bool {
		// inline errors.As logic to avoid import cycle
		type asIface interface{ As(interface{}) bool }
		for {
			if x, ok := err.(asIface); ok && x.As(target) {
				return true
			}
			if err = unwrap(err); err == nil {
				return false
			}
		}
	}
	return import_errors_as(err, &target)
}

func unwrap(err error) error {
	type unwrapper interface{ Unwrap() error }
	if u, ok := err.(unwrapper); ok {
		return u.Unwrap()
	}
	return nil
}

// bytesReader wraps a byte slice in an io.Reader.
type bytesReader struct {
	data   []byte
	offset int
}

func newBytesReader(data []byte) io.Reader {
	return &bytesReader{data: data}
}

func (r *bytesReader) Read(p []byte) (int, error) {
	if r.offset >= len(r.data) {
		return 0, io.EOF
	}
	n := copy(p, r.data[r.offset:])
	r.offset += n
	return n, nil
}