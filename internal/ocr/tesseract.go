package ocr

import (
"bytes"
"context"
"fmt"
"image"
"image/png"
"strings"

"github.com/otiai10/gosseract/v2"
)

// TesseractEngine implements Engine using Tesseract OCR
type TesseractEngine struct {
	lang string
}

// NewTesseractEngine creates a new Tesseract OCR engine
func NewTesseractEngine(lang string) (*TesseractEngine, error) {
	// Validate that Tesseract is available by creating a test client
	client := gosseract.NewClient()
	defer client.Close()

	if err := client.SetLanguage(lang); err != nil {
		return nil, fmt.Errorf("failed to set language: %w", err)
	}

	return &TesseractEngine{
		lang: lang,
	}, nil
}

// ExtractText extracts text from image
func (e *TesseractEngine) ExtractText(ctx context.Context, img image.Image) (*Result, error) {
	select {
	case <-ctx.Done():
		return nil, ctx.Err()
	default:
	}

	client := gosseract.NewClient()
	defer client.Close()

	if err := client.SetLanguage(e.lang); err != nil {
		return nil, fmt.Errorf("failed to set language: %w", err)
	}

	// Encode image to bytes
	imgBytes, err := imageToBytes(img)
	if err != nil {
		return nil, fmt.Errorf("failed to encode image: %w", err)
	}

	if err := client.SetImageFromBytes(imgBytes); err != nil {
		return nil, fmt.Errorf("failed to set image: %w", err)
	}

	text, err := client.Text()
	if err != nil {
		return nil, fmt.Errorf("failed to extract text: %w", err)
	}

	return &Result{
		Text:       strings.TrimSpace(text),
		Confidence: 0.0, // gosseract doesn't provide overall confidence easily
}, nil
}

// ExtractTextWithBoxes extracts text with bounding boxes
func (e *TesseractEngine) ExtractTextWithBoxes(ctx context.Context, img image.Image) (*DetailedResult, error) {
select {
case <-ctx.Done():
return nil, ctx.Err()
default:
}

client := gosseract.NewClient()
defer client.Close()

if err := client.SetLanguage(e.lang); err != nil {
return nil, fmt.Errorf("failed to set language: %w", err)
}

// Encode image to bytes
imgBytes, err := imageToBytes(img)
if err != nil {
return nil, fmt.Errorf("failed to encode image: %w", err)
}

if err := client.SetImageFromBytes(imgBytes); err != nil {
return nil, fmt.Errorf("failed to set image: %w", err)
}

// Get bounding boxes at word level
boxes, err := client.GetBoundingBoxes(gosseract.RIL_WORD)
if err != nil {
return nil, fmt.Errorf("failed to get bounding boxes: %w", err)
}

var textBoxes []TextBox
var fullTextParts []string

for _, box := range boxes {
word := strings.TrimSpace(box.Word)
if word == "" {
continue
}

textBoxes = append(textBoxes, TextBox{
Text:       word,
Confidence: box.Confidence / 100.0,
Box: BoundingBox{
X:      box.Box.Min.X,
Y:      box.Box.Min.Y,
Width:  box.Box.Max.X - box.Box.Min.X,
Height: box.Box.Max.Y - box.Box.Min.Y,
},
})

fullTextParts = append(fullTextParts, word)
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
return nil
}

// imageToBytes converts an image.Image to PNG bytes
func imageToBytes(img image.Image) ([]byte, error) {
var buf bytes.Buffer
if err := png.Encode(&buf, img); err != nil {
return nil, err
}
return buf.Bytes(), nil
}
