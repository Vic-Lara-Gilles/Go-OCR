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
      <div className="min-h-screen flex flex-col bg-linear-to-br from-slate-100 via-white to-lime-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        {/* Decorative background elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-lime-400/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-40 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-lime-300/15 rounded-full blur-3xl" />
        </div>

        <header className="sticky top-0 z-50 border-b border-slate-200/80 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl shadow-lg shadow-slate-200/50 dark:shadow-none">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative p-2.5 sm:p-3 rounded-xl bg-linear-to-br from-lime-400 via-lime-500 to-emerald-600 shadow-lg shadow-lime-500/30 ring-1 ring-white/20">
                  <Scan className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white drop-shadow-sm" />
                  <div className="absolute inset-0 rounded-xl bg-linear-to-t from-black/20 to-transparent" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                    OCR System
                  </h1>
                  <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 hidden sm:block">
                    Powered by <span className="text-lime-600 dark:text-lime-400">Go</span> + Tesseract
                  </p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <span className="px-3 py-1.5 text-xs font-semibold bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-300 rounded-full ring-1 ring-lime-500/20">
                  v1.0
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 max-w-4xl">
          <UploadForm />
        </main>

        <footer className="border-t border-slate-200/80 dark:border-slate-700/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl py-6 sm:py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Built with <span className="text-lime-600 dark:text-lime-400 font-semibold">Go</span>, Tesseract, React & TanStack Query
              </p>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 dark:text-slate-500">2024 OCR System</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App

