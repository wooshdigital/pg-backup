//go:build integration

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

// startLocalStack launches a LocalStack container and returns its HTTP endpoint
// together with a cleanup function.
func startLocalStack(t *testing.T) (endpoint string, cleanup func()) {
	t.Helper()
	ctx := context.Background()

	req := testcontainers.ContainerRequest{
		Image:        "localstack/localstack:3.2",
		ExposedPorts: []string{"4566/tcp"},
		Env: map[string]string{
			"SERVICES":    "s3",
			"DEFAULT_REGION": testRegion,
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

	host, err := container.Host(ctx)
	if err != nil {
		t.Fatalf("getting LocalStack host: %v", err)
	}
	port, err := container.MappedPort(ctx, "4566")
	if err != nil {
		t.Fatalf("getting LocalStack port: %v", err)
	}

	ep := fmt.Sprintf("http://%s:%s", host, port.Port())

	cleanup = func() {
		if err := container.Terminate(context.Background()); err != nil {
			t.Logf("terminating LocalStack container: %v", err)
		}
	}
	return ep, cleanup
}

// createBucket creates the test bucket in LocalStack.
func createBucket(t *testing.T, endpoint string) {
	t.Helper()
	ctx := context.Background()

	cfg, err := awsconfig.LoadDefaultConfig(ctx,
		awsconfig.WithRegion(testRegion),
		awsconfig.WithCredentialsProvider(
			credentials.NewStaticCredentialsProvider("test", "test", ""),
		),
	)
	if err != nil {
		t.Fatalf("loading AWS config for bucket creation: %v", err)
	}

	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(endpoint)
		o.UsePathStyle = true
	})

	_, err = client.CreateBucket(ctx, &s3.CreateBucketInput{
		Bucket: aws.String(testBucket),
	})
	if err != nil {
		t.Fatalf("creating test bucket: %v", err)
	}
}

// downloadObject fetches the content of key from LocalStack for assertion.
func downloadObject(t *testing.T, endpoint, key string) []byte {
	t.Helper()
	ctx := context.Background()

	cfg, err := awsconfig.LoadDefaultConfig(ctx,
		awsconfig.WithRegion(testRegion),
		awsconfig.WithCredentialsProvider(
			credentials.NewStaticCredentialsProvider("test", "test", ""),
		),
	)
	if err != nil {
		t.Fatalf("loading AWS config for download: %v", err)
	}

	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(endpoint)
		o.UsePathStyle = true
	})

	out, err := client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(testBucket),
		Key:    aws.String(key),
	})
	if err != nil {
		t.Fatalf("downloading object %q: %v", key, err)
	}
	defer out.Body.Close()

	data, err := io.ReadAll(out.Body)
	if err != nil {
		t.Fatalf("reading object body: %v", err)
	}
	return data
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

func TestS3Uploader_SmallFile(t *testing.T) {
	endpoint, cleanup := startLocalStack(t)
	defer cleanup()
	createBucket(t, endpoint)

	cfg := storage.S3Config{
		Bucket:          testBucket,
		Region:          testRegion,
		Endpoint:        endpoint,
		ForcePathStyle:  true,
		AccessKeyID:     "test",
		SecretAccessKey: "test",
	}

	uploader, err := storage.NewS3Uploader(context.Background(), cfg)
	if err != nil {
		t.Fatalf("NewS3Uploader: %v", err)
	}
	defer uploader.Close()

	content := "hello, world!"
	key := "test/small-file.txt"

	err = uploader.Upload(context.Background(), key, strings.NewReader(content), int64(len(content)))
	if err != nil {
		t.Fatalf("Upload: %v", err)
	}

	got := downloadObject(t, endpoint, key)
	if string(got) != content {
		t.Errorf("uploaded content = %q; want %q", string(got), content)
	}
}

func TestS3Uploader_LargeFile_Multipart(t *testing.T) {
	endpoint, cleanup := startLocalStack(t)
	defer cleanup()
	createBucket(t, endpoint)

	// Use a small part size (6 MiB) and upload 15 MiB to trigger multipart.
	const partSize = 6 * 1024 * 1024
	const totalSize = 15 * 1024 * 1024

	cfg := storage.S3Config{
		Bucket:          testBucket,
		Region:          testRegion,
		Endpoint:        endpoint,
		ForcePathStyle:  true,
		AccessKeyID:     "test",
		SecretAccessKey: "test",
		PartSize:        partSize,
		Concurrency:     2,
	}

	uploader, err := storage.NewS3Uploader(context.Background(), cfg)
	if err != nil {
		t.Fatalf("NewS3Uploader: %v", err)
	}
	defer uploader.Close()

	data := bytes.Repeat([]byte("x"), totalSize)
	key := "test/large-file.bin"

	err = uploader.Upload(context.Background(), key, bytes.NewReader(data), int64(totalSize))
	if err != nil {
		t.Fatalf("Upload (multipart): %v", err)
	}

	got := downloadObject(t, endpoint, key)
	if len(got) != totalSize {
		t.Errorf("uploaded size = %d; want %d", len(got), totalSize)
	}
	if !bytes.Equal(got, data) {
		t.Error("uploaded content does not match original data")
	}
}

func TestS3Uploader_KeyTemplateRendering(t *testing.T) {
	endpoint, cleanup := startLocalStack(t)
	defer cleanup()
	createBucket(t, endpoint)

	cfg := storage.S3Config{
		Bucket:          testBucket,
		Region:          testRegion,
		Endpoint:        endpoint,
		ForcePathStyle:  true,
		AccessKeyID:     "test",
		SecretAccessKey: "test",
	}

	uploader, err := storage.NewS3Uploader(context.Background(), cfg)
	if err != nil {
		t.Fatalf("NewS3Uploader: %v", err)
	}
	defer uploader.Close()

	kr := storage.NewKeyRenderer("backups/{db}/{date}/dump.sql.gz")
	key := kr.Render("mydb", time.Date(2024, 3, 15, 0, 0, 0, 0, time.UTC))
	expected := "backups/mydb/2024-03-15/dump.sql.gz"
	if key != expected {
		t.Errorf("rendered key = %q; want %q", key, expected)
	}

	content := "fake-compressed-dump"
	err = uploader.Upload(context.Background(), key, strings.NewReader(content), int64(len(content)))
	if err != nil {
		t.Fatalf("Upload with rendered key: %v", err)
	}

	got := downloadObject(t, endpoint, key)
	if string(got) != content {
		t.Errorf("content = %q; want %q", string(got), content)
	}
}

func TestS3Uploader_InvalidConfig(t *testing.T) {
	tests := []struct {
		name string
		cfg  storage.S3Config
	}{
		{
			name: "missing bucket",
			cfg:  storage.S3Config{Region: "us-east-1"},
		},
		{
			name: "missing region",
			cfg:  storage.S3Config{Bucket: "my-bucket"},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			_, err := storage.NewS3Uploader(context.Background(), tc.cfg)
			if err == nil {
				t.Error("expected error, got nil")
			}
		})
	}
}

func TestS3Uploader_ContextCancellation(t *testing.T) {
	endpoint, cleanup := startLocalStack(t)
	defer cleanup()
	createBucket(t, endpoint)

	cfg := storage.S3Config{
		Bucket:          testBucket,
		Region:          testRegion,
		Endpoint:        endpoint,
		ForcePathStyle:  true,
		AccessKeyID:     "test",
		SecretAccessKey: "test",
	}

	uploader, err := storage.NewS3Uploader(context.Background(), cfg)
	if err != nil {
		t.Fatalf("NewS3Uploader: %v", err)
	}
	defer uploader.Close()

	ctx, cancel := context.WithCancel(context.Background())
	cancel() // cancel immediately

	err = uploader.Upload(ctx, "test/cancelled.txt", strings.NewReader("data"), 4)
	if err == nil {
		t.Error("expected error due to cancelled context, got nil")
	}
}