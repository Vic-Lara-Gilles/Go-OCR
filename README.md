# OCR-Go

Sistema OCR completo para extraer texto de documentos PDF e imágenes usando Tesseract, con arquitectura limpia y enfoque en principios SOLID.

## Tabla de Contenidos

- [Características](#características)
- [Arquitectura](#arquitectura)
- [Patrones de Diseño](#patrones-de-diseño)
- [Principios SOLID](#principios-solid)
- [Stack Tecnológico](#stack-tecnológico)
- [Inicio Rápido](#inicio-rápido)
- [API](#api)
- [Desarrollo](#desarrollo)
- [Testing](#testing)
- [ADRs](#adrs-architecture-decision-records)

## Características

- Extracción de texto de PDFs multipágina
- Soporte para imágenes PNG, JPG, JPEG
- Detección de palabras con coordenadas y niveles de confianza
- API REST JSON con CORS configurado
- Interfaz web moderna con React + TypeScript
- Sistema de salud (health check)
- Generación de múltiples formatos de salida (JSON, TXT, MD)
- Manejo robusto de errores y timeouts
- Logging estructurado de peticiones
- Graceful shutdown del servidor

## Arquitectura

### Diagrama de Capas

```
┌─────────────────────────────────────┐
│         Frontend Layer              │
│    React + TypeScript + Vite        │
│    (SPA con React Query)            │
└────────────┬────────────────────────┘
             │ HTTP/JSON
┌────────────▼────────────────────────┐
│         HTTP Layer                  │
│    Chi Router + Middleware          │
│    (CORS, Logging, Recovery)        │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│         Handler Layer               │
│    ExtractText, Health              │
│    (Validación y respuestas)        │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│         Domain Layer                │
│    OCR Engine Interface             │
│    (Abstracción del motor OCR)      │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│      Infrastructure Layer           │
│    TesseractEngine Implementation   │
│    (Tesseract + Poppler)            │
└─────────────────────────────────────┘
```

### Estructura del Proyecto

```
.
├── cmd/server/              # Punto de entrada de la aplicación
│   └── main.go             # Bootstrap, configuración, servidor HTTP
├── internal/
│   ├── handler/            # Capa de presentación HTTP
│   │   ├── handler.go     # Constructor y métodos base
│   │   └── extract.go     # Lógica de extracción y procesamiento
│   ├── middleware/         # Middleware HTTP personalizado
│   │   └── logger.go      # Logging estructurado de peticiones
│   ├── ocr/               # Dominio OCR
│   │   ├── engine.go      # Interfaz del motor OCR (contrato)
│   │   └── tesseract.go   # Implementación con Tesseract
│   └── model/             # Modelos de dominio (reservado)
├── frontend/              # Aplicación React
│   ├── src/
│   │   ├── api/          # Cliente HTTP
│   │   ├── components/   # Componentes UI
│   │   ├── hooks/        # Custom hooks
│   │   ├── types/        # TypeScript types
│   │   └── ui/          # Componentes base
└── outputs/              # Resultados de OCR generados
```

## Patrones de Diseño

### 1. Strategy Pattern (Patrón Estrategia)

**Ubicación:** `internal/ocr/engine.go`

El patrón Strategy se implementa mediante la interfaz `Engine`, permitiendo intercambiar diferentes motores OCR sin cambiar el código cliente.

```go
type Engine interface {
    ExtractText(ctx context.Context, img image.Image) (*Result, error)
    ExtractTextWithBoxes(ctx context.Context, img image.Image) (*DetailedResult, error)
    Close() error
}
```

**Beneficios:**
- Permite cambiar de Tesseract a otro motor OCR (Google Vision, AWS Textract) sin modificar handlers
- Facilita el testing mediante mocks
- Cumple con Open/Closed Principle

### 2. Dependency Injection

**Ubicación:** `cmd/server/main.go`, `internal/handler/handler.go`

Las dependencias se inyectan en el constructor, no se crean internamente.

```go
func New(engine ocr.Engine) *Handler {
    return &Handler{engine: engine}
}
```

**Beneficios:**
- Bajo acoplamiento entre capas
- Facilita testing con mocks
- Inversión de control

### 3. Factory Pattern

**Ubicación:** `internal/ocr/tesseract.go`

La creación del motor OCR se centraliza en una función factory.

```go
func NewTesseractEngine(lang string) (*TesseractEngine, error)
```

**Beneficios:**
- Encapsula lógica de inicialización compleja
- Validación centralizada
- Abstrae detalles de implementación

### 4. Middleware Chain (Chain of Responsibility)

**Ubicación:** `cmd/server/main.go`

Chi router implementa una cadena de middleware para procesar peticiones.

```go
r.Use(chimiddleware.RequestID)
r.Use(chimiddleware.RealIP)
r.Use(middleware.Logger)
r.Use(chimiddleware.Recoverer)
r.Use(chimiddleware.Timeout(60 * time.Second))
```

**Beneficios:**
- Separación de concerns
- Reutilización de lógica transversal
- Fácil agregar/remover comportamiento

### 5. Repository Pattern (Implícito)

**Ubicación:** `internal/handler/extract.go`

Aunque no hay un repositorio explícito, la capa de handlers abstrae el acceso al sistema de archivos.

**Oportunidad de mejora:** Crear `internal/repository/file_repository.go` para gestionar outputs.

## Principios SOLID

### Single Responsibility Principle (SRP)

**Cumplimiento:**
- ✅ `Handler`: Solo maneja peticiones HTTP
- ✅ `TesseractEngine`: Solo ejecuta OCR
- ✅ `Logger`: Solo registra peticiones
- ✅ Cada archivo tiene una responsabilidad clara

### Open/Closed Principle (OCP)

**Cumplimiento:**
- ✅ La interfaz `Engine` permite agregar nuevos motores OCR sin modificar código existente
- ✅ El middleware es extensible mediante `r.Use()`
- ✅ Los formatos de salida son extensibles sin cambiar la lógica core

### Liskov Substitution Principle (LSP)

**Cumplimiento:**
- ✅ Cualquier implementación de `Engine` puede sustituir a otra
- ✅ `TesseractEngine` cumple el contrato de la interfaz sin efectos secundarios inesperados

### Interface Segregation Principle (ISP)

**Cumplimiento:**
- ✅ La interfaz `Engine` solo expone métodos que los clientes necesitan
- ✅ No hay métodos no utilizados en la interfaz

**Oportunidad de mejora:** Si se necesita solo texto simple, crear `SimpleEngine` con un solo método.

### Dependency Inversion Principle (DIP)

**Cumplimiento:**
- ✅ `Handler` depende de la abstracción `Engine`, no de `TesseractEngine`
- ✅ Las capas superiores no conocen detalles de implementación
- ✅ La configuración se inyecta desde `main.go`

## Clean Code Principles

### Nombrado Claro y Descriptivo

```go
// ✅ Bueno
func ExtractText(w http.ResponseWriter, r *http.Request)
func NewTesseractEngine(lang string) (*TesseractEngine, error)

// ❌ Evitado
func Process(w http.ResponseWriter, r *http.Request)
func New() (*T, error)
```

### Funciones Pequeñas y Enfocadas

- Cada función tiene una responsabilidad única
- Nivel de abstracción consistente
- Nombres que describen la intención

### Manejo de Errores Explícito

```go
if err != nil {
    return nil, fmt.Errorf("failed to set language: %w", err)
}
```

- Errores envueltos con contexto
- No se ignoran errores silenciosamente
- Propagación clara de errores

### Context Awareness

```go
ctx, cancel := context.WithTimeout(r.Context(), 120*time.Second)
defer cancel()
```

- Timeouts configurados
- Cancelación de operaciones largas
- Prevención de goroutine leaks

### Resource Cleanup

```go
defer file.Close()
defer client.Close()
defer os.RemoveAll(tempDir)
```

- Uso consistente de `defer` para limpieza
- Sin leaks de recursos

## Stack Tecnológico

### Backend

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| Go | 1.21+ | Lenguaje principal |
| Chi Router | v5 | HTTP routing y middleware |
| Tesseract OCR | 5.x | Motor de reconocimiento óptico |
| Poppler | 23.x | Conversión PDF a imágenes (pdftoppm) |
| gosseract | v2 | Bindings de Tesseract para Go |
| UUID | gofrs/uuid | Generación de IDs únicos |

### Frontend

| Tecnología | Propósito |
|-----------|-----------|
| React 18 | UI library |
| TypeScript | Type safety |
| Vite | Build tool |
| Tanstack Query | Estado asíncrono y caché |
| Lucide React | Iconos |
| CSS puro | Estilos (sin frameworks CSS) |

### Infrastructure

| Tecnología | Propósito |
|-----------|-----------|
| Docker | Containerización |
| Docker Compose | Orquestación multi-contenedor |
| Alpine Linux | Imagen base ligera |
| Nginx | Servidor web para frontend |

## Inicio Rápido

### Opción 1: Full Stack en Docker (Recomendado)

```bash
# Levantar todo el stack
docker-compose up --build

# Acceder a la aplicación
open http://localhost:8080
```

### Opción 2: Desarrollo Local

```bash
# Backend en Docker, Frontend local (hot reload)
make dev-local

# En otra terminal
cd frontend
bun install
bun dev
```

### Variables de Entorno

```env
# Backend
PORT=8080
TESSERACT_LANG=spa  # Idioma OCR: spa, eng, fra, etc.
APP_ENV=development
LOG_LEVEL=debug
MAX_UPLOAD_SIZE=10485760  # 10MB

# Frontend (archivo .env en /frontend)
VITE_API_URL=http://localhost:8080
```

## API

### Endpoint: Extraer Texto

**Request:**
```http
POST /api/extract
Content-Type: multipart/form-data

file: [archivo PDF/PNG/JPG]
```

**Response:**
```json
{
  "filename": "documento.pdf",
  "full_text": "Texto extraído completo...",
  "boxes": [
    {
      "page": 1,
      "text": "palabra",
      "confidence": 0.95,
      "bbox": {
        "x": 100,
        "y": 200,
        "width": 80,
        "height": 20
      }
    }
  ],
  "total_lines": 150,
  "total_pages": 3,
  "processed_at": "2026-01-08T10:30:00Z"
}
```

**Códigos de Estado:**
- `200 OK`: Extracción exitosa
- `400 Bad Request`: Archivo inválido o no soportado
- `500 Internal Server Error`: Error de procesamiento

### Endpoint: Health Check

**Request:**
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy"
}
```

## Desarrollo

### Comandos Make

```bash
# Mostrar ayuda
make help

# Compilar binario
make build

# Ejecutar tests
make test

# Formatear código
make fmt

# Linting
make lint

# Actualizar dependencias
make mod

# Docker
make docker-build
make docker-up
make docker-down
make docker-logs
make docker-restart
```

### Estructura de Commits (Conventional Commits)

Este proyecto sigue [Conventional Commits](https://www.conventionalcommits.org/) para mantener un historial limpio y generación automática de changelogs.

**Formato:**
```
<type>(scope): <description>

[optional body]

[optional footer]
```

**Tipos:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Solo documentación
- `refactor`: Refactorización sin cambio de comportamiento
- `chore`: Tareas de mantenimiento (deps, config)
- `test`: Agregar o modificar tests

**Ejemplo:**
```bash
git commit -m "feat(ocr): add support for TIFF images"
git commit -m "fix(handler): handle empty PDF pages gracefully"
git commit -m "docs: update architecture diagram in README"
```

### Agregar Soporte para Nuevos Formatos

1. Agregar extensión en `extract.go`:
```go
validExts := map[string]bool{
    ".pdf": true,
    ".png": true,
    ".jpg": true,
    ".tiff": true,  // Nueva extensión
}
```

2. Implementar conversión si es necesario
3. Agregar tests para el nuevo formato

### Cambiar Motor OCR

1. Crear nueva implementación de `Engine`:
```go
type GoogleVisionEngine struct { ... }
func (e *GoogleVisionEngine) ExtractText(...) (*Result, error)
```

2. Actualizar `main.go`:
```go
engine, err := ocr.NewGoogleVisionEngine(apiKey)
```

## Testing

### Estado Actual

⚠️ **Pendiente:** El proyecto actualmente no tiene tests automatizados.

### Roadmap de Testing

**Fase 1: Unit Tests**
```go
// internal/ocr/tesseract_test.go
func TestTesseractEngine_ExtractText(t *testing.T)
func TestTesseractEngine_InvalidLanguage(t *testing.T)

// internal/handler/extract_test.go
func TestExtractText_ValidPDF(t *testing.T)
func TestExtractText_InvalidFileType(t *testing.go)
```

**Fase 2: Integration Tests**
- Test completo de la API con archivo real
- Test de conversión PDF → imagen
- Test de persistencia de resultados

**Fase 3: E2E Tests**
- Cypress/Playwright para flujo completo frontend
- Test de carga con múltiples PDFs concurrentes

### TDD (Test-Driven Development)

**Proceso recomendado para nuevas features:**

1. **Red**: Escribir test que falle
```go
func TestExtractText_TIFF(t *testing.T) {
    // Test para formato TIFF
}
```

2. **Green**: Implementar código mínimo para pasar test
```go
func processTIFF(file io.Reader) ([]string, error) {
    // Implementación mínima
}
```

3. **Refactor**: Mejorar código sin romper tests
```go
func processTIFF(file io.Reader) ([]string, error) {
    // Código optimizado y limpio
}
```

## ADRs (Architecture Decision Records)

### ADR-001: Elección de Go como Lenguaje Backend

**Estado:** Aceptado

**Contexto:**
Se necesitaba un lenguaje eficiente para procesamiento de imágenes y concurrencia.

**Decisión:**
Usar Go 1.21+ como lenguaje principal del backend.

**Consecuencias:**
- ✅ Excelente rendimiento y bajo uso de memoria
- ✅ Goroutines para procesamiento concurrente
- ✅ Binario único sin dependencias runtime
- ✅ Tooling robusto (go test, go fmt, go mod)
- ⚠️ Curva de aprendizaje para equipo sin experiencia en Go

### ADR-002: Chi Router vs Gin

**Estado:** Aceptado

**Contexto:**
Se necesitaba un router HTTP minimalista compatible con net/http estándar.

**Decisión:**
Usar Chi Router v5 en lugar de Gin.

**Razones:**
- ✅ Compatible 100% con `http.Handler` estándar
- ✅ Middleware idiomático de Go
- ✅ Sin reflexión (mejor rendimiento)
- ✅ Comunidad activa y documentación clara
- ❌ Gin tiene más funciones built-in (validación, binding)

### ADR-003: Interfaz Engine para Abstracción OCR

**Estado:** Aceptado

**Contexto:**
Necesidad de desacoplar la lógica de handlers del motor OCR específico.

**Decisión:**
Crear interfaz `Engine` con implementación `TesseractEngine`.

**Beneficios:**
- ✅ Facilita testing con mocks
- ✅ Permite cambiar a otros motores (Google Vision, AWS Textract)
- ✅ Cumple Dependency Inversion Principle
- ✅ Mejora testabilidad

### ADR-004: Monorepo con Frontend Incluido

**Estado:** Aceptado

**Contexto:**
Decisión entre monorepo o repositorios separados para backend/frontend.

**Decisión:**
Mantener ambos en un monorepo con Docker Compose para orquestación.

**Razones:**
- ✅ Desarrollo más simple con un solo repositorio
- ✅ Versionado sincronizado de cambios relacionados
- ✅ CI/CD más simple
- ✅ Mejor para proyecto pequeño/mediano
- ⚠️ Puede complicarse al escalar con múltiples equipos

### ADR-005: Generación de Múltiples Formatos de Salida

**Estado:** Aceptado

**Contexto:**
Los usuarios necesitan diferentes formatos según el caso de uso.

**Decisión:**
Generar JSON (máquina), TXT (texto plano), MD (lectura humana) simultáneamente.

**Beneficios:**
- ✅ Flexibilidad para diferentes consumidores
- ✅ Markdown útil para documentación automática
- ✅ JSON con metadata completa para análisis
- ⚠️ Incrementa uso de disco

## Code Review Checklist

Al revisar pull requests, verificar:

**Arquitectura:**
- [ ] Respeta la separación de capas
- [ ] No hay lógica de negocio en handlers
- [ ] Interfaces bien definidas

**SOLID:**
- [ ] Cada tipo tiene una responsabilidad
- [ ] Dependencias inyectadas, no creadas internamente
- [ ] Interfaces segregadas apropiadamente

**Clean Code:**
- [ ] Nombres descriptivos y en inglés
- [ ] Funciones pequeñas (< 50 líneas idealmente)
- [ ] Manejo explícito de errores
- [ ] Comentarios solo donde agregan valor

**Testing:**
- [ ] Tests unitarios para lógica nueva
- [ ] Tests no rompen tests existentes
- [ ] Coverage > 70% para nuevo código

**Documentación:**
- [ ] README actualizado si cambia funcionalidad
- [ ] Comentarios GoDoc en funciones públicas
- [ ] ADR creado para decisiones arquitectónicas

**Git:**
- [ ] Commits siguen Conventional Commits
- [ ] Branch desde `main` actualizado
- [ ] Sin código comentado sin justificación
- [ ] Sin archivos `.env` o secrets

## Mejoras Futuras

### High Priority
- [ ] Implementar suite de tests completa (unit + integration)
- [ ] Agregar autenticación JWT para API
- [ ] Rate limiting para prevenir abuso
- [ ] Métricas con Prometheus

### Medium Priority
- [ ] Repository pattern para gestión de outputs
- [ ] Soporte para más idiomas OCR
- [ ] Queue system para procesamiento asíncrono (RabbitMQ/Redis)
- [ ] Caché de resultados con TTL

### Low Priority
- [ ] Soporte para OCR de tablas estructuradas
- [ ] API para consultar resultados históricos
- [ ] Dashboard de métricas
- [ ] Exportación a formatos adicionales (DOCX, CSV)

## Recursos

### Documentación Oficial
- [Go Documentation](https://go.dev/doc/)
- [Chi Router](https://go-chi.io/)
- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract)
- [React Documentation](https://react.dev/)

### Patrones y Principios
- [Refactoring Guru - Design Patterns](https://refactoring.guru/design-patterns)
- [Clean Code by Robert C. Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [SOLID Principles](https://www.digitalocean.com/community/conceptual-articles/s-o-l-i-d-the-first-five-principles-of-object-oriented-design)

### Conventional Commits
- [Conventional Commits Specification](https://www.conventionalcommits.org/)

## Licencia

MIT

## Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una branch: `git checkout -b feat/nueva-funcionalidad`
3. Commit siguiendo Conventional Commits
4. Push: `git push origin feat/nueva-funcionalidad`
5. Abre un Pull Request

**Nota:** Antes de contribuir, lee el [Code Review Checklist](#code-review-checklist)


