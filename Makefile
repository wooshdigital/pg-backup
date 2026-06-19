# ── Variables ──────────────────────────────────────────────────────────────────
BINARY        := pg-s3-backup
CMD_PATH      := ./cmd/worker
BUILD_DIR     := ./bin
COVERAGE_FILE := coverage.out

# Detect the OS for platform-specific commands
UNAME_S := $(shell uname -s)

.PHONY: all build test lint run clean tidy help

## all: Run tidy, lint, test, and build
all: tidy lint test build

## build: Compile the worker binary into ./bin/
build:
	@echo "==> Building $(BINARY)..."
	@mkdir -p $(BUILD_DIR)
	CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o $(BUILD_DIR)/$(BINARY) $(CMD_PATH)
	@echo "    Binary: $(BUILD_DIR)/$(BINARY)"

## test: Run all unit tests with race detection and generate a coverage report
test:
	@echo "==> Running tests..."
	go test -race -coverprofile=$(COVERAGE_FILE) -covermode=atomic ./...
	go tool cover -func=$(COVERAGE_FILE) | tail -1

## lint: Run golangci-lint (install separately: https://golangci-lint.run/usage/install/)
lint:
	@echo "==> Running linter..."
	@which golangci-lint > /dev/null 2>&1 || \
		(echo "golangci-lint not found; install from https://golangci-lint.run/usage/install/" && exit 1)
	golangci-lint run ./...

## run: Build and run the worker using variables from .env (if present)
run: build
	@echo "==> Running $(BINARY)..."
	@if [ -f .env ]; then \
		echo "    Loading environment from .env"; \
		export $$(grep -v '^#' .env | xargs) && $(BUILD_DIR)/$(BINARY); \
	else \
		$(BUILD_DIR)/$(BINARY); \
	fi

## tidy: Tidy and verify Go module dependencies
tidy:
	@echo "==> Tidying modules..."
	go mod tidy
	go mod verify

## clean: Remove build artefacts and coverage files
clean:
	@echo "==> Cleaning..."
	@rm -rf $(BUILD_DIR) $(COVERAGE_FILE)

## help: Print this help message
help:
	@echo "Available targets:"
	@grep -E '^## ' $(MAKEFILE_LIST) | sed 's/## /  /'