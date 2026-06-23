.PHONY: all build test test-unit test-integration lint tidy

# Binary output directory
BIN_DIR := bin
WORKER_BIN := $(BIN_DIR)/worker

all: build

build:
	@mkdir -p $(BIN_DIR)
	go build -o $(WORKER_BIN) ./cmd/worker

# Unit tests only (no Docker required)
test-unit:
	go test ./... -v -count=1

# Integration tests (requires Docker)
test-integration:
	go test ./... -v -count=1 -tags=integration -timeout=120s

test: test-unit

lint:
	golangci-lint run ./...

tidy:
	go mod tidy