.PHONY: build test test-integration lint vet fmt docker-up docker-down

# ── Go build ────────────────────────────────────────────────────────────────
build:
	go build ./...

# ── Unit tests ──────────────────────────────────────────────────────────────
test:
	go test -race -count=1 ./...

# ── Integration tests (requires Docker) ─────────────────────────────────────
test-integration: docker-up
	@echo "Waiting for services to be healthy..."
	@sleep 5
	POSTGRES_DSN="postgres://postgres:postgres@localhost:5432/testdb?sslmode=disable" \
	S3_ENDPOINT="http://localhost:4566" \
	S3_BUCKET="test-bucket" \
	AWS_ACCESS_KEY="test" \
	AWS_SECRET_KEY="test" \
	AWS_REGION="us-east-1" \
	go test -v -race -count=1 -tags integration ./internal/backup/... ; \
	STATUS=$$? ; \
	$(MAKE) docker-down ; \
	exit $$STATUS

# ── Docker Compose helpers ───────────────────────────────────────────────────
docker-up:
	docker compose -f docker-compose.test.yml up -d --wait

docker-down:
	docker compose -f docker-compose.test.yml down --volumes --remove-orphans

# ── Code quality ─────────────────────────────────────────────────────────────
lint:
	golangci-lint run ./...

vet:
	go vet ./...

fmt:
	gofmt -w .