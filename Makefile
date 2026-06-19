# ── Variables ─────────────────────────────────────────────────────────────────
MODULE        := github.com/org/pg-s3-backup
BINARY        := pg-s3-backup
CMD_DIR       := ./cmd/worker
OUTPUT_DIR    := bin
COVERAGE_FILE := coverage.out

GO            := go
GOFLAGS       ?=
LDFLAGS       := -s -w

# Use golangci-lint if available; install instructions:
#   https://golangci-lint.run/usage/install/
LINTER        := golangci-lint

.PHONY: all build test lint run clean tidy help

## all: build the binary (default target)
all: build

## build: compile the worker binary into ./bin/
build:
	@mkdir -p $(OUTPUT_DIR)
	$(GO) build $(GOFLAGS) -ldflags "$(LDFLAGS)" -o $(OUTPUT_DIR)/$(BINARY) $(CMD_DIR)
	@echo "✓ Built $(OUTPUT_DIR)/$(BINARY)"

## test: run all unit tests with race detector and coverage
test:
	$(GO) test -race -coverprofile=$(COVERAGE_FILE) -covermode=atomic ./...
	$(GO) tool cover -func=$(COVERAGE_FILE)

## lint: run golangci-lint (install separately)
lint:
	$(LINTER) run ./...

## run: build and immediately execute the binary (reads .env if present)
run: build
	@if [ -f .env ]; then \
		echo "⟳ Loading .env"; \
		export $$(grep -v '^#' .env | xargs); \
	fi; \
	$(OUTPUT_DIR)/$(BINARY)

## tidy: tidy and verify go.mod / go.sum
tidy:
	$(GO) mod tidy
	$(GO) mod verify

## clean: remove build artefacts and coverage reports
clean:
	@rm -rf $(OUTPUT_DIR) $(COVERAGE_FILE)
	@echo "✓ Cleaned"

## help: print this help message
help:
	@grep -E '^## ' $(MAKEFILE_LIST) | sed 's/^## //'