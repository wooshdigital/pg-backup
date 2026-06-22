# ============================================================
# pg-s3-backup — Developer Makefile
# ============================================================

# Go binary name and module path
BINARY      := pg-s3-backup
MODULE      := github.com/org/pg-s3-backup
CMD_PATH    := ./cmd/worker

# Build output directory
BUILD_DIR   := ./bin

# Go tools
GO          := go
GOFLAGS     :=

# Linting (requires golangci-lint to be installed)
GOLANGCI    := golangci-lint

.PHONY: all build test lint fmt vet run clean tidy help

## all: Build and test (default target)
all: build test

## build: Compile the worker binary into ./bin/
build:
	@echo "==> Building $(BINARY)..."
	@mkdir -p $(BUILD_DIR)
	$(GO) build $(GOFLAGS) -o $(BUILD_DIR)/$(BINARY) $(CMD_PATH)
	@echo "    Binary written to $(BUILD_DIR)/$(BINARY)"

## test: Run all unit tests with race detection and coverage
test:
	@echo "==> Running tests..."
	$(GO) test -race -count=1 -coverprofile=coverage.out ./...
	@echo "==> Coverage summary:"
	$(GO) tool cover -func=coverage.out | tail -1

## test-verbose: Run tests with verbose output
test-verbose:
	$(GO) test -v -race -count=1 -coverprofile=coverage.out ./...

## cover: Open HTML coverage report in the default browser
cover: test
	$(GO) tool cover -html=coverage.out

## lint: Run golangci-lint
lint:
	@echo "==> Linting..."
	$(GOLANGCI) run ./...

## fmt: Format all Go source files
fmt:
	@echo "==> Formatting..."
	$(GO) fmt ./...

## vet: Run go vet
vet:
	@echo "==> Vetting..."
	$(GO) vet ./...

## tidy: Tidy and verify go.mod / go.sum
tidy:
	@echo "==> Tidying modules..."
	$(GO) mod tidy
	$(GO) mod verify

## run: Build and run the worker (requires env vars or config.yaml)
run: build
	@echo "==> Running $(BINARY)..."
	$(BUILD_DIR)/$(BINARY)

## clean: Remove build artifacts and coverage output
clean:
	@echo "==> Cleaning..."
	@rm -rf $(BUILD_DIR) coverage.out

## help: Display this help text
help:
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@grep -E '^##' $(MAKEFILE_LIST) | sed 's/## /  /' | column -t -s ':'
	@echo ""