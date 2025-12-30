import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Scan } from 'lucide-react'
import UploadForm from './components/UploadForm'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col bg-linear-to-br from-slate-50 via-slate-100 to-lime-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-lime-500/20 border border-lime-500/40">
                <Scan className="w-6 h-6 text-lime-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  OCR System
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Go + Tesseract powered text extraction
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
          <UploadForm />
        </main>

        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md py-6 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Powered by Go + Tesseract + React + TanStack Query
          </p>
        </footer>
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App

