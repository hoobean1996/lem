.PHONY: all build run test clean dev generate migrate docker-up docker-down admin-build admin-dev deploy docker-build docker-push

# Build the application
build: admin-build
	go build -o bin/server ./cmd/server

# Build Go only (without admin-ui)
build-go:
	go build -o bin/server ./cmd/server

# Run the application
run: build
	./bin/server

# Run in development mode with hot reload (requires air)
dev:
	air

# Run tests
test:
	go test -v ./...

# Clean build artifacts
clean:
	rm -rf bin/

# Generate Ent code
generate:
	go run -mod=mod entgo.io/ent/cmd/ent generate ./internal/ent/schema --target ./internal/ent

# Run database migrations
migrate:
	go run ./cmd/server migrate

# Start Docker services
docker-up:
	docker-compose up -d

# Stop Docker services
docker-down:
	docker-compose down

# Start local PostgreSQL (standalone, no docker-compose needed)
db:
	docker run -d --name lem-postgres \
		-e POSTGRES_USER=lem \
		-e POSTGRES_PASSWORD=lem \
		-e POSTGRES_DB=lem \
		-p 5432:5432 \
		postgres:16-alpine || docker start lem-postgres

# Stop local PostgreSQL
db-stop:
	docker stop lem-postgres

# Remove local PostgreSQL
db-rm:
	docker rm -f lem-postgres

# Start only PostgreSQL via docker-compose
postgres-up:
	docker-compose up -d postgres

# View logs
logs:
	docker-compose logs -f

# Install dependencies
deps:
	go mod download
	go mod tidy

# Format code
fmt:
	go fmt ./...

# Lint code (requires golangci-lint)
lint:
	golangci-lint run

# All pre-commit checks
check: fmt lint test

# Build admin UI
admin-build:
	cd admin-ui && npm install && npm run build

# Run admin UI dev server
admin-dev:
	cd admin-ui && npm run dev

# Deploy to Google Cloud Run
deploy:
	./deploy.sh

# Build and push Docker image only (no deploy)
docker-build:
	docker build -t lem-api:latest .

# Push to GCR
docker-push:
	gcloud builds submit --tag gcr.io/gen-lang-client-0818638363/lem-api
