# Build frontend stage (using npm workspaces)
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy workspace config and all package files
COPY package.json ./
COPY products/admin/package*.json ./products/admin/
COPY products/shenbi/package*.json ./products/shenbi/
COPY products/shenbi/packages/lemonade-sdk/package*.json ./products/shenbi/packages/lemonade-sdk/

# Install all dependencies
RUN npm install

# Copy source files
COPY products/ ./products/

# Build SDK first, then both frontends
RUN npm run build -w products/shenbi/packages/lemonade-sdk && npm run build

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

# Copy frontend dists
COPY --from=frontend-builder /app/products/admin/dist ./products/admin/dist/
COPY --from=frontend-builder /app/products/shenbi/dist ./products/shenbi/dist/

# Expose port (Cloud Run uses PORT env var, default 8080)
EXPOSE 8080

# Run with prod environment
CMD ["./server", "-env", "prod"]
