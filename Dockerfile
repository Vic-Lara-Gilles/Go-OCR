# Build stage
FROM golang:1.21-alpine AS builder

# Install build dependencies including Tesseract for CGO compilation
RUN apk add --no-cache \
    gcc \
    musl-dev \
    tesseract-ocr-dev \
    leptonica-dev \
    poppler-utils \
    g++

WORKDIR /app

# Copy go mod file and download dependencies
COPY go.mod ./
RUN go mod download

# Copy source code
COPY . .

# Generate go.sum and tidy modules
RUN go mod tidy

# Build binary with CGO enabled (required for gosseract)
RUN CGO_ENABLED=1 GOOS=linux go build -o /app/server ./cmd/server

# Runtime stage
FROM alpine:3.19

# Install Tesseract OCR, Spanish language data, and PDF tools
RUN apk add --no-cache \
    tesseract-ocr \
    tesseract-ocr-data-spa \
    leptonica \
    poppler-utils \
    ca-certificates \
    tzdata

# Create non-root user
RUN addgroup -g 1000 appgroup && \
    adduser -u 1000 -G appgroup -h /app -D appuser

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/server .

# Create directories for uploads and outputs
RUN mkdir -p uploads outputs && \
    chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Environment variables
ENV PORT=8080 \
    TESSERACT_LANG=spa \
    GIN_MODE=release

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Run the server
CMD ["./server"]

