package handler

import (
"context"
"encoding/json"
"fmt"
"image"
_ "image/jpeg"
_ "image/png"
"io"
"net/http"
"os"
"os/exec"
"path/filepath"
"strings"
"time"

"github.com/gofrs/uuid"
)

// ExtractTextResponse represents the response
type ExtractTextResponse struct {
	Filename    string                   `json:"filename"`
	FullText    string                   `json:"full_text"`
	Boxes       []map[string]interface{} `json:"boxes"`
	TotalLines  int                      `json:"total_lines"`
	TotalPages  int                      `json:"total_pages"`
	ProcessedAt time.Time                `json:"processed_at"`
}

// ExtractText handles text extraction from uploaded PDF
func (h *Handler) ExtractText(w http.ResponseWriter, r *http.Request) {
	// Parse multipart form
	if err := r.ParseMultipartForm(50 << 20); err != nil { // 50MB max for PDFs
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

	// Validate file type
	ext := strings.ToLower(filepath.Ext(header.Filename))
	validExts := map[string]bool{
		".pdf": true,
		".png": true,
		".jpg": true,
		".jpeg": true,
	}
	if !validExts[ext] {
		h.respondError(w, http.StatusBadRequest, "Only PDF, PNG, JPG files are accepted")
		return
	}

	// Save file temporarily
	tempDir := filepath.Join("uploads", uuid.Must(uuid.NewV4()).String())
	if err := os.MkdirAll(tempDir, 0755); err != nil {
		h.respondError(w, http.StatusInternalServerError, "Failed to create temp directory")
		return
	}
	defer os.RemoveAll(tempDir)

	var images []string

	// Process based on file type
	if ext == ".pdf" {
		// Save PDF temporarily
		pdfPath := filepath.Join(tempDir, "input.pdf")
		pdfFile, err := os.Create(pdfPath)
		if err != nil {
			h.respondError(w, http.StatusInternalServerError, "Failed to save PDF")
			return
		}

		if _, err := io.Copy(pdfFile, file); err != nil {
			pdfFile.Close()
			h.respondError(w, http.StatusInternalServerError, "Failed to write PDF")
			return
		}
		pdfFile.Close()

		// Convert PDF to images using pdftoppm
		imagePrefix := filepath.Join(tempDir, "page")
		cmd := exec.Command("pdftoppm", "-png", "-r", "300", pdfPath, imagePrefix)
		if err := cmd.Run(); err != nil {
			h.respondError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to convert PDF: %v", err))
			return
		}

		// Get list of generated images
		images, err = filepath.Glob(filepath.Join(tempDir, "page-*.png"))
		if err != nil || len(images) == 0 {
			h.respondError(w, http.StatusInternalServerError, "No pages generated from PDF")
			return
		}
	} else {
		// Save image directly
		imagePath := filepath.Join(tempDir, "image"+ext)
		imgFile, err := os.Create(imagePath)
		if err != nil {
			h.respondError(w, http.StatusInternalServerError, "Failed to save image")
			return
		}

		if _, err := io.Copy(imgFile, file); err != nil {
			imgFile.Close()
			h.respondError(w, http.StatusInternalServerError, "Failed to write image")
			return
		}
		imgFile.Close()

		images = []string{imagePath}
	}

	// Process each page
	ctx, cancel := context.WithTimeout(r.Context(), 120*time.Second)
	defer cancel()

	var allText []string
	var allBoxes []map[string]interface{}
	totalWords := 0

	for pageNum, imagePath := range images {
		imgFile, err := os.Open(imagePath)
		if err != nil {
			continue
		}

		img, _, err := image.Decode(imgFile)
		imgFile.Close()
		if err != nil {
			continue
		}

		result, err := h.engine.ExtractTextWithBoxes(ctx, img)
		if err != nil {
			continue
		}

		if result.FullText != "" {
			allText = append(allText, fmt.Sprintf("--- Página %d ---\n%s", pageNum+1, result.FullText))
		}

		for _, box := range result.Boxes {
			allBoxes = append(allBoxes, map[string]interface{}{
"page":       pageNum + 1,
"text":       box.Text,
"confidence": box.Confidence,
"bbox": map[string]int{
"x":      box.Box.X,
"y":      box.Box.Y,
"width":  box.Box.Width,
"height": box.Box.Height,
},
})
		}
		totalWords += result.TotalLines
	}

	// Save result to file
	resultID := uuid.Must(uuid.NewV4()).String()
	outputPath := filepath.Join("outputs", fmt.Sprintf("ocr_%s.json", resultID))

	fullText := strings.Join(allText, "\n\n")

	response := ExtractTextResponse{
		Filename:    header.Filename,
		FullText:    fullText,
		Boxes:       allBoxes,
		TotalLines:  totalWords,
		TotalPages:  len(images),
		ProcessedAt: time.Now(),
	}

	// Save JSON
	outputFile, err := os.Create(outputPath)
	if err == nil {
		defer outputFile.Close()
		json.NewEncoder(outputFile).Encode(response)
	}

	// Save TXT
	txtPath := filepath.Join("outputs", fmt.Sprintf("ocr_%s.txt", resultID))
	if txtFile, err := os.Create(txtPath); err == nil {
		defer txtFile.Close()
		txtFile.WriteString(fullText)
	}

	// Save Markdown
	mdPath := filepath.Join("outputs", fmt.Sprintf("ocr_%s.md", resultID))
	if mdFile, err := os.Create(mdPath); err == nil {
		defer mdFile.Close()
		mdFile.WriteString(fmt.Sprintf("# %s\n\n", header.Filename))
		mdFile.WriteString(fmt.Sprintf("**Total de páginas:** %d  \n", len(images)))
		mdFile.WriteString(fmt.Sprintf("**Palabras detectadas:** %d  \n", totalWords))
		mdFile.WriteString(fmt.Sprintf("**Fecha:** %s\n\n", time.Now().Format("2006-01-02 15:04:05")))
		mdFile.WriteString("---\n\n")
		mdFile.WriteString(fullText)
	}

	// Add download URLs to response
	responseWithDownloads := map[string]interface{}{
		"filename":     response.Filename,
		"full_text":    response.FullText,
		"boxes":        response.Boxes,
		"total_lines":  response.TotalLines,
		"total_pages":  response.TotalPages,
		"processed_at": response.ProcessedAt,
		"downloads": map[string]string{
			"txt":      fmt.Sprintf("/outputs/ocr_%s.txt", resultID),
			"markdown": fmt.Sprintf("/outputs/ocr_%s.md", resultID),
			"json":     fmt.Sprintf("/outputs/ocr_%s.json", resultID),
		},
	}

	// Send response
	h.respondJSON(w, http.StatusOK, responseWithDownloads)
}
