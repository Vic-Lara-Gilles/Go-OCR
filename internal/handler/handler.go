package handler

import (
"encoding/json"
	"net/http"

	"github.com/rogadev/ocr-go/internal/ocr"
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
	w.Header().Set("Content-Type", "application/json")
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
