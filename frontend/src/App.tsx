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
      <div className="min-h-screen flex flex-col bg-linear-to-br from-slate-50 via-lime-50/20 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <header className="sticky top-0 z-50 border-b border-slate-200/50 dark:border-slate-700/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-lg">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl bg-linear-to-br from-lime-400 to-lime-600 shadow-lg shadow-lime-500/20">
                <Scan className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold bg-linear-to-r from-slate-900 via-lime-700 to-slate-900 dark:from-white dark:via-lime-400 dark:to-white bg-clip-text text-transparent truncate">
                  OCR System
                </h1>
                <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hidden sm:block">
                  Go + Tesseract powered text extraction
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-7xl">
          <UploadForm />
        </main>

        <footer className="border-t border-slate-200/50 dark:border-slate-700/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl py-4 sm:py-6 text-center px-4">
          <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
            Powered by <span className="text-lime-600 dark:text-lime-400 font-semibold">Go</span> + Tesseract + React + TanStack Query
          </p>
        </footer>
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App

