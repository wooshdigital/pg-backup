.PHONY: build test test-integration lint vet fmt tidy clean

BINARY_NAME := pgbackup
CMD_DIR     := ./cmd/worker

build:
	go build -o bin/$(BINARY_NAME) $(CMD_DIR)

test:
	go test -v -race -count=1 ./...

test-integration:
	go test -v -race -count=1 -tags=integration -timeout 10m ./...

lint:
	golangci-lint run ./...

vet:
	go vet ./...

fmt:
	gofmt -w .

tidy:
	go mod tidy

clean:
	rm -rf bin/