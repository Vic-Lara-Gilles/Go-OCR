import { CheckCircle, Clock, Copy, FileText, Grid } from 'lucide-react'
import { useState } from 'react'
import type { OCRResult } from '../types/ocr'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import DownloadButtons from './DownloadButtons'

interface Props {
  result: OCRResult
}

export default function ResultDisplay({ result }: Props) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result.full_text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="shadow-xl shadow-slate-200/50 dark:shadow-none ring-1 ring-slate-200/50 dark:ring-slate-700/50 overflow-hidden h-full flex flex-col">
      <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
        <CardTitle className="text-slate-800 dark:text-white flex items-center gap-2 text-base font-semibold">
          <div className="p-1.5 rounded-lg bg-lime-500/20 border border-lime-500/40">
            <CheckCircle className="w-4 h-4 text-lime-600 dark:text-lime-400" />
          </div>
          <div>
            <span>Extraction Complete</span>
            <p className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">Results ready to use</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 flex-1 flex flex-col overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div className="p-1.5 rounded-lg bg-lime-500/10 border border-lime-500/20">
              <FileText className="w-4 h-4 text-lime-600 dark:text-lime-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">File</p>
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">{result.filename}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div className="p-1.5 rounded-lg bg-lime-500/10 border border-lime-500/20">
              <Grid className="w-4 h-4 text-lime-600 dark:text-lime-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Lines</p>
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{result.total_lines}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div className="p-1.5 rounded-lg bg-lime-500/10 border border-lime-500/20">
              <Clock className="w-4 h-4 text-lime-600 dark:text-lime-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Processed</p>
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">{new Date(result.processed_at).toLocaleTimeString()}</p>
            </div>
          </div>
        </div>

        {/* Extracted Text */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">Extracted Text</h4>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-lime-600 dark:hover:text-lime-400 bg-slate-100 dark:bg-slate-800 hover:bg-lime-50 dark:hover:bg-lime-950/30 rounded-lg transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="flex-1 bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/80 p-4 sm:p-5 rounded-xl overflow-auto whitespace-pre-wrap wrap-break-word border border-slate-200 dark:border-slate-700 text-sm leading-relaxed font-mono text-slate-700 dark:text-slate-300 shadow-inner min-h-75">
            {result.full_text}
          </pre>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
          <DownloadButtons result={result} />

          {result.boxes.length > 0 && (
            <details>
              <summary className="cursor-pointer font-medium text-lime-600 dark:text-lime-400 hover:text-lime-700 dark:hover:text-lime-300 flex items-center gap-2 text-sm">
                <Grid className="w-4 h-4" />
                View Bounding Boxes ({result.boxes.length})
              </summary>
              <div className="mt-3 max-h-48 overflow-y-auto space-y-2">
                {result.boxes.map((box, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <span className="font-mono text-xs break-all">{box.text}</span>
                    <span className="text-lime-600 dark:text-lime-400 font-semibold text-xs self-end sm:self-auto shrink-0">
                      {(box.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
