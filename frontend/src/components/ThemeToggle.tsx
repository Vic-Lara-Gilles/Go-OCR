

import { Monitor, Moon, Sun } from 'lucide-react'
import { useRef } from 'react'
import { useTheme } from '../hooks/useTheme'



// Componente desacoplado para el icono
type Theme = 'light' | 'dark' | 'system'
function ThemeIcon({ theme }: { theme: Theme }) {
  if (theme === 'light') return <Sun size={16} className="transition-transform duration-300 rotate-0" key="sun" />
  if (theme === 'dark') return <Moon size={16} className="transition-transform duration-300 rotate-180" key="moon" />
  // system
  return <Monitor size={16} className="transition-transform duration-300" key="monitor" />
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const tooltipId = 'theme-toggle-tooltip'
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Determinar el icono a mostrar según el tema efectivo
  let effectiveTheme: Theme = theme
  if (theme === 'system' && typeof window !== 'undefined') {
    effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  // Accesibilidad: aria-label y aria-describedby
  const ariaLabel = theme === 'light'
    ? 'Cambiar a tema oscuro'
    : theme === 'dark'
      ? 'Cambiar a modo automático'
      : 'Cambiar a tema claro'

  // Tooltip accesible
  const tooltipText =
    theme === 'light' ? 'Tema claro (click para oscuro)'
    : theme === 'dark' ? 'Tema oscuro (click para automático)'
    : 'Tema automático (click para claro)'

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleTheme}
        aria-label={ariaLabel}
        aria-describedby={tooltipId}
        className="h-8 w-8 rounded-full bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-300/50 dark:hover:bg-slate-700/50 transition-all duration-200 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <span className="inline-block transition-transform duration-300" key={effectiveTheme}>
          <ThemeIcon theme={effectiveTheme} />
        </span>
      </button>
      <span
        id={tooltipId}
        role="tooltip"
        className="absolute left-0 mt-2 px-2 py-1 rounded bg-slate-700 text-white text-xs opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 pointer-events-none z-50"
        style={{ position: 'absolute', left: '-9999px' }}
        // El tooltip solo es visible para lectores de pantalla
      >
        {tooltipText}
      </span>
    </>
  )
}
