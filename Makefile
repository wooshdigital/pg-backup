.PHONY: build test lint clean integration-test

# Go binary output directory
BIN_DIR := ./bin

build:
	@mkdir -p $(BIN_DIR)
	go build -o $(BIN_DIR)/worker ./cmd/worker/...

test:
	go test ./... -race -timeout 60s

lint:
	@which golangci-lint > /dev/null 2>&1 || (echo "golangci-lint not found; install from https://golangci-lint.run" && exit 1)
	golangci-lint run ./...

# Integration tests require Docker and INTEGRATION_TESTS=1
integration-test:
	INTEGRATION_TESTS=1 go test -tags integration ./... -race -timeout 120s -v

clean:
	rm -rf $(BIN_DIR)