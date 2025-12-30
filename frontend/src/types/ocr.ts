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
