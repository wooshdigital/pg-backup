# ---------------------------------------------------------------------------
# pg-s3-backup — Makefile
# ---------------------------------------------------------------------------
BINARY      := pg-s3-backup
CMD_DIR     := ./cmd/worker
BIN_DIR     := bin
COVERAGE    := coverage.out

GO          := go
GOFLAGS     ?=

.PHONY: all build test lint run clean tidy help

all: build

## build: Compile the worker binary into bin/
build:
	@mkdir -p $(BIN_DIR)
	$(GO) build $(GOFLAGS) -o $(BIN_DIR)/$(BINARY) $(CMD_DIR)
	@echo "Built $(BIN_DIR)/$(BINARY)"

## test: Run all unit tests with race detector and generate coverage report
test:
	$(GO) test -race -coverprofile=$(COVERAGE) -covermode=atomic ./...
	$(GO) tool cover -func=$(COVERAGE)

## lint: Run staticcheck (install with: go install honnef.co/go/tools/cmd/staticcheck@latest)
lint:
	@command -v staticcheck >/dev/null 2>&1 || { \
		echo "staticcheck not found — install with:"; \
		echo "  go install honnef.co/go/tools/cmd/staticcheck@latest"; \
		exit 1; \
	}
	staticcheck ./...

## run: Build and execute the binary (reads .env if present via env file trick)
run: build
	@if [ -f .env ]; then \
		echo "Loading .env"; \
		export $$(grep -v '^#' .env | xargs) && $(BIN_DIR)/$(BINARY); \
	else \
		$(BIN_DIR)/$(BINARY); \
	fi

## tidy: Tidy and verify go.mod / go.sum
tidy:
	$(GO) mod tidy
	$(GO) mod verify

## clean: Remove compiled binaries and coverage artefacts
clean:
	rm -rf $(BIN_DIR) $(COVERAGE) coverage.html

## help: Show this help message
help:
	@grep -E '^## ' $(MAKEFILE_LIST) | sed 's/## //' | column -t -s ':'