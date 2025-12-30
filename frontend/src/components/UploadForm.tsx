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
    <Card>
      <CardHeader>
        <CardTitle className="text-lime-500 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Extract Text from Image
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center hover:border-lime-500/50 dark:hover:border-lime-500/50 transition-colors bg-slate-50/50 dark:bg-slate-800/30 backdrop-blur-sm">
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
              <Upload className="w-12 h-12 text-slate-400 dark:text-slate-500 mb-3" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Click to select a file or drag and drop
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                PNG, JPG, or PDF up to 10MB
              </span>
            </label>
            {selectedFile && (
              <p className="mt-4 text-sm font-medium text-lime-600 dark:text-lime-400">
                Selected: {selectedFile.name}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={!selectedFile || mutation.isPending}
            className="w-full"
            size="lg"
            variant="primary"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
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
