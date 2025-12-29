.PHONY: help build run test clean docker-build docker-run docker-stop fmt lint mod

# Default target
.DEFAULT_GOAL := help

# Binary name
BINARY_NAME := ocr-server
BUILD_DIR := bin

# Go parameters
GOCMD := go
GOBUILD := $(GOCMD) build
GOCLEAN := $(GOCMD) clean
GOTEST := $(GOCMD) test
GOGET := $(GOCMD) get
GOMOD := $(GOCMD) mod
GOFMT := gofmt

# Docker parameters
DOCKER_IMAGE := ocr-go
DOCKER_TAG := latest

help: ## Show this help message
	@echo "OCR-Go - Makefile Commands"
	@echo ""
	@echo "Usage:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build the application binary
	@echo "Building..."
	@mkdir -p $(BUILD_DIR)
	$(GOBUILD) -o $(BUILD_DIR)/$(BINARY_NAME) ./cmd/server
	@echo "Build complete: $(BUILD_DIR)/$(BINARY_NAME)"

run: build ## Build and run the application
	@echo "Running..."
	./$(BUILD_DIR)/$(BINARY_NAME)

test: ## Run tests
	@echo "Running tests..."
	$(GOTEST) -v -race ./...

clean: ## Clean build artifacts
	@echo "Cleaning..."
	$(GOCLEAN)
	rm -rf $(BUILD_DIR)
	@echo "Clean complete"

docker-build: ## Build Docker image
	@echo "Building Docker image..."
	docker build -t $(DOCKER_IMAGE):$(DOCKER_TAG) .
	@echo "Docker image built: $(DOCKER_IMAGE):$(DOCKER_TAG)"

docker-run: ## Run Docker container
	@echo "Running Docker container..."
	docker run -d \
		--name $(DOCKER_IMAGE) \
		-p 8080:8080 \
		-v $(PWD)/outputs:/app/outputs \
		-v $(PWD)/uploads:/app/uploads \
		$(DOCKER_IMAGE):$(DOCKER_TAG)
	@echo "Container started: $(DOCKER_IMAGE)"

docker-stop: ## Stop and remove Docker container
	@echo "Stopping Docker container..."
	-docker stop $(DOCKER_IMAGE)
	-docker rm $(DOCKER_IMAGE)
	@echo "Container stopped and removed"

fmt: ## Format Go code
	@echo "Formatting code..."
	$(GOFMT) -s -w .
	@echo "Formatting complete"

lint: ## Run linter (requires golangci-lint)
	@echo "Running linter..."
	@if command -v golangci-lint > /dev/null; then \
		golangci-lint run ./...; \
	else \
		echo "golangci-lint not installed. Install with: go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest"; \
	fi

mod: ## Tidy and verify Go modules
	@echo "Tidying modules..."
	$(GOMOD) tidy
	$(GOMOD) verify
	@echo "Modules tidied"

dev: ## Run with hot reload (requires air)
	@if command -v air > /dev/null; then \
		air; \
	else \
		echo "air not installed. Install with: go install github.com/cosmtrek/air@latest"; \
		echo "Running without hot reload..."; \
		$(MAKE) run; \
	fi
