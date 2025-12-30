import { Clock, FileText, Grid } from 'lucide-react'
import type { OCRResult } from '../types/ocr'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import DownloadButtons from './DownloadButtons'

interface Props {
  result: OCRResult
}

export default function ResultDisplay({ result }: Props) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lime-500 flex items-center gap-2">
          <Grid className="w-5 h-5" />
          Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <FileText className="w-5 h-5 text-lime-500" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">File</p>
              <p className="font-medium text-sm">{result.filename}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <Grid className="w-5 h-5 text-lime-500" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Lines Detected</p>
              <p className="font-medium text-sm">{result.total_lines}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <Clock className="w-5 h-5 text-lime-500" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Processed</p>
              <p className="font-medium text-sm">{new Date(result.processed_at).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-base font-semibold mb-3 text-slate-700 dark:text-slate-300">Extracted Text:</h4>
          <pre className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap wrap-break-words border border-slate-200 dark:border-slate-700 text-sm">
            {result.full_text}
          </pre>
        </div>

        <DownloadButtons result={result} />

        {result.boxes.length > 0 && (
          <details className="mt-4">
            <summary className="cursor-pointer font-medium text-lime-600 dark:text-lime-400 hover:text-lime-700 dark:hover:text-lime-300 flex items-center gap-2">
              <Grid className="w-4 h-4" />
              View Bounding Boxes ({result.boxes.length})
            </summary>
            <div className="mt-3 max-h-96 overflow-y-auto space-y-2">
              {result.boxes.map((box, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <span className="font-mono text-sm">{box.text}</span>
                  <span className="text-lime-600 dark:text-lime-400 font-semibold text-xs">
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
