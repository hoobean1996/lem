# Build admin UI stage
FROM node:20-alpine AS admin-builder

WORKDIR /app/admin-ui

# Copy admin UI source
COPY admin-ui/package*.json ./
RUN npm ci

COPY admin-ui/ ./
RUN npm run build

# Build Go stage
FROM golang:1.24-alpine AS builder

RUN apk add --no-cache git

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the binary with optimizations
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/server ./cmd/server

# Run stage
FROM alpine:3.19

RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/server .

# Copy admin UI dist from admin-builder
COPY --from=admin-builder /app/admin-ui/dist ./admin-ui/dist/

# Expose port (Cloud Run uses PORT env var, default 8080)
EXPOSE 8080

# Run with prod environment
CMD ["./server", "-env", "prod"]
