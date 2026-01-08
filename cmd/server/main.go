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

"github.com/rogadev/ocr-go/internal/handler"
"github.com/rogadev/ocr-go/internal/middleware"
"github.com/rogadev/ocr-go/internal/ocr"

"github.com/go-chi/chi/v5"
chimiddleware "github.com/go-chi/chi/v5/middleware"
"github.com/go-chi/cors"
)

func main() {
	// Get configuration from environment
	lang := getEnv("TESSERACT_LANG", "spa")
	port := getEnv("PORT", "8080")

	log.Printf("Initializing OCR engine with language: %s", lang)

	// Initialize OCR engine
	engine, err := ocr.NewTesseractEngine(lang)
	if err != nil {
		log.Fatalf("Failed to initialize OCR engine: %v", err)
	}
	defer engine.Close()

	// Initialize handler
	h := handler.New(engine)

	// Setup router
	r := chi.NewRouter()

	// Middleware stack
	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.Timeout(60 * time.Second))

	// CORS configuration
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-Requested-With"},
		ExposedHeaders:   []string{"Content-Length", "Content-Type"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	// Health check (before API)
	r.Get("/health", h.Health)

	// API routes
	r.Route("/api", func(r chi.Router) {
		r.Post("/extract", h.ExtractText)
	})

	// Serve static files from frontend build
	r.Handle("/assets/*", http.StripPrefix("/assets/",
		http.FileServer(http.Dir("frontend/dist/assets"))))
	r.Handle("/outputs/*", http.StripPrefix("/outputs/",
		http.FileServer(http.Dir("outputs"))))

	// Serve vite.svg and other root assets
	r.Get("/vite.svg", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "frontend/dist/vite.svg")
	})

	// Serve React index.html for all other routes (SPA support)
	r.Get("/*", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "frontend/dist/index.html")
	})

	// Server configuration
	srv := &http.Server{
		Addr:         fmt.Sprintf(":%s", port),
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 60 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in goroutine
	go func() {
		log.Printf("Server starting on port %s", port)
		log.Printf("Access the application at http://localhost:%s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed to start: %v", err)
		}
	}()

	// Wait for interrupt signal for graceful shutdown
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
