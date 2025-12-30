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
    <Card className="shadow-2xl animate-in fade-in duration-500">
      <CardHeader className="bg-linear-to-r from-lime-50 to-emerald-50 dark:from-lime-950/20 dark:to-emerald-950/20">
        <CardTitle className="text-lime-600 dark:text-lime-400 flex items-center gap-2 sm:gap-3 text-lg sm:text-xl lg:text-2xl">
          <div className="p-1.5 sm:p-2 rounded-lg bg-lime-500/20 dark:bg-lime-500/30">
            <Upload className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="truncate">Extract Text from Image</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="group border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-12 text-center hover:border-lime-500 dark:hover:border-lime-400 hover:bg-lime-50/50 dark:hover:bg-lime-950/20 transition-all duration-300 bg-linear-to-br from-slate-50/80 to-white dark:from-slate-800/50 dark:to-slate-800/30 backdrop-blur-sm shadow-inner cursor-pointer">
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
              <div className="p-3 sm:p-4 rounded-full bg-lime-500/10 dark:bg-lime-500/20 group-hover:bg-lime-500/20 dark:group-hover:bg-lime-500/30 transition-colors mb-3 sm:mb-4">
                <Upload className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-lime-600 dark:text-lime-400 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-sm sm:text-base lg:text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1 px-2">
                Click to select a file or drag and drop
              </span>
              <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                PNG, JPG, or PDF up to 10MB
              </span>
            </label>
            {selectedFile && (
              <div className="mt-4 sm:mt-6 p-2.5 sm:p-3 bg-lime-500/10 dark:bg-lime-500/20 rounded-lg border border-lime-500/30 animate-in slide-in-from-top duration-300">
                <p className="text-xs sm:text-sm font-semibold text-lime-700 dark:text-lime-300 break-all">
                  ✓ Selected: {selectedFile.name}
                </p>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={!selectedFile || mutation.isPending}
            className="w-full text-sm sm:text-base"
            size="lg"
            variant="primary"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                <span className="hidden sm:inline">Processing</span>
                <span className="sm:hidden">Processing</span>...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                Extract Text
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
