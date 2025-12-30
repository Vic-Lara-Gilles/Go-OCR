import { Download, FileJson, FileText } from 'lucide-react'
import type { OCRResult } from '../types/ocr'
import { Button } from '../ui/button'

interface Props {
  result: OCRResult
}

export default function DownloadButtons({ result }: Props) {
  const downloadAsText = () => {
    const blob = new Blob([result.full_text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${result.filename}_extracted.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadAsJSON = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${result.filename}_result.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadAsMarkdown = () => {
    const markdown = `# OCR Result: ${result.filename}\n\n${result.full_text}`
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${result.filename}_extracted.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wide">Export Options</p>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <Button
          onClick={downloadAsText}
          variant="secondary"
          size="sm"
          className="w-full sm:w-auto text-xs sm:text-sm h-10 sm:h-11 shadow-sm hover:shadow-md transition-shadow"
        >
          <FileText className="w-4 h-4" />
          <span className="hidden sm:inline">Download TXT</span>
          <span className="sm:hidden">TXT</span>
        </Button>
        <Button
          onClick={downloadAsMarkdown}
          variant="secondary"
          size="sm"
          className="w-full sm:w-auto text-xs sm:text-sm h-10 sm:h-11 shadow-sm hover:shadow-md transition-shadow"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Download Markdown</span>
          <span className="sm:hidden">MD</span>
        </Button>
        <Button
          onClick={downloadAsJSON}
          variant="secondary"
          size="sm"
          className="w-full sm:w-auto text-xs sm:text-sm h-10 sm:h-11 shadow-sm hover:shadow-md transition-shadow"
        >
          <FileJson className="w-4 h-4" />
          <span className="hidden sm:inline">Download JSON</span>
          <span className="sm:hidden">JSON</span>
        </Button>
      </div>
    </div>
  )
}
