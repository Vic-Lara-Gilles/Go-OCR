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
    <Card className="mt-6 sm:mt-8 shadow-xl shadow-slate-200/50 dark:shadow-none ring-1 ring-slate-200/50 dark:ring-slate-700/50 overflow-hidden">
      <CardHeader className="bg-linear-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-cyan-950/20 border-b border-emerald-100 dark:border-emerald-900/30">
        <CardTitle className="text-slate-800 dark:text-white flex items-center gap-3 text-lg sm:text-xl">
          <div className="p-2 sm:p-2.5 rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25 ring-1 ring-white/20">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <span className="font-bold">Extraction Complete</span>
            <p className="text-xs sm:text-sm font-normal text-slate-500 dark:text-slate-400 mt-0.5">Your text has been extracted successfully</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">\n        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800/30 border border-slate-200/80 dark:border-slate-700/50 shadow-sm">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">File</p>
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">{result.filename}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800/30 border border-slate-200/80 dark:border-slate-700/50 shadow-sm">
            <div className="p-2 rounded-lg bg-lime-100 dark:bg-lime-900/30">
              <Grid className="w-5 h-5 text-lime-600 dark:text-lime-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Lines</p>
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{result.total_lines}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800/30 border border-slate-200/80 dark:border-slate-700/50 shadow-sm sm:col-span-1">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Processed</p>
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">{new Date(result.processed_at).toLocaleTimeString()}</p>
            </div>
          </div>
        </div>

        {/* Extracted Text */}
        <div className="mb-6">
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
          <pre className="bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/80 p-4 sm:p-5 rounded-xl overflow-x-auto whitespace-pre-wrap wrap-break-word border border-slate-200 dark:border-slate-700 text-sm leading-relaxed max-h-72 sm:max-h-96 overflow-y-auto font-mono text-slate-700 dark:text-slate-300 shadow-inner">
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
