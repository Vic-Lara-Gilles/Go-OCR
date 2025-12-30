import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun size={16} />
      case 'dark':
        return <Moon size={16} />
      default:
        return <Monitor size={16} />
    }
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="h-8 w-8 rounded-full bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-300/50 dark:hover:bg-slate-700/50 transition-all duration-200 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 shadow-sm"
      title={`Theme: ${theme} (click to cycle)`}
    >
      {getIcon()}
    </button>
  )
}
