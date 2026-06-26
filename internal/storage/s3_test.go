package storage_test

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"strings"
	"testing"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"

	storage "github.com/yourusername/dbbackup/internal/storage"
)

const (
	localstackImage  = "localstack/localstack:3.0"
	testBucket       = "test-backups"
	localstackRegion = "us-east-1"
)

// startLocalStack launches a LocalStack container and returns the S3 endpoint URL.
func startLocalStack(ctx context.Context, t *testing.T) (endpoint string, teardown func()) {
	t.Helper()

	req := testcontainers.ContainerRequest{
		Image:        localstackImage,
		ExposedPorts: []string{"4566/tcp"},
		Env: map[string]string{
			"SERVICES":    "s3",
			"DEFAULT_REGION": localstackRegion,
		},
		WaitingFor: wait.ForHTTP("/_localstack/health").
			WithPort("4566/tcp").
			WithStartupTimeout(60 * time.Second),
	}

	container, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
		ContainerRequest: req,
		Started:          true,
	})
	if err != nil {
		t.Fatalf("starting LocalStack container: %v", err)
	}

	mappedPort, err := container.MappedPort(ctx, "4566")
	if err != nil {
		t.Fatalf("getting LocalStack mapped port: %v", err)
	}

	host, err := container.Host(ctx)
	if err != nil {
		t.Fatalf("getting LocalStack host: %v", err)
	}

	ep := fmt.Sprintf("http://%s:%s", host, mappedPort.Port())
	teardown = func() {
		if err := container.Terminate(ctx); err != nil {
			t.Logf("terminating LocalStack container: %v", err)
		}
	}
	return ep, teardown
}

// createBucket creates an S3 bucket on the given endpoint using the AWS SDK directly.
func createBucket(ctx context.Context, t *testing.T, endpoint, bucket string) {
	t.Helper()

	awsCfg, err := awsconfig.LoadDefaultConfig(ctx,
		awsconfig.WithRegion(localstackRegion),
		awsconfig.WithCredentialsProvider(credentials.NewStaticCredentialsProvider("test", "test", "")),
	)
	if err != nil {
		t.Fatalf("loading aws config: %v", err)
	}

	client := s3.NewFromConfig(awsCfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(endpoint)
		o.UsePathStyle = true
	})

	_, err = client.CreateBucket(ctx, &s3.CreateBucketInput{
		Bucket: aws.String(bucket),
	})
	if err != nil {
		t.Fatalf("creating bucket %q: %v", bucket, err)
	}
}

// newTestUploader builds an S3Uploader pointed at the LocalStack endpoint.
func newTestUploader(ctx context.Context, t *testing.T, endpoint string) *storage.S3Uploader {
	t.Helper()

	up, err := storage.NewS3Uploader(ctx, storage.S3UploaderConfig{
		Bucket:          testBucket,
		Region:          localstackRegion,
		Endpoint:        endpoint,
		ForcePathStyle:  true,
		AccessKeyID:     "test",
		SecretAccessKey: "test",
		PartSizeMB:      5,
		Concurrency:     3,
		MaxRetries:      3,
	})
	if err != nil {
		t.Fatalf("creating S3Uploader: %v", err)
	}
	return up
}

// ---- Tests -----------------------------------------------------------------

func TestS3Uploader_Upload_SmallObject(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in short mode")
	}

	ctx := context.Background()
	endpoint, teardown := startLocalStack(ctx, t)
	defer teardown()
	createBucket(ctx, t, endpoint, testBucket)

	up := newTestUploader(ctx, t, endpoint)

	const key = "backups/mydb/2024-03-15/mydb-1710495000.sql.gz"
	payload := []byte("fake compressed dump data")

	if err := up.Upload(ctx, key, bytes.NewReader(payload), int64(len(payload))); err != nil {
		t.Fatalf("Upload: %v", err)
	}

	// Verify the object exists.
	ok, err := up.Exists(ctx, key)
	if err != nil {
		t.Fatalf("Exists: %v", err)
	}
	if !ok {
		t.Errorf("expected key %q to exist after upload", key)
	}
}

func TestS3Uploader_Upload_LargeObject(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in short mode")
	}

	ctx := context.Background()
	endpoint, teardown := startLocalStack(ctx, t)
	defer teardown()
	createBucket(ctx, t, endpoint, testBucket)

	up := newTestUploader(ctx, t, endpoint)

	// Generate ~12 MB of data to force multipart upload (> 5 MB part size).
	const size = 12 * 1024 * 1024
	data := bytes.Repeat([]byte("x"), size)
	key := "backups/large/2024-03-15/large-dump.sql.gz"

	if err := up.Upload(ctx, key, bytes.NewReader(data), int64(size)); err != nil {
		t.Fatalf("Upload large object: %v", err)
	}

	ok, err := up.Exists(ctx, key)
	if err != nil {
		t.Fatalf("Exists: %v", err)
	}
	if !ok {
		t.Errorf("expected key %q to exist after upload", key)
	}
}

func TestS3Uploader_Exists_NonExistentKey(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in short mode")
	}

	ctx := context.Background()
	endpoint, teardown := startLocalStack(ctx, t)
	defer teardown()
	createBucket(ctx, t, endpoint, testBucket)

	up := newTestUploader(ctx, t, endpoint)

	ok, err := up.Exists(ctx, "does/not/exist.sql.gz")
	if err != nil {
		t.Fatalf("Exists: %v", err)
	}
	if ok {
		t.Error("expected non-existent key to return false")
	}
}

func TestS3Uploader_Delete(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in short mode")
	}

	ctx := context.Background()
	endpoint, teardown := startLocalStack(ctx, t)
	defer teardown()
	createBucket(ctx, t, endpoint, testBucket)

	up := newTestUploader(ctx, t, endpoint)

	const key = "backups/todelete.sql.gz"
	if err := up.Upload(ctx, key, strings.NewReader("data"), -1); err != nil {
		t.Fatalf("Upload: %v", err)
	}

	if err := up.Delete(ctx, key); err != nil {
		t.Fatalf("Delete: %v", err)
	}

	ok, err := up.Exists(ctx, key)
	if err != nil {
		t.Fatalf("Exists after delete: %v", err)
	}
	if ok {
		t.Errorf("key %q should not exist after deletion", key)
	}
}

func TestS3Uploader_UploadWithRetry(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in short mode")
	}

	ctx := context.Background()
	endpoint, teardown := startLocalStack(ctx, t)
	defer teardown()
	createBucket(ctx, t, endpoint, testBucket)

	up := newTestUploader(ctx, t, endpoint)

	const key = "backups/retry-test.sql.gz"
	payload := []byte("retry payload data")

	calls := 0
	factory := func() (io.Reader, int64, error) {
		calls++
		return bytes.NewReader(payload), int64(len(payload)), nil
	}

	if err := up.UploadWithRetry(ctx, key, factory); err != nil {
		t.Fatalf("UploadWithRetry: %v", err)
	}

	// Should succeed on first attempt; factory called exactly once.
	if calls != 1 {
		t.Errorf("factory called %d times, want 1", calls)
	}

	ok, err := up.Exists(ctx, key)
	if err != nil {
		t.Fatalf("Exists: %v", err)
	}
	if !ok {
		t.Errorf("key %q should exist after UploadWithRetry", key)
	}
}

func TestS3Uploader_EmptyKey_ReturnsError(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in short mode")
	}

	ctx := context.Background()
	endpoint, teardown := startLocalStack(ctx, t)
	defer teardown()
	createBucket(ctx, t, endpoint, testBucket)

	up := newTestUploader(ctx, t, endpoint)

	err := up.Upload(ctx, "", strings.NewReader("data"), -1)
	if err == nil {
		t.Error("expected error for empty key, got nil")
	}
}

func TestNewS3Uploader_MissingBucket_ReturnsError(t *testing.T) {
	ctx := context.Background()
	_, err := storage.NewS3Uploader(ctx, storage.S3UploaderConfig{
		Region: "us-east-1",
	})
	if err == nil {
		t.Error("expected error when bucket is empty")
	}
}

func TestNewS3Uploader_MissingRegion_ReturnsError(t *testing.T) {
	ctx := context.Background()
	_, err := storage.NewS3Uploader(ctx, storage.S3UploaderConfig{
		Bucket: "my-bucket",
	})
	if err == nil {
		t.Error("expected error when region is empty")
	}
}