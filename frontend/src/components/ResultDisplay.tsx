import { Clock, FileText, Grid } from 'lucide-react'
import type { OCRResult } from '../types/ocr'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import DownloadButtons from './DownloadButtons'

interface Props {
  result: OCRResult
}

export default function ResultDisplay({ result }: Props) {
  return (
    <Card className="mt-4 sm:mt-6 animate-in slide-in-from-bottom duration-500">
      <CardHeader>
        <CardTitle className="text-lime-500 flex items-center gap-2 text-lg sm:text-xl">
          <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
          Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-lime-500 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">File</p>
              <p className="font-medium text-xs sm:text-sm truncate">{result.filename}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <Grid className="w-4 h-4 sm:w-5 sm:h-5 text-lime-500 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">Lines Detected</p>
              <p className="font-medium text-xs sm:text-sm">{result.total_lines}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 sm:col-span-2 lg:col-span-1">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-lime-500 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">Processed</p>
              <p className="font-medium text-xs sm:text-sm truncate">{new Date(result.processed_at).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 text-slate-700 dark:text-slate-300">Extracted Text:</h4>
          <pre className="bg-slate-50 dark:bg-slate-800 p-3 sm:p-4 rounded-lg overflow-x-auto whitespace-pre-wrap wrap-break-words border border-slate-200 dark:border-slate-700 text-xs sm:text-sm max-h-64 sm:max-h-80 overflow-y-auto">
            {result.full_text}
          </pre>
        </div>

        <DownloadButtons result={result} />

        {result.boxes.length > 0 && (
          <details className="mt-4">
            <summary className="cursor-pointer font-medium text-lime-600 dark:text-lime-400 hover:text-lime-700 dark:hover:text-lime-300 flex items-center gap-2 text-sm sm:text-base">
              <Grid className="w-4 h-4" />
              View Bounding Boxes ({result.boxes.length})
            </summary>
            <div className="mt-3 max-h-64 sm:max-h-96 overflow-y-auto space-y-2">
              {result.boxes.map((box, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <span className="font-mono text-xs sm:text-sm break-all">{box.text}</span>
                  <span className="text-lime-600 dark:text-lime-400 font-semibold text-xs self-end sm:self-auto shrink-0">
                    {(box.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  )
}
