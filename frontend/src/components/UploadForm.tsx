import { AlertCircle, Loader2, Upload } from 'lucide-react'
import { useState } from 'react'
import { useExtractText } from '../hooks/useOCRMutation'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import ResultDisplay from './ResultDisplay'

export default function UploadForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const mutation = useExtractText()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (selectedFile) {
      mutation.mutate(selectedFile)
    }
  }

  return (
    <Card className="shadow-2xl shadow-slate-200/50 dark:shadow-none ring-1 ring-slate-200/50 dark:ring-slate-700/50 overflow-hidden">
      <CardHeader className="bg-linear-to-r from-lime-50 via-emerald-50 to-teal-50 dark:from-lime-950/30 dark:via-emerald-950/20 dark:to-teal-950/20 border-b border-lime-100 dark:border-lime-900/30">
        <CardTitle className="text-slate-800 dark:text-white flex items-center gap-3 text-lg sm:text-xl lg:text-2xl">
          <div className="p-2 sm:p-2.5 rounded-xl bg-linear-to-br from-lime-400 to-emerald-500 shadow-lg shadow-lime-500/25 ring-1 ring-white/20">
            <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <span className="font-bold">Extract Text</span>
            <span className="hidden sm:inline font-bold"> from Image</span>
            <p className="text-xs sm:text-sm font-normal text-slate-500 dark:text-slate-400 mt-0.5">Upload an image or PDF to extract text</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="group relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-8 sm:p-10 lg:p-14 text-center hover:border-lime-400 dark:hover:border-lime-500 hover:bg-linear-to-br hover:from-lime-50/50 hover:to-emerald-50/30 dark:hover:from-lime-950/20 dark:hover:to-emerald-950/10 transition-all duration-300 bg-linear-to-br from-slate-50/50 to-white dark:from-slate-800/30 dark:to-slate-800/20 shadow-inner cursor-pointer">
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
              className="cursor-pointer flex flex-col items-center"
            >
              <div className="relative p-5 sm:p-6 rounded-2xl bg-linear-to-br from-lime-100 to-emerald-100 dark:from-lime-900/40 dark:to-emerald-900/30 group-hover:from-lime-200 group-hover:to-emerald-200 dark:group-hover:from-lime-800/40 dark:group-hover:to-emerald-800/30 transition-all duration-300 mb-4 sm:mb-6 shadow-lg shadow-lime-200/50 dark:shadow-none ring-1 ring-lime-200/50 dark:ring-lime-700/30">
                <Upload className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-lime-600 dark:text-lime-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Drop your file here
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                or <span className="text-lime-600 dark:text-lime-400 font-medium hover:underline">browse files</span>
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 mt-2 px-4 py-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-full">
                Supports PNG, JPG, PDF up to 10MB
              </span>
            </label>
            {selectedFile && (
              <div className="mt-6 p-3 sm:p-4 bg-linear-to-r from-lime-50 to-emerald-50 dark:from-lime-950/30 dark:to-emerald-950/20 rounded-xl border border-lime-200 dark:border-lime-800/50 shadow-sm">
                <p className="text-sm font-semibold text-lime-700 dark:text-lime-300 break-all flex items-center gap-2">
                  <span className="p-1 bg-lime-500 rounded-full"><svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></span>
                  {selectedFile.name}
                </p>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={!selectedFile || mutation.isPending}
            className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold shadow-lg shadow-lime-500/25 hover:shadow-xl hover:shadow-lime-500/30 transition-all duration-300"
            size="lg"
            variant="primary"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                <span>Processing your file...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>Extract Text Now</span>
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

        {mutation.isSuccess && <ResultDisplay result={mutation.data} />}
      </CardContent>
    </Card>
  )
}
