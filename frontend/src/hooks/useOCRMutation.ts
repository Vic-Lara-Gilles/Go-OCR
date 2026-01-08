import { useMutation } from '@tanstack/react-query'
import { batchProcess, extractText, visualizeBoxes } from '../api/client'
import type { BatchResponse, OCRResult } from '../types/ocr'

export function useExtractText() {
  return useMutation<OCRResult, Error, File>({
    mutationFn: (file) => {
      console.log('Mutation function called with file:', file.name)
      return extractText(file)
    },
    onSuccess: (data) => {
      console.log('Text extracted successfully:', data.filename)
    },
    onError: (error) => {
      console.error('Extraction failed:', error.message, error)
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
