.PHONY: build test test-unit test-integration lint

# Build the worker binary.
build:
	go build -o bin/worker ./cmd/worker

# Run unit tests only.
test-unit:
	go test ./...

# Run all tests including integration tests (requires Docker).
test-integration: docker-up
	POSTGRES_DSN="postgres://postgres:postgres@localhost:5432/testdb?sslmode=disable" \
	S3_ENDPOINT="http://localhost:4566" \
	S3_BUCKET="test-backups" \
	AWS_REGION="us-east-1" \
	AWS_ACCESS_KEY_ID="test" \
	AWS_SECRET_ACCESS_KEY="test" \
	go test -tags=integration -v -timeout 120s ./internal/backup/...
	$(MAKE) docker-down

# Run all tests (unit + integration).
test: test-unit test-integration

# Start test dependencies via docker-compose.
docker-up:
	docker compose -f docker-compose.test.yml up -d --wait

# Stop test dependencies.
docker-down:
	docker compose -f docker-compose.test.yml down --volumes

lint:
	golangci-lint run ./...