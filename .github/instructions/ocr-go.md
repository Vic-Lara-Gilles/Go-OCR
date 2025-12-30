---
applyTo: '**'
---

# OCR System with Docker + Go + Tesseract + React

## Project Overview

High-performance OCR system for document recognition with concurrent processing capabilities and modern React frontend.

**Tech Stack:**
- **Backend:** Go 1.21+ (high-performance API server)
- **Frontend:** React 18+ with TypeScript
- **State Management:** TanStack Query v5 (server state management)
- **Runtime:** Bun (ultra-fast package manager and runtime)
- **OCR Engine:** Tesseract-OCR (via gosseract)
- **Router:** Chi Router (lightweight HTTP router)
- **Deployment:** Docker (containerized deployment)

**Key Requirement:** Everything must be containerized - no local installation required.

## Project Structure

```
Go-OCR/
├── frontend/                      # React + TanStack Query + Bun
│   ├── src/
│   │   ├── components/
│   │   │   ├── UploadForm.tsx    # File upload component
│   │   │   ├── ResultDisplay.tsx # OCR results display
│   │   │   └── DownloadButtons.tsx # Download options
│   │   ├── hooks/
│   │   │   └── useOCRMutation.ts # TanStack Query mutation hook
│   │   ├── api/
│   │   │   └── client.ts         # API fetch functions
│   │   ├── types/
│   │   │   └── ocr.ts            # TypeScript type definitions
│   │   ├── App.tsx               # Main application component
│   │   └── main.tsx              # Application entry point
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   ├── bun.lockb                  # Bun lock file
│   ├── tsconfig.json
│   └── vite.config.ts             # Vite configuration
│
├── backend/                       # Go API Server
│   ├── cmd/
│   │   └── server/
│   │       └── main.go           # Application entry point
│   ├── internal/
│   │   ├── handler/
│   │   │   ├── handler.go        # HTTP handlers
│   │   │   ├── extract.go        # Text extraction handler
│   │   │   ├── visualize.go      # Box visualization handler
│   │   │   └── batch.go          # Batch processing handler
│   │   ├── ocr/
│   │   │   ├── engine.go         # OCR engine interface
│   │   │   ├── tesseract.go      # Tesseract implementation
│   │   │   └── processor.go      # Document processor
│   │   ├── model/
│   │   │   └── result.go         # Data models
│   │   └── middleware/
│   │       ├── logger.go         # HTTP middleware
│   │       └── cors.go           # CORS configuration
│   ├── outputs/                  # Auto-created for results
│   ├── uploads/                  # Temporary uploads
│   ├── go.mod
│   └── go.sum
│
├── docker-compose.yml             # Multi-service orchestration
├── Dockerfile.backend             # Backend container
├── Dockerfile.frontend            # Frontend container
├── Makefile
└── README.md
```

## Architecture Overview

### Backend (Go API Server)
- **Port:** 8080
- **Purpose:** RESTful API for OCR operations
- **Endpoints:**
  - `POST /api/extract` - Extract text from image/PDF
  - `POST /api/visualize` - Generate annotated images with bounding boxes
  - `POST /api/batch` - Process multiple files concurrently
  - `GET /api/results` - List processed results
  - `GET /health` - Health check endpoint

### Frontend (React SPA)
- **Port:** 3000 (development), served by backend in production
- **Purpose:** User interface for file upload and result visualization
- **Features:**
  - Drag-and-drop file upload
  - Real-time processing status with TanStack Query
  - Result preview with download options
  - Batch processing with progress tracking
  - Error handling and retry logic

### Communication Flow
```
User → React Frontend → Fetch/TanStack Query → Go Backend API → Tesseract OCR
                                                       ↓
                                                   File Storage
                                                   (uploads/, outputs/)
```

## File Specifications

### Frontend Files

#### frontend/package.json

```json
{
  "name": "ocr-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@tanstack/react-query": "^5.17.0",
    "@tanstack/react-query-devtools": "^5.17.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.8",
    "eslint": "^8.55.0",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0"
  }
}
```

#### frontend/tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

#### frontend/vite.config.ts

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
```

#### frontend/src/types/ocr.ts

```typescript
export interface OCRResult {
  filename: string
  full_text: string
  boxes: TextBox[]
  total_lines: number
  processed_at: string
}

export interface TextBox {
  text: string
  confidence: number
  bbox: BoundingBox
}

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

export interface BatchResult {
  filename: string
  lines: number
  success: boolean
  error?: string
  preview: string
  output_file: string
}

export interface BatchResponse {
  total_files: number
  success_count: number
  failure_count: number
  results: BatchResult[]
  processing_time: string
}

export interface APIError {
  error: string
}
```

#### frontend/src/api/client.ts

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export async function extractText(file: File): Promise<OCRResult> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE_URL}/api/extract`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error: APIError = await response.json()
    throw new Error(error.error || 'Failed to extract text')
  }

  return response.json()
}

export async function visualizeBoxes(file: File): Promise<{
  filename: string
  output_file: string
  total_boxes: number
  download_url: string
}> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE_URL}/api/visualize`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error: APIError = await response.json()
    throw new Error(error.error || 'Failed to visualize boxes')
  }

  return response.json()
}

export async function batchProcess(files: File[]): Promise<BatchResponse> {
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))

  const response = await fetch(`${API_BASE_URL}/api/batch`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error: APIError = await response.json()
    throw new Error(error.error || 'Failed to process batch')
  }

  return response.json()
}
```

#### frontend/src/hooks/useOCRMutation.ts

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { extractText, visualizeBoxes, batchProcess } from '../api/client'
import type { OCRResult, BatchResponse } from '../types/ocr'

export function useExtractText() {
  return useMutation<OCRResult, Error, File>({
    mutationFn: extractText,
    onSuccess: (data) => {
      console.log('Text extracted successfully:', data.filename)
    },
    onError: (error) => {
      console.error('Extraction failed:', error.message)
    },
  })
}

export function useVisualizeBoxes() {
  return useMutation({
    mutationFn: visualizeBoxes,
    onSuccess: (data) => {
      console.log('Boxes visualized:', data.total_boxes)
    },
  })
}

export function useBatchProcess() {
  return useMutation<BatchResponse, Error, File[]>({
    mutationFn: batchProcess,
    onSuccess: (data) => {
      console.log('Batch processed:', data.success_count, '/', data.total_files)
    },
  })
}
```

#### frontend/src/components/UploadForm.tsx

```typescript
import { useState } from 'react'
import { useExtractText } from '../hooks/useOCRMutation'
import ResultDisplay from './ResultDisplay'

export default function UploadForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const mutation = useExtractText()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (selectedFile) {
      mutation.mutate(selectedFile)
    }
  }

  return (
    <div className="upload-section">
      <h2>Extract Text from Image</h2>
      <form onSubmit={handleSubmit}>
        <div className="file-input-wrapper">
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*,.pdf"
            required
          />
          {selectedFile && <p>Selected: {selectedFile.name}</p>}
        </div>
        <button type="submit" disabled={!selectedFile || mutation.isPending}>
          {mutation.isPending ? 'Processing...' : 'Extract Text'}
        </button>
      </form>

      {mutation.isError && (
        <div className="error">
          <p>Error: {mutation.error.message}</p>
          <button onClick={() => mutation.reset()}>Try Again</button>
        </div>
      )}

      {mutation.isSuccess && <ResultDisplay result={mutation.data} />}
    </div>
  )
}
```

#### frontend/src/components/ResultDisplay.tsx

```typescript
import type { OCRResult } from '../types/ocr'
import DownloadButtons from './DownloadButtons'

interface Props {
  result: OCRResult
}

export default function ResultDisplay({ result }: Props) {
  return (
    <div className="result-container">
      <h3>Results</h3>
      <div className="result-meta">
        <p><strong>File:</strong> {result.filename}</p>
        <p><strong>Lines Detected:</strong> {result.total_lines}</p>
        <p><strong>Processed:</strong> {new Date(result.processed_at).toLocaleString()}</p>
      </div>

      <div className="text-result">
        <h4>Extracted Text:</h4>
        <pre>{result.full_text}</pre>
      </div>

      <DownloadButtons result={result} />

      {result.boxes.length > 0 && (
        <details className="boxes-detail">
          <summary>View Bounding Boxes ({result.boxes.length})</summary>
          <div className="boxes-list">
            {result.boxes.map((box, idx) => (
              <div key={idx} className="box-item">
                <span className="box-text">{box.text}</span>
                <span className="box-confidence">
                  {(box.confidence * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
```

#### frontend/src/components/DownloadButtons.tsx

```typescript
import type { OCRResult } from '../types/ocr'

interface Props {
  result: OCRResult
}

export default function DownloadButtons({ result }: Props) {
  const downloadAsText = () => {
    const blob = new Blob([result.full_text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${result.filename}_extracted.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadAsJSON = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${result.filename}_result.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadAsMarkdown = () => {
    const markdown = `# OCR Result: ${result.filename}\n\n${result.full_text}`
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${result.filename}_extracted.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="download-buttons">
      <button onClick={downloadAsText} className="btn-download">
        Download TXT
      </button>
      <button onClick={downloadAsMarkdown} className="btn-download">
        Download Markdown
      </button>
      <button onClick={downloadAsJSON} className="btn-download">
        Download JSON
      </button>
    </div>
  )
}
```

#### frontend/src/App.tsx

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import UploadForm from './components/UploadForm'
import './App.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="app">
        <header>
          <h1>OCR System - Go + Tesseract</h1>
          <p>Extract text from images and PDFs</p>
        </header>

        <main>
          <UploadForm />
        </main>

        <footer>
          <p>Powered by Go + Tesseract + React + TanStack Query</p>
        </footer>
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
```

#### frontend/src/main.tsx

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

#### frontend/src/App.css

```css
:root {
  --primary: #3b82f6;
  --success: #10b981;
  --error: #ef4444;
  --bg: #f9fafb;
  --border: #e5e7eb;
  --text: #1f2937;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: var(--text);
  background-color: var(--bg);
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  background: var(--primary);
  color: white;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

main {
  flex: 1;
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
  width: 100%;
}

.upload-section {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.file-input-wrapper {
  border: 2px dashed var(--border);
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  transition: border-color 0.2s;
}

.file-input-wrapper:hover {
  border-color: var(--primary);
}

button {
  background: var(--primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: opacity 0.2s;
}

button:hover:not(:disabled) {
  opacity: 0.9;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error {
  background: rgba(239, 68, 68, 0.1);
  color: var(--error);
  padding: 1rem;
  border-radius: 4px;
  border-left: 4px solid var(--error);
  margin-top: 1rem;
}

.result-container {
  margin-top: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--border);
}

.result-meta {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.text-result pre {
  background: var(--bg);
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.download-buttons {
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0;
  flex-wrap: wrap;
}

.btn-download {
  background: var(--success);
}

.boxes-detail {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--bg);
  border-radius: 4px;
}

.boxes-list {
  display: grid;
  gap: 0.5rem;
  margin-top: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
}

.box-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
  border: 1px solid var(--border);
}

.box-confidence {
  color: var(--success);
  font-weight: 600;
}

footer {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  background: white;
  border-top: 1px solid var(--border);
}
```

### Backend Files

#### Dockerfile.backend

```dockerfile
# Multi-stage build for optimal image size
FROM golang:1.21-alpine AS builder

# Install build dependencies
RUN apk add --no-cache gcc musl-dev tesseract-ocr-dev leptonica-dev

WORKDIR /build

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build binary with optimizations
RUN CGO_ENABLED=1 GOOS=linux go build -ldflags="-s -w" -o ocr-server ./cmd/server

# Runtime stage
FROM alpine:3.19

# Install runtime dependencies
RUN apk add --no-cache \
    tesseract-ocr \
    tesseract-ocr-data-spa \
    leptonica \
    ca-certificates

WORKDIR /app

# Copy binary
COPY --from=builder /build/ocr-server .

# Create directories
RUN mkdir -p outputs uploads

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Run as non-root user
RUN adduser -D -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

CMD ["./ocr-server"]
```

#### Dockerfile.frontend

```dockerfile
# Build stage with Bun
FROM oven/bun:1 AS builder

WORKDIR /build

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build for production
RUN bun run build

# Production stage with nginx
FROM nginx:alpine

# Copy built assets
COPY --from=builder /build/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### frontend/nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # SPA routing - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api {
        proxy_pass http://backend:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: ../Dockerfile.backend
    container_name: ocr-backend
    ports:
      - "8080:8080"
    volumes:
      - ./backend/outputs:/app/outputs
      - ./backend/uploads:/app/uploads
    environment:
      - APP_ENV=production
      - PORT=8080
      - LOG_LEVEL=info
      - MAX_UPLOAD_SIZE=10485760  # 10MB
      - TESSERACT_LANG=spa
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://localhost:8080/health"]
      interval: 30s
      timeout: 3s
      retries: 3
    networks:
      - ocr-network

  frontend:
    build:
      context: ./frontend
      dockerfile: ../Dockerfile.frontend
    container_name: ocr-frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - ocr-network

networks:
  ocr-network:
    driver: bridge
```

### backend/go.mod

```go
module github.com/username/ocr-go

go 1.21

require (
    github.com/go-chi/chi/v5 v5.0.11
    github.com/go-chi/cors v1.2.1
    github.com/otiai10/gosseract/v2 v2.4.1
    github.com/gofrs/uuid v4.4.0+incompatible
    github.com/disintegration/imaging v1.6.2
    github.com/pdfcpu/pdfcpu v0.6.0
)
```

### cmd/server/main.go

```go
package main

import (
    "context"
    "fmt"
    "log"
    "net/http"
    "os"
    "os/signal"
    "syscall"
    "time"

    "github.com/username/ocr-go/internal/handler"
    "github.com/username/ocr-go/internal/middleware"
    "github.com/username/ocr-go/internal/ocr"
    "github.com/go-chi/chi/v5"
    chimiddleware "github.com/go-chi/chi/v5/middleware"
    "github.com/go-chi/cors"
)

func main() {
    // Initialize OCR engine
    engine, err := ocr.NewTesseractEngine("spa")
    if err != nil {
        log.Fatalf("Failed to initialize OCR engine: %v", err)
    }
    defer engine.Close()

    // Initialize handler
    h := handler.New(engine)

    // Setup router
    r := chi.NewRouter()

    // Middleware
    r.Use(chimiddleware.RequestID)
    r.Use(chimiddleware.RealIP)
    r.Use(middleware.Logger)
    r.Use(chimiddleware.Recoverer)
    r.Use(chimiddleware.Timeout(60 * time.Second))

    // CORS - Allow frontend origin
    r.Use(cors.Handler(cors.Options{
        AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:5173"},
        AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
        AllowCredentials: false,
        MaxAge:           300,
    }))

    // Routes
    r.Get("/", h.Index)
    r.Get("/health", h.Health)
    r.Post("/api/extract", h.ExtractText)
    r.Post("/api/visualize", h.VisualizeBoxes)
    r.Post("/api/batch", h.BatchProcess)
    r.Get("/api/results", h.ListResults)
    r.Get("/api/results/{filename}", h.GetResult)

    // Server configuration
    port := getEnv("PORT", "8080")
    srv := &http.Server{
        Addr:         fmt.Sprintf(":%s", port),
        Handler:      r,
        ReadTimeout:  15 * time.Second,
        WriteTimeout: 15 * time.Second,
        IdleTimeout:  60 * time.Second,
    }

    // Graceful shutdown
    go func() {
        log.Printf("Server starting on port %s", port)
        if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            log.Fatalf("Server failed to start: %v", err)
        }
    }()

    // Wait for interrupt signal
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit

    log.Println("Server shutting down...")

    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()

    if err := srv.Shutdown(ctx); err != nil {
        log.Fatalf("Server forced to shutdown: %v", err)
    }

    log.Println("Server exited")
}

func getEnv(key, defaultValue string) string {
    if value := os.Getenv(key); value != "" {
        return value
    }
    return defaultValue
}
```

### internal/ocr/engine.go

```go
package ocr

import (
    "context"
    "image"
)

// Engine defines the OCR engine interface
type Engine interface {
    // ExtractText extracts text from an image
    ExtractText(ctx context.Context, img image.Image) (*Result, error)

    // ExtractTextWithBoxes extracts text with bounding box information
    ExtractTextWithBoxes(ctx context.Context, img image.Image) (*DetailedResult, error)

    // Close releases engine resources
    Close() error
}

// Result represents basic OCR result
type Result struct {
    Text       string  `json:"text"`
    Confidence float64 `json:"confidence"`
}

// BoundingBox represents text location
type BoundingBox struct {
    X      int     `json:"x"`
    Y      int     `json:"y"`
    Width  int     `json:"width"`
    Height int     `json:"height"`
}

// TextBox represents detected text with its location
type TextBox struct {
    Text       string      `json:"text"`
    Confidence float64     `json:"confidence"`
    Box        BoundingBox `json:"box"`
}

// DetailedResult represents OCR result with boxes
type DetailedResult struct {
    FullText   string     `json:"full_text"`
    Boxes      []TextBox  `json:"boxes"`
    TotalLines int        `json:"total_lines"`
    Language   string     `json:"language"`
}
```

### internal/ocr/tesseract.go

```go
package ocr

import (
    "context"
    "fmt"
    "image"
    "strings"

    "github.com/otiai10/gosseract/v2"
)

// TesseractEngine implements Engine using Tesseract OCR
type TesseractEngine struct {
    client *gosseract.Client
    lang   string
}

// NewTesseractEngine creates a new Tesseract OCR engine
func NewTesseractEngine(lang string) (*TesseractEngine, error) {
    client := gosseract.NewClient()
    if err := client.SetLanguage(lang); err != nil {
        return nil, fmt.Errorf("failed to set language: %w", err)
    }

    return &TesseractEngine{
        client: client,
        lang:   lang,
    }, nil
}

// ExtractText extracts text from image
func (e *TesseractEngine) ExtractText(ctx context.Context, img image.Image) (*Result, error) {
    if err := e.client.SetImageFromImage(img); err != nil {
        return nil, fmt.Errorf("failed to set image: %w", err)
    }

    text, err := e.client.Text()
    if err != nil {
        return nil, fmt.Errorf("failed to extract text: %w", err)
    }

    confidence, err := e.client.GetMeanConfidence()
    if err != nil {
        confidence = 0
    }

    return &Result{
        Text:       strings.TrimSpace(text),
        Confidence: float64(confidence) / 100.0,
    }, nil
}

// ExtractTextWithBoxes extracts text with bounding boxes
func (e *TesseractEngine) ExtractTextWithBoxes(ctx context.Context, img image.Image) (*DetailedResult, error) {
    if err := e.client.SetImageFromImage(img); err != nil {
        return nil, fmt.Errorf("failed to set image: %w", err)
    }

    // Get bounding boxes
    boxes, err := e.client.GetBoundingBoxes(gosseract.RIL_WORD)
    if err != nil {
        return nil, fmt.Errorf("failed to get bounding boxes: %w", err)
    }

    var textBoxes []TextBox
    var fullTextParts []string

    for _, box := range boxes {
        if strings.TrimSpace(box.Word) == "" {
            continue
        }

        textBoxes = append(textBoxes, TextBox{
            Text:       box.Word,
            Confidence: float64(box.Confidence) / 100.0,
            Box: BoundingBox{
                X:      box.Box.Min.X,
                Y:      box.Box.Min.Y,
                Width:  box.Box.Max.X - box.Box.Min.X,
                Height: box.Box.Max.Y - box.Box.Min.Y,
            },
        })

        fullTextParts = append(fullTextParts, box.Word)
    }

    return &DetailedResult{
        FullText:   strings.Join(fullTextParts, " "),
        Boxes:      textBoxes,
        TotalLines: len(textBoxes),
        Language:   e.lang,
    }, nil
}

// Close releases resources
func (e *TesseractEngine) Close() error {
    return e.client.Close()
}
```

### internal/handler/handler.go

```go
package handler

import (
    "encoding/json"
    "net/http"

    "github.com/username/ocr-go/internal/ocr"
)

// Handler contains dependencies for HTTP handlers
type Handler struct {
    engine ocr.Engine
}

// New creates a new handler
func New(engine ocr.Engine) *Handler {
    return &Handler{
        engine: engine,
    }
}

// Health check endpoint
func (h *Handler) Health(w http.ResponseWriter, r *http.Request) {
    json.NewEncoder(w).Encode(map[string]string{
        "status": "healthy",
    })
}

// respondJSON sends JSON response
func (h *Handler) respondJSON(w http.ResponseWriter, status int, data interface{}) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    json.NewEncoder(w).Encode(data)
}

// respondError sends error response
func (h *Handler) respondError(w http.ResponseWriter, status int, message string) {
    h.respondJSON(w, status, map[string]string{
        "error": message,
    })
}
```

### internal/handler/extract.go

```go
package handler

import (
    "context"
    "encoding/json"
    "fmt"
    "image"
    _ "image/jpeg"
    _ "image/png"
    "net/http"
    "os"
    "path/filepath"
    "time"

    "github.com/gofrs/uuid"
)

// ExtractTextResponse represents the response
type ExtractTextResponse struct {
    Filename   string                 `json:"filename"`
    FullText   string                 `json:"full_text"`
    Boxes      []map[string]interface{} `json:"boxes"`
    TotalLines int                    `json:"total_lines"`
    ProcessedAt time.Time             `json:"processed_at"`
}

// ExtractText handles text extraction from uploaded image
func (h *Handler) ExtractText(w http.ResponseWriter, r *http.Request) {
    // Parse multipart form
    if err := r.ParseMultipartForm(10 << 20); err != nil { // 10MB max
        h.respondError(w, http.StatusBadRequest, "Failed to parse form")
        return
    }

    // Get uploaded file
    file, header, err := r.FormFile("file")
    if err != nil {
        h.respondError(w, http.StatusBadRequest, "No file uploaded")
        return
    }
    defer file.Close()

    // Decode image
    img, _, err := image.Decode(file)
    if err != nil {
        h.respondError(w, http.StatusBadRequest, "Invalid image file")
        return
    }

    // Extract text with boxes
    ctx, cancel := context.WithTimeout(r.Context(), 30*time.Second)
    defer cancel()

    result, err := h.engine.ExtractTextWithBoxes(ctx, img)
    if err != nil {
        h.respondError(w, http.StatusInternalServerError,
            fmt.Sprintf("OCR failed: %v", err))
        return
    }

    // Convert boxes to map format
    boxes := make([]map[string]interface{}, len(result.Boxes))
    for i, box := range result.Boxes {
        boxes[i] = map[string]interface{}{
            "text":       box.Text,
            "confidence": box.Confidence,
            "bbox": map[string]int{
                "x":      box.Box.X,
                "y":      box.Box.Y,
                "width":  box.Box.Width,
                "height": box.Box.Height,
            },
        }
    }

    // Save result to file
    resultID := uuid.Must(uuid.NewV4()).String()
    outputPath := filepath.Join("outputs", fmt.Sprintf("ocr_%s.json", resultID))

    response := ExtractTextResponse{
        Filename:    header.Filename,
        FullText:    result.FullText,
        Boxes:       boxes,
        TotalLines:  result.TotalLines,
        ProcessedAt: time.Now(),
    }

    // Save to disk
    outputFile, err := os.Create(outputPath)
    if err == nil {
        defer outputFile.Close()
        json.NewEncoder(outputFile).Encode(response)
    }

    // Send response
    h.respondJSON(w, http.StatusOK, response)
}
```

### internal/handler/visualize.go

```go
package handler

import (
    "context"
    "fmt"
    "image"
    "image/color"
    "image/draw"
    "image/png"
    "net/http"
    "os"
    "path/filepath"
    "time"

    "github.com/gofrs/uuid"
    "golang.org/x/image/font"
    "golang.org/x/image/font/basicfont"
    "golang.org/x/image/math/fixed"
)

// VisualizeBoxes handles bounding box visualization
func (h *Handler) VisualizeBoxes(w http.ResponseWriter, r *http.Request) {
    // Parse multipart form
    if err := r.ParseMultipartForm(10 << 20); err != nil {
        h.respondError(w, http.StatusBadRequest, "Failed to parse form")
        return
    }

    // Get uploaded file
    file, header, err := r.FormFile("file")
    if err != nil {
        h.respondError(w, http.StatusBadRequest, "No file uploaded")
        return
    }
    defer file.Close()

    // Decode image
    img, _, err := image.Decode(file)
    if err != nil {
        h.respondError(w, http.StatusBadRequest, "Invalid image file")
        return
    }

    // Extract text with boxes
    ctx, cancel := context.WithTimeout(r.Context(), 30*time.Second)
    defer cancel()

    result, err := h.engine.ExtractTextWithBoxes(ctx, img)
    if err != nil {
        h.respondError(w, http.StatusInternalServerError,
            fmt.Sprintf("OCR failed: %v", err))
        return
    }

    // Create drawable image
    bounds := img.Bounds()
    rgba := image.NewRGBA(bounds)
    draw.Draw(rgba, bounds, img, bounds.Min, draw.Src)

    // Draw bounding boxes
    green := color.RGBA{0, 255, 0, 255}
    red := color.RGBA{255, 0, 0, 255}

    for _, box := range result.Boxes {
        // Draw green rectangle
        drawRect(rgba, box.Box.X, box.Box.Y,
            box.Box.X+box.Box.Width, box.Box.Y+box.Box.Height, green, 2)

        // Draw red text label
        drawText(rgba, box.Box.X, max(box.Box.Y-15, 10),
            fmt.Sprintf("%s (%.2f)", box.Text, box.Confidence), red)
    }

    // Save annotated image
    resultID := uuid.Must(uuid.NewV4()).String()
    outputPath := filepath.Join("outputs", fmt.Sprintf("boxes_%s.png", resultID))

    outputFile, err := os.Create(outputPath)
    if err != nil {
        h.respondError(w, http.StatusInternalServerError, "Failed to save image")
        return
    }
    defer outputFile.Close()

    if err := png.Encode(outputFile, rgba); err != nil {
        h.respondError(w, http.StatusInternalServerError, "Failed to encode image")
        return
    }

    // Send response
    h.respondJSON(w, http.StatusOK, map[string]interface{}{
        "filename":    header.Filename,
        "output_file": filepath.Base(outputPath),
        "total_boxes": len(result.Boxes),
        "download_url": fmt.Sprintf("/api/results/%s", filepath.Base(outputPath)),
    })
}

// Helper functions
func drawRect(img *image.RGBA, x1, y1, x2, y2 int, c color.Color, thickness int) {
    for t := 0; t < thickness; t++ {
        for x := x1; x <= x2; x++ {
            img.Set(x, y1+t, c)
            img.Set(x, y2-t, c)
        }
        for y := y1; y <= y2; y++ {
            img.Set(x1+t, y, c)
            img.Set(x2-t, y, c)
        }
    }
}

func drawText(img *image.RGBA, x, y int, text string, c color.Color) {
    point := fixed.Point26_6{
        X: fixed.Int26_6(x * 64),
        Y: fixed.Int26_6(y * 64),
    }

    d := &font.Drawer{
        Dst:  img,
        Src:  image.NewUniform(c),
        Face: basicfont.Face7x13,
        Dot:  point,
    }
    d.DrawString(text)
}

func max(a, b int) int {
    if a > b {
        return a
    }
    return b
}
```

### internal/handler/batch.go

```go
package handler

import (
    "context"
    "encoding/json"
    "fmt"
    "image"
    "mime/multipart"
    "net/http"
    "os"
    "path/filepath"
    "sync"
    "time"

    "github.com/gofrs/uuid"
)

// BatchResult represents result for single file
type BatchResult struct {
    Filename   string `json:"filename"`
    Lines      int    `json:"lines"`
    Success    bool   `json:"success"`
    Error      string `json:"error,omitempty"`
    Preview    string `json:"preview"`
    OutputFile string `json:"output_file"`
}

// BatchProcessResponse represents batch processing response
type BatchProcessResponse struct {
    TotalFiles     int           `json:"total_files"`
    SuccessCount   int           `json:"success_count"`
    FailureCount   int           `json:"failure_count"`
    Results        []BatchResult `json:"results"`
    ProcessingTime string        `json:"processing_time"`
}

// BatchProcess handles batch processing of multiple files
func (h *Handler) BatchProcess(w http.ResponseWriter, r *http.Request) {
    startTime := time.Now()

    // Parse multipart form
    if err := r.ParseMultipartForm(50 << 20); err != nil { // 50MB max
        h.respondError(w, http.StatusBadRequest, "Failed to parse form")
        return
    }

    files := r.MultipartForm.File["files"]
    if len(files) == 0 {
        h.respondError(w, http.StatusBadRequest, "No files uploaded")
        return
    }

    // Process files concurrently
    results := make([]BatchResult, len(files))
    var wg sync.WaitGroup
    semaphore := make(chan struct{}, 4) // Limit to 4 concurrent processes

    for i, fileHeader := range files {
        wg.Add(1)
        go func(index int, header *multipart.FileHeader) {
            defer wg.Done()
            semaphore <- struct{}{}
            defer func() { <-semaphore }()

            results[index] = h.processFile(r.Context(), header)
        }(i, fileHeader)
    }

    wg.Wait()

    // Count successes and failures
    successCount := 0
    failureCount := 0
    for _, result := range results {
        if result.Success {
            successCount++
        } else {
            failureCount++
        }
    }

    response := BatchProcessResponse{
        TotalFiles:     len(files),
        SuccessCount:   successCount,
        FailureCount:   failureCount,
        Results:        results,
        ProcessingTime: time.Since(startTime).String(),
    }

    h.respondJSON(w, http.StatusOK, response)
}

func (h *Handler) processFile(ctx context.Context, header *multipart.FileHeader) BatchResult {
    result := BatchResult{
        Filename: header.Filename,
    }

    file, err := header.Open()
    if err != nil {
        result.Error = fmt.Sprintf("Failed to open file: %v", err)
        return result
    }
    defer file.Close()

    img, _, err := image.Decode(file)
    if err != nil {
        result.Error = fmt.Sprintf("Invalid image: %v", err)
        return result
    }

    ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
    defer cancel()

    ocrResult, err := h.engine.ExtractTextWithBoxes(ctx, img)
    if err != nil {
        result.Error = fmt.Sprintf("OCR failed: %v", err)
        return result
    }

    result.Lines = ocrResult.TotalLines
    result.Success = true

    if len(ocrResult.FullText) > 100 {
        result.Preview = ocrResult.FullText[:100] + "..."
    } else {
        result.Preview = ocrResult.FullText
    }

    resultID := uuid.Must(uuid.NewV4()).String()
    outputPath := filepath.Join("outputs", fmt.Sprintf("ocr_%s.json", resultID))

    outputFile, err := os.Create(outputPath)
    if err == nil {
        defer outputFile.Close()
        json.NewEncoder(outputFile).Encode(map[string]interface{}{
            "filename":   header.Filename,
            "full_text":  ocrResult.FullText,
            "boxes":      ocrResult.Boxes,
            "total_lines": ocrResult.TotalLines,
        })
        result.OutputFile = filepath.Base(outputPath)
    }

    return result
}
```

### internal/middleware/logger.go

```go
package middleware

import (
    "log"
    "net/http"
    "time"

    "github.com/go-chi/chi/v5/middleware"
)

// Logger is a middleware that logs HTTP requests
func Logger(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()

        ww := middleware.NewWrapResponseWriter(w, r.ProtoMajor)
        next.ServeHTTP(ww, r)

        log.Printf(
            "%s %s %d %s %s",
            r.Method,
            r.RequestURI,
            ww.Status(),
            time.Since(start),
            r.RemoteAddr,
        )
    })
}
```

### Makefile

```makefile
.PHONY: help build run test clean docker-build docker-run docker-stop install-frontend dev

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Backend commands
build: ## Build the backend application
	cd backend && go build -o bin/ocr-server ./cmd/server

run-backend: ## Run the backend locally
	cd backend && go run ./cmd/server/main.go

test: ## Run backend tests
	cd backend && go test -v -race -cover ./...

# Frontend commands
install-frontend: ## Install frontend dependencies with Bun
	cd frontend && bun install

run-frontend: ## Run frontend dev server
	cd frontend && bun run dev

build-frontend: ## Build frontend for production
	cd frontend && bun run build

# Development
dev: ## Run both frontend and backend in development mode
	@echo "Starting backend on :8080 and frontend on :3000"
	@make -j2 run-backend run-frontend

# Docker commands
docker-build: ## Build Docker images
	docker-compose build

docker-run: ## Run with Docker Compose
	docker-compose up

docker-stop: ## Stop Docker containers
	docker-compose down

docker-logs: ## View Docker logs
	docker-compose logs -f

# Cleanup
clean: ## Clean build artifacts
	rm -rf backend/bin/ backend/outputs/* backend/uploads/* frontend/dist/ frontend/node_modules/

clean-all: clean ## Clean everything including Docker
	docker-compose down -v
	docker system prune -f

# Linting and formatting
fmt: ## Format backend code
	cd backend && go fmt ./...

lint: ## Run linter
	cd backend && golangci-lint run

# Dependencies
mod: ## Download backend dependencies
	cd backend && go mod download && go mod tidy
```

## Getting Started

### Prerequisites

- **Bun** >= 1.0 (for frontend)
- **Go** >= 1.21 (for backend development)
- **Docker** & **Docker Compose** (for containerized deployment)
- **Make** (optional, for convenience commands)

### Quick Start with Docker (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/username/Go-OCR.git
   cd Go-OCR
   ```

2. **Start services with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - Health check: http://localhost:8080/health

### Local Development Setup

#### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install Go dependencies:**
   ```bash
   go mod download
   ```

3. **Install Tesseract OCR:**
   - **macOS:** `brew install tesseract tesseract-lang`
   - **Ubuntu:** `sudo apt-get install tesseract-ocr tesseract-ocr-spa libtesseract-dev libleptonica-dev`
   - **Windows:** Download from https://github.com/UB-Mannheim/tesseract/wiki

4. **Run backend server:**
   ```bash
   go run ./cmd/server/main.go
   ```
   Backend will start on http://localhost:8080

#### Frontend Setup

1. **Install Bun (if not installed):**
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

3. **Install dependencies:**
   ```bash
   bun install
   ```

4. **Run development server:**
   ```bash
   bun run dev
   ```
   Frontend will start on http://localhost:3000

### Development Workflow

**Option 1: Run both services with Make:**
```bash
make dev
```

**Option 2: Run services separately:**
```bash
# Terminal 1 - Backend
make run-backend

# Terminal 2 - Frontend
make run-frontend
```

### Environment Variables

#### Backend (.env or environment)
```bash
PORT=8080
APP_ENV=development
LOG_LEVEL=info
MAX_UPLOAD_SIZE=10485760  # 10MB
TESSERACT_LANG=spa
```

#### Frontend (.env)
```bash
VITE_API_URL=http://localhost:8080
```

### Project Commands

#### Backend
```bash
make build              # Build backend binary
make run-backend        # Run backend dev server
make test               # Run backend tests
make fmt                # Format Go code
make lint               # Run linter
```

#### Frontend
```bash
make install-frontend   # Install dependencies with Bun
make run-frontend       # Run frontend dev server
make build-frontend     # Build for production
```

#### Docker
```bash
make docker-build       # Build Docker images
make docker-run         # Start containers
make docker-stop        # Stop containers
make docker-logs        # View logs
```

#### Cleanup
```bash
make clean              # Clean build artifacts
make clean-all          # Clean everything including Docker volumes
```

## Code Style Requirements

### Go Best Practices

1. **Project Layout:** Follow [Standard Go Project Layout](https://github.com/golang-standards/project-layout)
2. **Error Handling:** Always check and handle errors explicitly
3. **Naming Conventions:**
   - Package names: lowercase, single word
   - Exported identifiers: PascalCase
   - Unexported identifiers: camelCase
   - Interfaces: -er suffix (e.g., `Reader`, `Writer`)
4. **Comments:**
   - Document all exported functions, types, and packages
   - Use full sentences starting with the name being documented
5. **Formatting:** Use `go fmt` and `goimports`
6. **Concurrency:**
   - Use channels and goroutines appropriately
   - Implement proper synchronization with `sync` package
   - Avoid goroutine leaks
7. **Testing:**
   - Write table-driven tests
   - Use testify/assert for assertions
   - Achieve >80% code coverage

### React/TypeScript Best Practices

1. **Component Structure:**
   - Use functional components with hooks
   - Keep components small and focused
   - Extract reusable logic into custom hooks
2. **TypeScript:**
   - Define explicit types for props and state
   - Use interfaces for complex types
   - Avoid `any` type unless absolutely necessary
3. **TanStack Query:**
   - Use mutations for server state changes
   - Implement proper error handling with `onError`
   - Leverage automatic retry and caching
4. **File Organization:**
   - Group related components in directories
   - Separate business logic from UI components
   - Use barrel exports (index.ts) for cleaner imports
5. **Styling:**
   - Use CSS modules or vanilla CSS
   - Follow BEM or similar naming convention
   - Keep styles scoped to components

### Code Quality Rules

1. **Project Layout:** Follow [Standard Go Project Layout](https://github.com/golang-standards/project-layout)
2. **Error Handling:** Always check and handle errors explicitly
3. **Naming Conventions:**
   - Package names: lowercase, single word
   - Exported identifiers: PascalCase
   - Unexported identifiers: camelCase
   - Interfaces: -er suffix (e.g., `Reader`, `Writer`)
4. **Comments:**
   - Document all exported functions, types, and packages
   - Use full sentences starting with the name being documented
5. **Formatting:** Use `go fmt` and `goimports`
6. **Concurrency:**
   - Use channels and goroutines appropriately
   - Implement proper synchronization with `sync` package
   - Avoid goroutine leaks
7. **Testing:**
   - Write table-driven tests
   - Use testify/assert for assertions
   - Achieve >80% code coverage

### Code Quality Rules

- **No panic:** Use error returns instead of panic (except truly exceptional cases)
- **Context propagation:** Pass `context.Context` as first parameter for cancellation
- **Interface segregation:** Define small, focused interfaces
- **Dependency injection:** Use constructor functions to inject dependencies
- **Configuration:** Use environment variables or config files (no hardcoded values)
- **Logging:** Use structured logging with standard library or zerolog
- **HTTP handlers:** Return early on errors to avoid nested if statements
- **Resource management:** Always defer Close() for resources

### Security Best Practices

1. **Input Validation:**
   - Validate file types and sizes
   - Sanitize file names
   - Limit upload sizes
2. **Error Handling:**
   - Don't leak internal errors to clients
   - Log detailed errors server-side only
3. **Timeouts:**
   - Set context timeouts for all operations
   - Configure HTTP client/server timeouts
4. **CORS:**
   - Configure appropriate CORS policies
   - Whitelist specific origins in production

## Performance Optimization

### Concurrency Patterns

```go
// Worker pool for batch processing
func processFilesConcurrently(files []FileHeader, maxWorkers int) []Result {
    jobs := make(chan FileHeader, len(files))
    results := make(chan Result, len(files))

    var wg sync.WaitGroup
    for w := 0; w < maxWorkers; w++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            for file := range jobs {
                results <- processFile(file)
            }
        }()
    }

    for _, file := range files {
        jobs <- file
    }
    close(jobs)

    go func() {
        wg.Wait()
        close(results)
    }()

    var allResults []Result
    for result := range results {
        allResults = append(allResults, result)
    }

    return allResults
}
```

### Memory Management

- Use `sync.Pool` for frequently allocated objects
- Stream large files instead of loading into memory
- Implement proper cleanup with defer statements
- Monitor goroutine counts and prevent leaks

## Testing Strategy

### Unit Tests

```go
func TestTesseractEngine_ExtractText(t *testing.T) {
    tests := []struct {
        name      string
        image     string
        wantText  string
        wantError bool
    }{
        {
            name:      "valid image",
            image:     "testdata/sample.png",
            wantText:  "Expected Text",
            wantError: false,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            engine, err := ocr.NewTesseractEngine("spa")
            require.NoError(t, err)
            defer engine.Close()

            img := loadImage(tt.image)
            result, err := engine.ExtractText(context.Background(), img)

            if tt.wantError {
                assert.Error(t, err)
                return
            }

            assert.NoError(t, err)
            assert.Contains(t, result.Text, tt.wantText)
        })
    }
}
```

### Integration Tests

```go
func TestAPI_ExtractText(t *testing.T) {
    engine, _ := ocr.NewTesseractEngine("spa")
    h := handler.New(engine)
    r := chi.NewRouter()
    r.Post("/api/extract", h.ExtractText)
    ts := httptest.NewServer(r)
    defer ts.Close()

    body := &bytes.Buffer{}
    writer := multipart.NewWriter(body)
    file, _ := writer.CreateFormFile("file", "test.png")
    file.Write(loadTestImageBytes())
    writer.Close()

    req, _ := http.NewRequest("POST", ts.URL+"/api/extract", body)
    req.Header.Set("Content-Type", writer.FormDataContentType())

    resp, err := http.DefaultClient.Do(req)
    require.NoError(t, err)
    defer resp.Body.Close()

    assert.Equal(t, http.StatusOK, resp.StatusCode)

    var result map[string]interface{}
    json.NewDecoder(resp.Body).Decode(&result)
    assert.NotEmpty(t, result["full_text"])
}
```

## Deployment

### Docker Production Build

```dockerfile
FROM golang:1.21-alpine AS builder

RUN apk add --no-cache gcc musl-dev tesseract-ocr-dev leptonica-dev upx

WORKDIR /build
COPY . .

RUN go mod download
RUN CGO_ENABLED=1 GOOS=linux go build \
    -ldflags="-s -w" \
    -tags=prod \
    -o ocr-server \
    ./cmd/server

RUN upx --best --lzma ocr-server

FROM alpine:3.19

RUN apk add --no-cache \
    tesseract-ocr \
    tesseract-ocr-data-spa \
    leptonica \
    ca-certificates

WORKDIR /app
COPY --from=builder /build/ocr-server .
COPY --from=builder /build/web ./web

RUN mkdir -p outputs uploads && \
    adduser -D -u 1000 appuser && \
    chown -R appuser:appuser /app

USER appuser
EXPOSE 8080

CMD ["./ocr-server"]
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ocr-go
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ocr-go
  template:
    metadata:
      labels:
        app: ocr-go
    spec:
      containers:
      - name: ocr-go
        image: ocr-go:latest
        ports:
        - containerPort: 8080
        env:
        - name: PORT
          value: "8080"
        - name: TESSERACT_LANG
          value: "spa"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: ocr-go-service
spec:
  selector:
    app: ocr-go
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
  type: LoadBalancer
```

## Monitoring

### Prometheus Metrics

```go
package metrics

import (
    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promauto"
)

var (
    OcrRequestsTotal = promauto.NewCounterVec(
        prometheus.CounterOpts{
            Name: "ocr_requests_total",
            Help: "Total number of OCR requests",
        },
        []string{"endpoint", "status"},
    )

    OcrDuration = promauto.NewHistogramVec(
        prometheus.HistogramOpts{
            Name:    "ocr_duration_seconds",
            Help:    "OCR processing duration",
            Buckets: prometheus.DefBuckets,
        },
        []string{"endpoint"},
    )
)
```

## Commit Message Format

Follow Conventional Commits:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation only
- `refactor:` Code restructuring
- `test:` Adding/updating tests
- `chore:` Maintenance tasks
- `perf:` Performance improvements

**Examples:**
- `feat(ocr): add concurrent batch processing`
- `fix(handler): resolve memory leak in file upload`
- `perf(tesseract): optimize image preprocessing`

## Resources

- [Go Documentation](https://go.dev/doc/)
- [Standard Go Project Layout](https://github.com/golang-standards/project-layout)
- [Effective Go](https://go.dev/doc/effective_go)
- [Gosseract](https://github.com/otiai10/gosseract)
- [Chi Router](https://github.com/go-chi/chi)
- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract)
