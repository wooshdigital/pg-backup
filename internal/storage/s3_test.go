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

	storage "github.com/yourorg/dbworker/internal/storage"
)

const (
	testBucket = "test-backups"
	testRegion = "us-east-1"
)

// startLocalStack spins up a LocalStack container and returns its S3 endpoint URL.
func startLocalStack(t *testing.T) (endpoint string, cleanup func()) {
	t.Helper()

	ctx := context.Background()
	req := testcontainers.ContainerRequest{
		Image:        "localstack/localstack:3",
		ExposedPorts: []string{"4566/tcp"},
		Env: map[string]string{
			"SERVICES":    "s3",
			"DEFAULT_REGION": testRegion,
		},
		WaitingFor: wait.ForHTTP("/_localstack/health").
			WithPort("4566/tcp").
			WithResponseMatcher(func(body io.Reader) bool {
				b, _ := io.ReadAll(body)
				return strings.Contains(string(b), `"s3": "available"`) ||
					strings.Contains(string(b), `"s3":"available"`)
			}).
			WithStartupTimeout(60 * time.Second),
	}

	container, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
		ContainerRequest: req,
		Started:          true,
	})
	if err != nil {
		t.Skipf("skipping LocalStack integration test (container start failed: %v)", err)
	}

	host, err := container.Host(ctx)
	if err != nil {
		_ = container.Terminate(ctx)
		t.Skipf("skipping LocalStack integration test (could not get host: %v)", err)
	}
	port, err := container.MappedPort(ctx, "4566")
	if err != nil {
		_ = container.Terminate(ctx)
		t.Skipf("skipping LocalStack integration test (could not get port: %v)", err)
	}

	endpoint = fmt.Sprintf("http://%s:%s", host, port.Port())
	cleanup = func() {
		_ = container.Terminate(ctx)
	}
	return endpoint, cleanup
}

// newLocalStackClient builds a raw S3 client pointed at LocalStack.
func newLocalStackClient(t *testing.T, endpoint string) *s3.Client {
	t.Helper()
	ctx := context.Background()

	awsCfg, err := awsconfig.LoadDefaultConfig(ctx,
		awsconfig.WithRegion(testRegion),
		awsconfig.WithCredentialsProvider(
			credentials.NewStaticCredentialsProvider("test", "test", ""),
		),
	)
	if err != nil {
		t.Fatalf("failed to load AWS config: %v", err)
	}

	return s3.NewFromConfig(awsCfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(endpoint)
		o.UsePathStyle = true
	})
}

// createBucket creates the test bucket via the raw client.
func createBucket(t *testing.T, client *s3.Client, bucket string) {
	t.Helper()
	ctx := context.Background()
	_, err := client.CreateBucket(ctx, &s3.CreateBucketInput{
		Bucket: aws.String(bucket),
	})
	if err != nil {
		t.Fatalf("failed to create bucket %q: %v", bucket, err)
	}
}

// getObject fetches the body of an object from S3 for assertion.
func getObject(t *testing.T, client *s3.Client, bucket, key string) []byte {
	t.Helper()
	ctx := context.Background()
	out, err := client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		t.Fatalf("GetObject(%q): %v", key, err)
	}
	defer out.Body.Close()
	data, err := io.ReadAll(out.Body)
	if err != nil {
		t.Fatalf("reading body of %q: %v", key, err)
	}
	return data
}

func TestS3Uploader_Upload_Integration(t *testing.T) {
	endpoint, cleanup := startLocalStack(t)
	defer cleanup()

	rawClient := newLocalStackClient(t, endpoint)
	createBucket(t, rawClient, testBucket)

	ctx := context.Background()
	uploader, err := storage.NewS3Uploader(ctx, storage.S3Config{
		Bucket:          testBucket,
		Region:          testRegion,
		Endpoint:        endpoint,
		UsePathStyle:    true,
		AccessKeyID:     "test",
		SecretAccessKey: "test",
		PartSize:        5 * 1024 * 1024,
		Concurrency:     2,
		MaxRetries:      3,
	})
	if err != nil {
		t.Fatalf("NewS3Uploader: %v", err)
	}
	defer uploader.Close()

	tests := []struct {
		name string
		key  string
		data []byte
	}{
		{
			name: "small object",
			key:  "backups/mydb/2024-03-15/dump.sql.gz",
			data: []byte("small-compressed-dump-content"),
		},
		{
			name: "empty object",
			key:  "backups/mydb/2024-03-15/empty.gz",
			data: []byte{},
		},
		{
			name: "object with binary data",
			key:  "backups/mydb/binary.gz",
			data: bytes.Repeat([]byte{0x00, 0xFF, 0xAB}, 100),
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			r := bytes.NewReader(tc.data)
			err := uploader.Upload(ctx, tc.key, r, int64(len(tc.data)))
			if err != nil {
				t.Fatalf("Upload() error: %v", err)
			}

			got := getObject(t, rawClient, testBucket, tc.key)
			if !bytes.Equal(got, tc.data) {
				t.Errorf("data mismatch for key %q: got %d bytes, want %d bytes", tc.key, len(got), len(tc.data))
			}
		})
	}
}

func TestS3Uploader_Upload_EmptyKey(t *testing.T) {
	endpoint, cleanup := startLocalStack(t)
	defer cleanup()

	ctx := context.Background()
	uploader, err := storage.NewS3Uploader(ctx, storage.S3Config{
		Bucket:          testBucket,
		Region:          testRegion,
		Endpoint:        endpoint,
		UsePathStyle:    true,
		AccessKeyID:     "test",
		SecretAccessKey: "test",
	})
	if err != nil {
		t.Fatalf("NewS3Uploader: %v", err)
	}
	defer uploader.Close()

	err = uploader.Upload(ctx, "", bytes.NewReader([]byte("data")), 4)
	if err == nil {
		t.Fatal("expected error for empty key, got nil")
	}
}

func TestNewS3Uploader_Validation(t *testing.T) {
	ctx := context.Background()

	t.Run("missing bucket", func(t *testing.T) {
		_, err := storage.NewS3Uploader(ctx, storage.S3Config{
			Region: "us-east-1",
		})
		if err == nil {
			t.Fatal("expected error for missing bucket")
		}
	})

	t.Run("missing region", func(t *testing.T) {
		_, err := storage.NewS3Uploader(ctx, storage.S3Config{
			Bucket: "mybucket",
		})
		if err == nil {
			t.Fatal("expected error for missing region")
		}
	})
}

func TestS3Uploader_EnsureBucketExists(t *testing.T) {
	endpoint, cleanup := startLocalStack(t)
	defer cleanup()

	ctx := context.Background()
	const newBucket = "auto-created-bucket"

	uploader, err := storage.NewS3Uploader(ctx, storage.S3Config{
		Bucket:          newBucket,
		Region:          testRegion,
		Endpoint:        endpoint,
		UsePathStyle:    true,
		AccessKeyID:     "test",
		SecretAccessKey: "test",
	})
	if err != nil {
		t.Fatalf("NewS3Uploader: %v", err)
	}
	defer uploader.Close()

	if err := uploader.EnsureBucketExists(ctx); err != nil {
		t.Fatalf("EnsureBucketExists: %v", err)
	}

	// Second call should be idempotent.
	if err := uploader.EnsureBucketExists(ctx); err != nil {
		t.Fatalf("EnsureBucketExists (idempotent): %v", err)
	}

	// Verify we can upload to the newly created bucket.
	data := []byte("hello from auto-created bucket")
	if err := uploader.Upload(ctx, "test/key.gz", bytes.NewReader(data), int64(len(data))); err != nil {
		t.Fatalf("Upload to auto-created bucket: %v", err)
	}
}

func TestS3Uploader_LargeObjectMultipart(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping large object test in short mode")
	}

	endpoint, cleanup := startLocalStack(t)
	defer cleanup()

	rawClient := newLocalStackClient(t, endpoint)
	createBucket(t, rawClient, testBucket)

	ctx := context.Background()

	// Use a small PartSize (6 MB) and upload a 12 MB object to force multipart.
	const partSize = 6 * 1024 * 1024
	payload := bytes.Repeat([]byte("ABCDEFGH"), partSize/8*2) // ~12 MB

	uploader, err := storage.NewS3Uploader(ctx, storage.S3Config{
		Bucket:          testBucket,
		Region:          testRegion,
		Endpoint:        endpoint,
		UsePathStyle:    true,
		AccessKeyID:     "test",
		SecretAccessKey: "test",
		PartSize:        partSize,
		Concurrency:     2,
	})
	if err != nil {
		t.Fatalf("NewS3Uploader: %v", err)
	}
	defer uploader.Close()

	key := "large/dump.sql.gz"
	if err := uploader.Upload(ctx, key, bytes.NewReader(payload), int64(len(payload))); err != nil {
		t.Fatalf("Upload large object: %v", err)
	}

	got := getObject(t, rawClient, testBucket, key)
	if len(got) != len(payload) {
		t.Errorf("large object size mismatch: got %d bytes, want %d bytes", len(got), len(payload))
	}
}