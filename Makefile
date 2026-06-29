.PHONY: build test test-unit test-integration lint docker-up docker-down

# Build the worker binary
build:
	go build -o bin/worker ./cmd/worker

# Run all unit tests (no integration tag)
test-unit:
	go test ./... -count=1 -race

# Run integration tests (requires docker-compose.test.yml services to be running)
test-integration: docker-up
	POSTGRES_DSN="postgres://testuser:testpassword@localhost:5432/testdb?sslmode=disable" \
	S3_ENDPOINT="http://localhost:4566" \
	S3_BUCKET="test-backups" \
	AWS_REGION="us-east-1" \
	AWS_ACCESS_KEY="test" \
	AWS_SECRET_KEY="test" \
	go test ./... -tags integration -count=1 -v -timeout 5m

# Alias
test: test-unit

# Spin up the test services
docker-up:
	docker compose -f docker-compose.test.yml up -d --wait

# Tear down the test services
docker-down:
	docker compose -f docker-compose.test.yml down -v

lint:
	golangci-lint run ./...