# OCR Frontend - React + TanStack Query + Tailwind CSS

Frontend moderno para el sistema OCR.

## 🚀 Quick Start

\`\`\`bash
# Instalar dependencias
bun install

# Iniciar desarrollo
bun run dev
\`\`\`

Frontend: http://localhost:3000

## 📦 Scripts

- \`bun run dev\` - Servidor de desarrollo
- \`bun run build\` - Build de producción
- \`bun run preview\` - Preview del build
- \`bun run lint\` - Linter
- \`bun run type-check\` - Verificar TypeScript

## 🛠️ Stack

- ⚡ Bun - Runtime ultra rápido
- ⚛️ React 19 - UI library
- 📦 TanStack Query - State management
- 🎨 Tailwind CSS v4 - Styling
- 📘 TypeScript - Type safety
- 🚀 Vite - Build tool

## 📁 Estructura

\`\`\`
src/
├── components/    # Componentes React
├── hooks/         # Custom hooks (TanStack Query)
├── api/           # Cliente API
├── types/         # TypeScript types
└── App.tsx        # App principal
\`\`\`

## 🔌 API Endpoints

- \`POST /api/extract\` - Extracción de texto
- \`POST /api/visualize\` - Bounding boxes
- \`POST /api/batch\` - Procesamiento por lotes

## 🐳 Docker

Ver \`docker-compose.yml\` en la raíz del proyecto.
