import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { FileText } from 'lucide-react'
import { ThemeToggle } from './components/ThemeToggle'
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
      <div className="min-h-screen flex flex-col bg-background">
        {/* Decorative background elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-primary/15 rounded-full blur-3xl" />
        </div>

        <header className="h-12 bg-card/80 backdrop-blur-sm border-b border-border flex items-center select-none shadow-sm">
          <div className="w-full h-full flex items-center justify-between px-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 rounded-lg bg-primary/20 border border-primary/40">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-base font-semibold text-foreground">
                  OCR System
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden md:inline-block px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded border border-primary/20">
                v1.0
              </span>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="flex-1 w-full overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                  Transform Images into Editable Text
                </h2>
                <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                  Upload any document, screenshot, or image and extract text instantly
                </p>
              </div>
              <UploadForm />
            </div>
          </div>
        </main>

        <footer className="border-t border-border bg-card/60 backdrop-blur-sm py-3">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center">
              <p className="text-xs text-muted-foreground">
                Built with <span className="text-primary font-medium">Go</span>, Tesseract & React
              </p>
            </div>
          </div>
        </footer>
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
