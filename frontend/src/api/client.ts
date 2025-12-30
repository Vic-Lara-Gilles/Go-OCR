import type { APIError, BatchResponse, OCRResult } from '../types/ocr'

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
