.PHONY: build test test-unit test-integration lint clean docker-up docker-down

BINARY := bin/worker
GO     := go
GOTEST := $(GO) test

build:
	$(GO) build -o $(BINARY) ./cmd/worker

test-unit:
	$(GOTEST) -v -count=1 ./...

test-integration: docker-up
	@echo "Waiting for services to be healthy..."
	@sleep 5
	POSTGRES_DSN="postgres://testuser:testpassword@localhost:5432/testdb?sslmode=disable" \
	S3_ENDPOINT="http://localhost:4566" \
	S3_BUCKET="backup-test" \
	AWS_REGION="us-east-1" \
	AWS_ACCESS_KEY_ID="test" \
	AWS_SECRET_ACCESS_KEY="test" \
	$(GOTEST) -v -count=1 -tags=integration -timeout=5m ./internal/backup/...
	$(MAKE) docker-down

docker-up:
	docker compose -f docker-compose.test.yml up -d --wait

docker-down:
	docker compose -f docker-compose.test.yml down -v

lint:
	golangci-lint run ./...

clean:
	rm -rf $(BINARY)