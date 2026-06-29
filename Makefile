.PHONY: build test test-unit test-integration lint clean

# Build the worker binary.
build:
	go build -o bin/worker ./cmd/worker

# Run all unit tests (no integration tag).
test: test-unit

test-unit:
	go test -v -race ./...

# Run integration tests using Docker Compose.
test-integration:
	docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit --exit-code-from test-runner

# Lint using golangci-lint.
lint:
	golangci-lint run ./...

clean:
	rm -rf bin/
	docker-compose -f docker-compose.test.yml down -v