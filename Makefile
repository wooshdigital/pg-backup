.PHONY: build test test-unit test-integration lint docker-test-up docker-test-down

BINARY     := bin/worker
GO_FILES   := $(shell find . -name '*.go' -not -path './vendor/*')
COMPOSE    := docker compose -f docker-compose.test.yml

build:
	go build -o $(BINARY) ./cmd/worker

test: test-unit

test-unit:
	go test ./... -count=1

test-integration: docker-test-up
	TEST_POSTGRES_DSN="postgres://testuser:testpass@localhost:5433/testdb?sslmode=disable" \
	TEST_S3_ENDPOINT="http://localhost:4566" \
	TEST_S3_BUCKET="test-backups" \
	TEST_S3_REGION="us-east-1" \
	TEST_S3_ACCESS_KEY="test" \
	TEST_S3_SECRET_KEY="test" \
	go test -tags integration ./internal/backup/... -v -count=1 -timeout 5m; \
	EXIT_CODE=$$?; \
	$(MAKE) docker-test-down; \
	exit $$EXIT_CODE

docker-test-up:
	$(COMPOSE) up -d --wait
	@echo "Waiting for setup container to complete..."
	$(COMPOSE) run --rm setup

docker-test-down:
	$(COMPOSE) down -v

lint:
	golangci-lint run ./...