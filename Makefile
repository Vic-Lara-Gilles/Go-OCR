.PHONY: help build run test clean docker-build docker-up docker-down docker-logs docker-restart docker-rebuild docker-stop fmt lint mod frontend-install frontend-dev frontend-build dev-local dev-prod

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

# Frontend parameters
FRONTEND_DIR := frontend
BUN := bun

# Docker parameters
DOCKER_IMAGE := ocr-go
DOCKER_TAG := latest

help: ## Show this help message
	@echo "OCR-Go - Makefile Commands"
	@echo ""
	@echo "Development Modes:"
	@echo "  \033[32mmake dev-local\033[0m   - Backend in Docker, Frontend local (recommended for development)"
	@echo "  \033[32mmake dev-prod\033[0m    - Full stack in Docker (production-like environment)"
	@echo ""
	@echo "Commands:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

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

docker-build: ## Build all Docker images (production)
	@echo "Building Docker images for production..."
	docker compose build
	@echo "✅ Docker images built"

docker-build-dev: ## Build backend Docker image only (development)
	@echo "Building backend Docker image..."
	docker compose -f docker-compose.dev.yml build
	@echo "✅ Backend image built"

docker-up: ## Start all containers (production mode)
	@echo "Starting production containers..."
	docker compose up -d
	@echo ""
	@echo "✅ Production stack started!"
	@echo "   Frontend: http://localhost:3000"
	@echo "   Backend:  http://localhost:8080"
	@echo ""
	@echo "View logs: make docker-logs"

docker-up-dev: ## Start backend container only (development mode)
	@echo "Starting backend container..."
	docker compose -f docker-compose.dev.yml up -d
	@echo ""
	@echo "✅ Backend started at http://localhost:8080"
	@echo ""
	@echo "Start frontend with: make frontend-dev"

docker-down: ## Stop all containers
	@echo "Stopping all containers..."
	-docker compose down
	-docker compose -f docker-compose.dev.yml down
	@echo "✅ All containers stopped"

docker-logs: ## View container logs (production)
	docker compose logs -f

docker-logs-dev: ## View backend logs (development)
	docker compose -f docker-compose.dev.yml logs -f

docker-restart: ## Restart all containers (production)
	@echo "Restarting production containers..."
	docker compose restart

docker-restart-dev: ## Restart backend container (development)
	@echo "Restarting backend container..."
	docker compose -f docker-compose.dev.yml restart

docker-rebuild: ## Rebuild and restart (production)
	@echo "Rebuilding production stack..."
	docker compose down
	docker compose build --no-cache
	docker compose up -d
	@echo "✅ Production stack rebuilt"

docker-rebuild-dev: ## Rebuild and restart backend (development)
	@echo "Rebuilding backend..."
	docker compose -f docker-compose.dev.yml down
	docker compose -f docker-compose.dev.yml build --no-cache
	docker compose -f docker-compose.dev.yml up -d
	@echo "✅ Backend rebuilt"

docker-stop: ## Alias for docker-down
	$(MAKE) docker-down

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

# Development modes
dev-local: ## [RECOMMENDED] Backend in Docker + Frontend local (hot reload)
	@echo "🚀 Starting LOCAL development mode..."
	@echo ""
	@echo "Starting backend in Docker..."
	@$(MAKE) docker-up-dev
	@echo ""
	@echo "Installing frontend dependencies..."
	@cd $(FRONTEND_DIR) && $(BUN) install
	@echo ""
	@echo "Starting frontend dev server..."
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "✅ Development environment ready!"
	@echo ""
	@echo "   Backend:  http://localhost:8080 (Docker)"
	@echo "   Frontend: http://localhost:3000 (Bun + Vite)"
	@echo ""
	@echo "   Frontend will start now with hot-reload..."
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@cd $(FRONTEND_DIR) && $(BUN) run dev

dev-prod: ## Full stack in Docker (production-like)
	@echo "🚀 Starting PRODUCTION mode..."
	@echo ""
	@$(MAKE) docker-build
	@$(MAKE) docker-up
	@echo ""
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "✅ Production environment ready!"
	@echo ""
	@echo "   Frontend: http://localhost:3000 (Nginx)"
	@echo "   Backend:  http://localhost:8080 (Go)"
	@echo ""
	@echo "   View logs: make docker-logs"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

dev: ## Alias for dev-local
	@$(MAKE) dev-local

# Frontend commands
frontend-install: ## Install frontend dependencies
	@echo "Installing frontend dependencies..."
	cd $(FRONTEND_DIR) && $(BUN) install
	@echo "Frontend dependencies installed"

frontend-dev: ## Run frontend development server
	@echo "Starting frontend dev server..."
	cd $(FRONTEND_DIR) && $(BUN) run dev

frontend-build: ## Build frontend for production
	@echo "Building frontend..."
	cd $(FRONTEND_DIR) && $(BUN) run build
	@echo "Frontend build complete"

frontend-lint: ## Lint frontend code
	@echo "Linting frontend..."
	cd $(FRONTEND_DIR) && $(BUN) run lint
	@echo "   Frontend: http://localhost:3000"
	@echo "   Backend:  http://localhost:8080"
	@echo ""
	@echo "View logs with: make docker-logs"
