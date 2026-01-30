
import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'


export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  // Optimizado: icono como constante
  const icon =
    theme === 'light' ? <Sun size={16} className="transition-transform duration-300 rotate-0" key="sun" /> :
    theme === 'dark' ? <Moon size={16} className="transition-transform duration-300 rotate-180" key="moon" /> :
    <Monitor size={16} className="transition-transform duration-300" key="monitor" />

  // Accesibilidad: aria-label y aria-pressed
  const ariaLabel = theme === 'light'
    ? 'Cambiar a tema oscuro'
    : theme === 'dark'
      ? 'Cambiar a tema automático'
      : 'Cambiar a tema claro'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={ariaLabel}
      aria-pressed={theme === 'dark'}
      className="h-8 w-8 rounded-full bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-300/50 dark:hover:bg-slate-700/50 transition-all duration-200 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      title={`Theme: ${theme} (click to cycle)`}
    >
      <span className="inline-block transition-transform duration-300" key={theme}>
        {icon}
      </span>
    </button>
  )
}
