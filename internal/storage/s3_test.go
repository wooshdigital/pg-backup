//go:build integration

package storage_test

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"testing"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"

	storage "github.com/yourorg/dbworker/internal/storage"
)

const (
	localstackImage  = "localstack/localstack:3.0"
	testBucket       = "test-bucket"
	localstackRegion = "us-east-1"
)

// startLocalStack starts a LocalStack container and returns the S3 endpoint URL and a cleanup function.
func startLocalStack(t *testing.T) (endpoint string, cleanup func()) {
	t.Helper()
	ctx := context.Background()

	req := testcontainers.ContainerRequest{
		Image:        localstackImage,
		ExposedPorts: []string{"4566/tcp"},
		Env: map[string]string{
			"SERVICES":    "s3",
			"DEFAULT_REGION": localstackRegion,
		},
		WaitingFor: wait.ForHTTP("/_localstack/health").WithPort("4566/tcp").WithStartupTimeout(60 * time.Second),
	}

	container, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
		ContainerRequest: req,
		Started:          true,
	})
	if err != nil {
		t.Fatalf("failed to start LocalStack container: %v", err)
	}

	host, err := container.Host(ctx)
	if err != nil {
		t.Fatalf("failed to get container host: %v", err)
	}
	port, err := container.MappedPort(ctx, "4566")
	if err != nil {
		t.Fatalf("failed to get mapped port: %v", err)
	}

	endpoint = fmt.Sprintf("http://%s:%s", host, port.Port())

	cleanup = func() {
		if err := container.Terminate(ctx); err != nil {
			t.Logf("failed to terminate LocalStack container: %v", err)
		}
	}
	return endpoint, cleanup
}

// createBucket creates the test S3 bucket on LocalStack.
func createBucket(t *testing.T, endpoint string) {
	t.Helper()
	ctx := context.Background()

	cfg, err := awsconfig.LoadDefaultConfig(ctx,
		awsconfig.WithRegion(localstackRegion),
		awsconfig.WithCredentialsProvider(
			credentials.NewStaticCredentialsProvider("test", "test", ""),
		),
	)
	if err != nil {
		t.Fatalf("failed to load AWS config: %v", err)
	}

	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(endpoint)
		o.UsePathStyle = true
	})

	_, err = client.CreateBucket(ctx, &s3.CreateBucketInput{
		Bucket: aws.String(testBucket),
	})
	if err != nil {
		t.Fatalf("failed to create test bucket: %v", err)
	}
}

// getObject fetches the content of a key from the test bucket.
func getObject(t *testing.T, endpoint, key string) []byte {
	t.Helper()
	ctx := context.Background()

	cfg, err := awsconfig.LoadDefaultConfig(ctx,
		awsconfig.WithRegion(localstackRegion),
		awsconfig.WithCredentialsProvider(
			credentials.NewStaticCredentialsProvider("test", "test", ""),
		),
	)
	if err != nil {
		t.Fatalf("failed to load AWS config: %v", err)
	}

	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(endpoint)
		o.UsePathStyle = true
	})

	result, err := client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(testBucket),
		Key:    aws.String(key),
	})
	if err != nil {
		t.Fatalf("failed to get object %q: %v", key, err)
	}
	defer result.Body.Close()

	data, err := io.ReadAll(result.Body)
	if err != nil {
		t.Fatalf("failed to read object body: %v", err)
	}
	return data
}

func TestS3Uploader_Upload(t *testing.T) {
	endpoint, cleanup := startLocalStack(t)
	defer cleanup()

	createBucket(t, endpoint)

	ctx := context.Background()
	uploader, err := storage.NewS3Uploader(ctx, storage.S3UploaderConfig{
		Bucket:          testBucket,
		Region:          localstackRegion,
		Endpoint:        endpoint,
		ForcePathStyle:  true,
		AccessKeyID:     "test",
		SecretAccessKey: "test",
		PartSize:        5 * 1024 * 1024,
		Concurrency:     2,
		MaxRetries:      2,
	})
	if err != nil {
		t.Fatalf("NewS3Uploader: %v", err)
	}

	content := []byte("this is a test dump artifact")
	key := "backups/testdb/2024-03-15/1710498600-dump.sql.gz"

	if err := uploader.Upload(ctx, key, bytes.NewReader(content), int64(len(content))); err != nil {
		t.Fatalf("Upload: %v", err)
	}

	got := getObject(t, endpoint, key)
	if !bytes.Equal(got, content) {
		t.Errorf("uploaded content = %q, want %q", got, content)
	}
}

func TestS3Uploader_Upload_LargeFile(t *testing.T) {
	endpoint, cleanup := startLocalStack(t)
	defer cleanup()

	createBucket(t, endpoint)

	ctx := context.Background()
	uploader, err := storage.NewS3Uploader(ctx, storage.S3UploaderConfig{
		Bucket:          testBucket,
		Region:          localstackRegion,
		Endpoint:        endpoint,
		ForcePathStyle:  true,
		AccessKeyID:     "test",
		SecretAccessKey: "test",
		// Use a small part size to force multipart upload during tests.
		PartSize:    5 * 1024 * 1024,
		Concurrency: 3,
		MaxRetries:  2,
	})
	if err != nil {
		t.Fatalf("NewS3Uploader: %v", err)
	}

	// Generate ~12 MB of data to force a multipart upload (> 2 parts at 5 MB each).
	size := 12 * 1024 * 1024
	content := bytes.Repeat([]byte("A"), size)
	key := "backups/testdb/2024-03-15/large-dump.sql.gz"

	if err := uploader.Upload(ctx, key, bytes.NewReader(content), int64(len(content))); err != nil {
		t.Fatalf("Upload (large): %v", err)
	}

	got := getObject(t, endpoint, key)
	if len(got) != size {
		t.Errorf("uploaded size = %d, want %d", len(got), size)
	}
}

func TestS3Uploader_Upload_UnknownSize(t *testing.T) {
	endpoint, cleanup := startLocalStack(t)
	defer cleanup()

	createBucket(t, endpoint)

	ctx := context.Background()
	uploader, err := storage.NewS3Uploader(ctx, storage.S3UploaderConfig{
		Bucket:          testBucket,
		Region:          localstackRegion,
		Endpoint:        endpoint,
		ForcePathStyle:  true,
		AccessKeyID:     "test",
		SecretAccessKey: "test",
	})
	if err != nil {
		t.Fatalf("NewS3Uploader: %v", err)
	}

	content := []byte("unknown size content")
	key := "backups/unknown-size.gz"

	// Pass size=-1 to simulate an unknown content length.
	if err := uploader.Upload(ctx, key, bytes.NewReader(content), -1); err != nil {
		t.Fatalf("Upload (unknown size): %v", err)
	}

	got := getObject(t, endpoint, key)
	if !bytes.Equal(got, content) {
		t.Errorf("content mismatch: got %q, want %q", got, content)
	}
}

func TestS3Uploader_ImplementsStorageBackend(t *testing.T) {
	// Compile-time check that *S3Uploader satisfies StorageBackend.
	var _ storage.StorageBackend = (*storage.S3Uploader)(nil)
}