import { AlertCircle, ArrowRight, CheckCircle, FileText, Info, Loader2, Upload, X } from 'lucide-react'
import { useState } from 'react'
import { useExtractText } from '../hooks/useOCRMutation'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import ResultDisplay from './ResultDisplay'

export default function UploadForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const mutation = useExtractText()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf']

      if (validTypes.includes(file.type)) {
        setSelectedFile(file)
      }
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (selectedFile) {
      mutation.mutate(selectedFile)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
      {/* Upload Section - Takes 2 columns */}
      <Card className="shadow-2xl shadow-slate-200/50 dark:shadow-none ring-1 ring-slate-200/50 dark:ring-slate-700/50 overflow-hidden lg:col-span-2">
        <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
          <CardTitle className="text-slate-800 dark:text-white text-base font-semibold">
            <span>Upload File</span>
            <p className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">Choose an image or PDF</p>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`group relative border-2 border-dashed rounded-2xl p-8 sm:p-10 lg:p-14 text-center transition-all duration-300 shadow-inner cursor-pointer ${isDragging
                ? 'border-lime-500 bg-lime-50/50 dark:bg-lime-950/20'
                : 'border-slate-300 dark:border-slate-600 hover:border-lime-400 dark:hover:border-lime-500 hover:bg-lime-50/30 dark:hover:bg-lime-950/10 bg-slate-50/50 dark:bg-slate-800/30'
                }`}
            >
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*,.pdf"
                className="hidden"
                id="file-input"
                required
              />
              <label
                htmlFor="file-input"
                className="cursor-pointer flex flex-col items-center pointer-events-none"
              >
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-lime-500/20 rounded-2xl blur-xl animate-pulse"></div>
                  <div className="relative p-6 rounded-2xl bg-linear-to-br from-lime-500/10 to-emerald-500/10 border-2 border-lime-500/30">
                    <Upload className="w-16 h-16 text-lime-600 dark:text-lime-400" />
                  </div>
                </div>
                <span className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  Drop your file here
                </span>
                <span className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                  or <span className="text-lime-600 dark:text-lime-400 font-semibold underline decoration-2 underline-offset-4">browse files</span>
                </span>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700">
                  <Info className="w-4 h-4 text-slate-500" />
                  <span className="text-xs text-slate-600 dark:text-slate-400">PNG, JPG, PDF • Max 10MB</span>
                </div>
              </label>
              {selectedFile && (
                <div className="mt-8 p-4 bg-linear-to-r from-lime-50 via-emerald-50 to-teal-50 dark:from-lime-950/40 dark:via-emerald-950/30 dark:to-teal-950/40 rounded-xl border-2 border-lime-500/40 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-lime-500 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{selectedFile.name}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="shrink-0 p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={!selectedFile || mutation.isPending}
              className="w-full h-12"
              size="lg"
              variant="outline"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Extract Text</span>
                  <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </>
              )}
            </Button>
          </form>

          {mutation.isError && (
            <div className="mt-4 p-4 bg-red-500/10 dark:bg-red-500/20 border border-red-500/40 text-red-600 dark:text-red-400 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">Error</p>
                  <p className="text-sm">{mutation.error.message}</p>
                  <Button
                    onClick={() => mutation.reset()}
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section - Takes 3 columns */}
      <div className="lg:col-span-3">
        {mutation.isSuccess && <ResultDisplay result={mutation.data} />}

        {!mutation.isSuccess && !mutation.isPending && (
          <Card className="shadow-xl shadow-slate-200/50 dark:shadow-none ring-1 ring-slate-200/50 dark:ring-slate-700/50 overflow-hidden h-full flex flex-col">
            <CardContent className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 rounded-3xl blur-2xl opacity-50"></div>
                <div className="relative p-8 rounded-3xl bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-800/50 dark:to-slate-700/30 border border-slate-300 dark:border-slate-600">
                  <FileText className="w-20 h-20 text-slate-400 dark:text-slate-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                Ready to Extract Text
              </h3>
              <p className="text-base text-slate-600 dark:text-slate-400 max-w-md mb-8">
                Upload a document and watch as we extract the text in seconds
              </p>
              <div className="grid grid-cols-3 gap-4 w-full max-w-md">
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <svg className="w-6 h-6 text-lime-600 dark:text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Fast</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <svg className="w-6 h-6 text-lime-600 dark:text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Accurate</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <svg className="w-6 h-6 text-lime-600 dark:text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Secure</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div >
  )
}
