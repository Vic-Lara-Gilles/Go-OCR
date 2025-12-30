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
    <div className="flex gap-2 my-4 flex-wrap">
      <Button onClick={downloadAsText} variant="primary" size="sm">
        <FileText className="w-4 h-4" />
        Download TXT
      </Button>
      <Button onClick={downloadAsMarkdown} variant="primary" size="sm">
        <Download className="w-4 h-4" />
        Download Markdown
      </Button>
      <Button onClick={downloadAsJSON} variant="primary" size="sm">
        <FileJson className="w-4 h-4" />
        Download JSON
      </Button>
    </div>
  )
}
