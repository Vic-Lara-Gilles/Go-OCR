# OCR-Go

Servicio simple de OCR para extraer texto de documentos PDF usando Tesseract.

## Características

- Extracción de texto de PDFs multipágina
- Detección de palabras con coordenadas
- API REST JSON
- Interfaz web simple

## Inicio Rápido

```bash
docker-compose up --build
```

Accede a http://localhost:8080

## API

**Extraer texto de PDF:**
```bash
curl -X POST -F "file=@documento.pdf" http://localhost:8080/api/extract
```

## Tecnologías

- Go 1.21 + Chi Router
- Tesseract OCR (español)
- Poppler (PDF → imágenes)
- Docker + Alpine Linux


