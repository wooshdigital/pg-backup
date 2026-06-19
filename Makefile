# ============================================================================
# pg-s3-backup Makefile
# ============================================================================

BINARY_NAME   := pg-s3-backup
BUILD_DIR     := bin
CMD_PATH      := ./cmd/worker
MODULE        := github.com/org/pg-s3-backup
COVERAGE_FILE := coverage.out

# Go tool wrappers — override via env if needed
GO      ?= go
GOTEST  ?= $(GO) test
GOBUILD ?= $(GO) build

.PHONY: all build test lint run clean tidy help

## all: build and test (default target)
all: build test

## build: compile the worker binary into ./bin/
build:
	@echo "==> Building $(BINARY_NAME)..."
	@mkdir -p $(BUILD_DIR)
	$(GOBUILD) -o $(BUILD_DIR)/$(BINARY_NAME) $(CMD_PATH)
	@echo "    Binary: $(BUILD_DIR)/$(BINARY_NAME)"

## test: run all unit tests with race detector and coverage
test:
	@echo "==> Running tests..."
	$(GOTEST) -race -coverprofile=$(COVERAGE_FILE) -covermode=atomic ./...
	@$(GO) tool cover -func=$(COVERAGE_FILE) | tail -1

## test-verbose: run tests with verbose output
test-verbose:
	@echo "==> Running tests (verbose)..."
	$(GOTEST) -v -race -coverprofile=$(COVERAGE_FILE) -covermode=atomic ./...

## lint: run golangci-lint (must be installed separately)
lint:
	@echo "==> Linting..."
	@which golangci-lint > /dev/null 2>&1 || \
		(echo "golangci-lint not found — install from https://golangci-lint.run/usage/install/" && exit 1)
	golangci-lint run ./...

## run: build and run the worker (reads config.yaml or env vars)
run: build
	@echo "==> Running $(BINARY_NAME)..."
	./$(BUILD_DIR)/$(BINARY_NAME)

## tidy: tidy and verify go module dependencies
tidy:
	@echo "==> Tidying modules..."
	$(GO) mod tidy
	$(GO) mod verify

## clean: remove build artifacts and coverage files
clean:
	@echo "==> Cleaning..."
	@rm -rf $(BUILD_DIR) $(COVERAGE_FILE)

## help: print this help message
help:
	@echo "Available targets:"
	@grep -E '^## ' Makefile | sed 's/## /  /'