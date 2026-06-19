# ── Variables ─────────────────────────────────────────────────────────────────
MODULE      := github.com/org/pg-s3-backup
BINARY      := pg-s3-backup
CMD_DIR     := ./cmd/worker
BUILD_DIR   := ./bin
COVERAGE    := coverage.out

GO          := go
GOFLAGS     :=

# Detect golangci-lint
LINT        := $(shell command -v golangci-lint 2>/dev/null)

.PHONY: all build test lint run clean tidy help

# ── Default target ─────────────────────────────────────────────────────────────
all: build

# ── Build ─────────────────────────────────────────────────────────────────────
## build: Compile the worker binary into ./bin/
build:
	@echo "→ Building $(BINARY)..."
	@mkdir -p $(BUILD_DIR)
	$(GO) build $(GOFLAGS) -o $(BUILD_DIR)/$(BINARY) $(CMD_DIR)
	@echo "✓ Binary written to $(BUILD_DIR)/$(BINARY)"

# ── Test ──────────────────────────────────────────────────────────────────────
## test: Run all unit tests with race detector and coverage report
test:
	@echo "→ Running tests..."
	$(GO) test -race -coverprofile=$(COVERAGE) -covermode=atomic ./...
	$(GO) tool cover -func=$(COVERAGE) | tail -1

## test-v: Run tests with verbose output
test-v:
	$(GO) test -v -race -coverprofile=$(COVERAGE) -covermode=atomic ./...

# ── Lint ──────────────────────────────────────────────────────────────────────
## lint: Run golangci-lint (install it if missing)
lint:
ifdef LINT
	@echo "→ Running golangci-lint..."
	golangci-lint run ./...
else
	@echo "golangci-lint not found — running go vet instead"
	$(GO) vet ./...
endif

# ── Run ───────────────────────────────────────────────────────────────────────
## run: Build and run the worker (reads .env if present via env file support)
run: build
	@echo "→ Running $(BINARY)..."
	@if [ -f .env ]; then \
		echo "  (loading .env)"; \
		set -a && . ./.env && set +a && $(BUILD_DIR)/$(BINARY); \
	else \
		$(BUILD_DIR)/$(BINARY); \
	fi

# ── Tidy ──────────────────────────────────────────────────────────────────────
## tidy: Tidy and verify Go module dependencies
tidy:
	$(GO) mod tidy
	$(GO) mod verify

# ── Clean ─────────────────────────────────────────────────────────────────────
## clean: Remove build artifacts and coverage files
clean:
	@echo "→ Cleaning..."
	@rm -rf $(BUILD_DIR) $(COVERAGE)
	@echo "✓ Done"

# ── Help ──────────────────────────────────────────────────────────────────────
## help: Display this help message
help:
	@echo "Available targets:"
	@grep -E '^## ' $(MAKEFILE_LIST) | sed 's/## /  /'