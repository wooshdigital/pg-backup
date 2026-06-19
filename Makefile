# ============================================================================
# pg-s3-backup — Makefile
# ============================================================================

BINARY   := pg-s3-backup
CMD_DIR  := ./cmd/worker
BUILD_DIR := ./bin

GO        := go
GOLINT    := golangci-lint

.PHONY: all build test lint run clean tidy help

all: build

## build: compile the worker binary into ./bin/
build:
	@mkdir -p $(BUILD_DIR)
	$(GO) build -o $(BUILD_DIR)/$(BINARY) $(CMD_DIR)
	@echo "✓ built $(BUILD_DIR)/$(BINARY)"

## test: run all unit tests with race detector
test:
	$(GO) test -race -cover ./...

## lint: run golangci-lint (install from https://golangci-lint.run)
lint:
	$(GOLINT) run ./...

## run: load .env (if present) and execute the binary
run: build
	@if [ -f .env ]; then \
		echo "Loading .env…"; \
		export $$(grep -v '^#' .env | xargs); \
	fi; \
	$(BUILD_DIR)/$(BINARY)

## tidy: tidy and verify go modules
tidy:
	$(GO) mod tidy
	$(GO) mod verify

## clean: remove compiled artefacts
clean:
	rm -rf $(BUILD_DIR)

## help: print this help message
help:
	@grep -E '^##' Makefile | sed 's/## //'