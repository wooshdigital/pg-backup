.PHONY: build test test-unit test-integration lint fmt vet docker-test clean

BINARY := bin/worker
GOFLAGS := -trimpath
LDFLAGS := -s -w

## build: Compile the worker binary
build:
	go build $(GOFLAGS) -ldflags "$(LDFLAGS)" -o $(BINARY) ./cmd/worker

## test-unit: Run unit tests (no external dependencies)
test-unit:
	go test -race -count=1 ./...

## test: Alias for test-unit
test: test-unit

## test-integration: Run integration tests using docker-compose
test-integration:
	docker compose -f docker-compose.test.yml up -d --wait postgres localstack setup
	@echo "Waiting for services to be healthy..."
	@sleep 5
	POSTGRES_DSN="postgres://postgres:postgres@localhost:5432/testdb?sslmode=disable" \
	S3_BUCKET="test-bucket" \
	S3_ENDPOINT="http://localhost:4566" \
	AWS_REGION="us-east-1" \
	AWS_ACCESS_KEY="test" \
	AWS_SECRET_KEY="test" \
	go test -v -race -count=1 -tags=integration ./internal/backup/...
	docker compose -f docker-compose.test.yml down

## docker-test: Run all tests inside Docker
docker-test:
	docker compose -f docker-compose.test.yml run --rm setup
	$(MAKE) test-integration

## lint: Run golangci-lint
lint:
	golangci-lint run ./...

## fmt: Format Go source files
fmt:
	gofmt -w .

## vet: Run go vet
vet:
	go vet ./...

## clean: Remove build artifacts
clean:
	rm -rf bin/

## help: Show this help
help:
	@grep -E '^## ' $(MAKEFILE_LIST) | sed 's/## //'