# ── pg-s3-backup Makefile ─────────────────────────────────────────────────────
BINARY_NAME  := pg-s3-backup
BUILD_DIR    := bin
CMD_PATH     := ./cmd/worker
COVERAGE_OUT := coverage.out

# Go toolchain
GO      := go
GOFLAGS := -trimpath

.PHONY: all build test lint run clean tidy help

all: build ## Default: build the binary

## build: Compile the worker binary into ./bin/
build:
	@echo "› Building $(BINARY_NAME)…"
	@mkdir -p $(BUILD_DIR)
	$(GO) build $(GOFLAGS) -o $(BUILD_DIR)/$(BINARY_NAME) $(CMD_PATH)
	@echo "  ✓ Binary: $(BUILD_DIR)/$(BINARY_NAME)"

## test: Run all unit tests with race detector and produce coverage report
test:
	@echo "› Running tests…"
	$(GO) test -race -coverprofile=$(COVERAGE_OUT) -covermode=atomic ./...
	$(GO) tool cover -func=$(COVERAGE_OUT) | tail -1

## lint: Run golangci-lint (install separately: https://golangci-lint.run)
lint:
	@echo "› Linting…"
	golangci-lint run ./...

## run: Build and execute the binary (requires env vars or config.yaml)
run: build
	@echo "› Running $(BINARY_NAME)…"
	./$(BUILD_DIR)/$(BINARY_NAME)

## tidy: Tidy and verify the Go module
tidy:
	@echo "› Tidying module…"
	$(GO) mod tidy
	$(GO) mod verify

## clean: Remove build artefacts
clean:
	@echo "› Cleaning…"
	@rm -rf $(BUILD_DIR) $(COVERAGE_OUT)

## help: Print this help message
help:
	@grep -E '^##' Makefile | sed 's/## //' | column -t -s ':'