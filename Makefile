# =============================================================================
# pg-s3-backup — Makefile
# =============================================================================

BINARY      := pg-s3-backup
CMD_DIR     := ./cmd/worker
BUILD_DIR   := ./bin
COVERAGE    := coverage.out

# Detect OS for binary extension
ifeq ($(OS),Windows_NT)
	BINARY := $(BINARY).exe
endif

.PHONY: all build test lint run clean tidy help

## all: build the binary (default target)
all: build

## build: compile the binary into ./bin/
build:
	@echo "==> Building $(BINARY)..."
	@mkdir -p $(BUILD_DIR)
	go build -o $(BUILD_DIR)/$(BINARY) $(CMD_DIR)
	@echo "    Binary: $(BUILD_DIR)/$(BINARY)"

## test: run all unit tests with race detector and coverage
test:
	@echo "==> Running tests..."
	go test -race -coverprofile=$(COVERAGE) -covermode=atomic ./...
	@echo "==> Coverage report:"
	go tool cover -func=$(COVERAGE)

## lint: run golangci-lint (must be installed separately)
lint:
	@echo "==> Linting..."
	golangci-lint run ./...

## run: build and run the binary (reads config from environment / config.yaml)
run: build
	@echo "==> Running $(BINARY)..."
	$(BUILD_DIR)/$(BINARY)

## tidy: tidy and verify go modules
tidy:
	@echo "==> Tidying modules..."
	go mod tidy
	go mod verify

## clean: remove build artefacts and coverage files
clean:
	@echo "==> Cleaning..."
	@rm -rf $(BUILD_DIR) $(COVERAGE)

## help: print this help message
help:
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@grep -E '^## ' Makefile | sed 's/## /  /'
	@echo ""