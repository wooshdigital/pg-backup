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
	awscfg "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"

	appcfg "github.com/yourusername/dbbackup/internal/config"
	"github.com/yourusername/dbbackup/internal/storage"
)

const (
	localStackImage = "localstack/localstack:3.2"
	testBucket      = "test-backups"
	testRegion      = "us-east-1"
	testAWSKeyID    = "test"
	testAWSSecret   = "test"
)

// startLocalStack launches a LocalStack container and returns its S3 endpoint URL
// along with a cleanup function that should be deferred by the caller.
func startLocalStack(ctx context.Context, t *testing.T) (endpointURL string, cleanup func()) {
	t.Helper()

	req := testcontainers.ContainerRequest{
		Image:        localStackImage,
		ExposedPorts: []string{"4566/tcp"},
		Env: map[string]string{
			"SERVICES":       "s3",
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
		_ = container.Terminate(ctx)
		t.Fatalf("getting container host: %v", err)
	}
	port, err := container.MappedPort(ctx, "4566")
	if err != nil {
		_ = container.Terminate(ctx)
		t.Fatalf("getting mapped port: %v", err)
	}

	endpoint := fmt.Sprintf("http://%s:%s", host, port.Port())

	cleanup = func() {
		if err := container.Terminate(ctx); err != nil {
			t.Logf("terminating LocalStack container: %v", err)
		}
	}

	return endpoint, cleanup
}

// newLocalStackClient returns an S3 client pointed at the given LocalStack endpoint.
func newLocalStackClient(ctx context.Context, t *testing.T, endpoint string) *s3.Client {
	t.Helper()

	cfg, err := awscfg.LoadDefaultConfig(ctx,
		awscfg.WithRegion(testRegion),
		awscfg.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
			testAWSKeyID, testAWSSecret, "",
		)),
	)
	if err != nil {
		t.Fatalf("loading AWS config: %v", err)
	}

	return s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(endpoint)
		o.UsePathStyle = true
	})
}

// createBucket creates the test bucket in the LocalStack S3 instance.
func createBucket(ctx context.Context, t *testing.T, endpoint string) {
	t.Helper()

	client := newLocalStackClient(ctx, t, endpoint)
	_, err := client.CreateBucket(ctx, &s3.CreateBucketInput{
		Bucket: aws.String(testBucket),
	})
	if err != nil {
		t.Fatalf("creating test bucket %q: %v", testBucket, err)
	}
}

// getObject retrieves the body of an S3 object from LocalStack.
func getObject(ctx context.Context, t *testing.T, endpoint, bucket, key string) []byte {
	t.Helper()

	client := newLocalStackClient(ctx, t, endpoint)
	out, err := client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		t.Fatalf("GetObject(%q): %v", key, err)
	}
	defer out.Body.Close()

	body, err := io.ReadAll(out.Body)
	if err != nil {
		t.Fatalf("reading object body: %v", err)
	}
	return body
}

// newTestS3Config builds an S3Config pointed at the given LocalStack endpoint.
func newTestS3Config(endpoint string) appcfg.S3Config {
	return appcfg.S3Config{
		Bucket:         testBucket,
		Region:         testRegion,
		Endpoint:       endpoint,
		ForcePathStyle: true,
		PartSize:       5 * 1024 * 1024,
		Concurrency:    3,
		MaxRetries:     2,
		Credentials: appcfg.S3Credentials{
			AccessKeyID:     testAWSKeyID,
			SecretAccessKey: testAWSSecret,
		},
	}
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

func TestS3Uploader_SmallFile(t *testing.T) {
	ctx := context.Background()

	endpoint, cleanup := startLocalStack(ctx, t)
	defer cleanup()

	createBucket(ctx, t, endpoint)

	uploader, err := storage.NewS3Uploader(ctx, newTestS3Config(endpoint))
	if err != nil {
		t.Fatalf("NewS3Uploader: %v", err)
	}
	defer uploader.Close()

	content := []byte("hello, world!")
	key := "test/small-file.txt"

	if err := uploader.Upload(ctx, key, bytes.NewReader(content), int64(len(content))); err != nil {
		t.Fatalf("Upload: %v", err)
	}

	got := getObject(ctx, t, endpoint, testBucket, key)
	if !bytes.Equal(got, content) {
		t.Errorf("object content mismatch: got %q, want %q", got, content)
	}
}

func TestS3Uploader_LargeFile_Multipart(t *testing.T) {
	ctx := context.Background()

	endpoint, cleanup := startLocalStack(ctx, t)
	defer cleanup()

	createBucket(ctx, t, endpoint)

	// 15 MiB of data → 3 × 5 MiB parts
	const size = 15 * 1024 * 1024
	content := bytes.Repeat([]byte("A"), size)
	key := "test/large-file.bin"

	uploader, err := storage.NewS3Uploader(ctx, newTestS3Config(endpoint))
	if err != nil {
		t.Fatalf("NewS3Uploader: %v", err)
	}
	defer uploader.Close()

	if err := uploader.Upload(ctx, key, bytes.NewReader(content), int64(size)); err != nil {
		t.Fatalf("Upload: %v", err)
	}

	got := getObject(ctx, t, endpoint, testBucket, key)
	if len(got) != size {
		t.Errorf("object size mismatch: got %d bytes, want %d bytes", len(got), size)
	}
	if !bytes.Equal(got, content) {
		t.Error("object content mismatch for large file")
	}
}

func TestS3Uploader_KeyTemplate(t *testing.T) {
	ctx := context.Background()

	endpoint, cleanup := startLocalStack(ctx, t)
	defer cleanup()

	createBucket(ctx, t, endpoint)

	uploader, err := storage.NewS3Uploader(ctx, newTestS3Config(endpoint))
	if err != nil {
		t.Fatalf("NewS3Uploader: %v", err)
	}
	defer uploader.Close()

	fixedTime := time.Date(2024, 6, 15, 8, 0, 0, 0, time.UTC)
	key, err := storage.RenderKey("backups/{hostname}/{db}/{date}/{timestamp}.sql.gz", storage.KeyData{
		DB:        "mydb",
		Timestamp: fixedTime,
		Hostname:  "testhost",
	})
	if err != nil {
		t.Fatalf("RenderKey: %v", err)
	}

	expectedKey := "backups/testhost/mydb/2024-06-15/20240615T080000Z.sql.gz"
	if key != expectedKey {
		t.Errorf("rendered key = %q, want %q", key, expectedKey)
	}

	content := []byte("fake dump data")
	if err := uploader.Upload(ctx, key, bytes.NewReader(content), int64(len(content))); err != nil {
		t.Fatalf("Upload: %v", err)
	}

	got := getObject(ctx, t, endpoint, testBucket, key)
	if !bytes.Equal(got, content) {
		t.Errorf("content mismatch after template key upload")
	}
}

func TestS3Uploader_UnknownSizeUpload(t *testing.T) {
	ctx := context.Background()

	endpoint, cleanup := startLocalStack(ctx, t)
	defer cleanup()

	createBucket(ctx, t, endpoint)

	uploader, err := storage.NewS3Uploader(ctx, newTestS3Config(endpoint))
	if err != nil {
		t.Fatalf("NewS3Uploader: %v", err)
	}
	defer uploader.Close()

	content := "streaming content with unknown size"
	key := "test/unknown-size.txt"

	// Pass -1 for size to exercise the unknown-size code path.
	if err := uploader.Upload(ctx, key, strings.NewReader(content), -1); err != nil {
		t.Fatalf("Upload: %v", err)
	}

	got := getObject(ctx, t, endpoint, testBucket, key)
	if string(got) != content {
		t.Errorf("content mismatch: got %q, want %q", got, content)
	}
}

func TestS3Uploader_OverwriteExistingKey(t *testing.T) {
	ctx := context.Background()

	endpoint, cleanup := startLocalStack(ctx, t)
	defer cleanup()

	createBucket(ctx, t, endpoint)

	uploader, err := storage.NewS3Uploader(ctx, newTestS3Config(endpoint))
	if err != nil {
		t.Fatalf("NewS3Uploader: %v", err)
	}
	defer uploader.Close()

	key := "test/overwrite.txt"

	first := []byte("first version")
	if err := uploader.Upload(ctx, key, bytes.NewReader(first), int64(len(first))); err != nil {
		t.Fatalf("first Upload: %v", err)
	}

	second := []byte("second version")
	if err := uploader.Upload(ctx, key, bytes.NewReader(second), int64(len(second))); err != nil {
		t.Fatalf("second Upload: %v", err)
	}

	got := getObject(ctx, t, endpoint, testBucket, key)
	if !bytes.Equal(got, second) {
		t.Errorf("expected second version after overwrite, got %q", got)
	}
}

func TestS3Uploader_MultipleUploaders_SameBucket(t *testing.T) {
	ctx := context.Background()

	endpoint, cleanup := startLocalStack(ctx, t)
	defer cleanup()

	createBucket(ctx, t, endpoint)

	cfg := newTestS3Config(endpoint)

	u1, err := storage.NewS3Uploader(ctx, cfg)
	if err != nil {
		t.Fatalf("NewS3Uploader u1: %v", err)
	}
	defer u1.Close()

	u2, err := storage.NewS3Uploader(ctx, cfg)
	if err != nil {
		t.Fatalf("NewS3Uploader u2: %v", err)
	}
	defer u2.Close()

	data1 := []byte("data from uploader 1")
	data2 := []byte("data from uploader 2")

	if err := u1.Upload(ctx, "key1.txt", bytes.NewReader(data1), int64(len(data1))); err != nil {
		t.Fatalf("u1.Upload: %v", err)
	}
	if err := u2.Upload(ctx, "key2.txt", bytes.NewReader(data2), int64(len(data2))); err != nil {
		t.Fatalf("u2.Upload: %v", err)
	}

	if got := getObject(ctx, t, endpoint, testBucket, "key1.txt"); !bytes.Equal(got, data1) {
		t.Errorf("key1 content mismatch")
	}
	if got := getObject(ctx, t, endpoint, testBucket, "key2.txt"); !bytes.Equal(got, data2) {
		t.Errorf("key2 content mismatch")
	}
}