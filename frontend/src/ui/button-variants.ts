import { cva, type VariantProps } from 'class-variance-authority'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-lime-500/20 text-lime-400 border border-lime-500/40 hover:bg-lime-500/30 hover:border-lime-500/60',
        primary: 'bg-lime-500/20 text-lime-400 border border-lime-500/40 hover:bg-lime-500/30 hover:border-lime-500/60',
        destructive: 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 hover:border-red-500/60',
        outline:
          'bg-slate-500/10 dark:bg-slate-700/30 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-500/20 dark:hover:bg-slate-600/40 hover:border-slate-400 dark:hover:border-slate-500',
        secondary:
          'bg-slate-200 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-300 dark:hover:bg-slate-600/50',
        ghost:
          'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200',
        link: 'text-lime-600 dark:text-lime-400 underline-offset-4 hover:underline hover:text-lime-700 dark:hover:text-lime-300',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 px-4 py-1.5 text-xs',
        lg: 'h-12 px-8 py-3 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export type ButtonVariantProps = VariantProps<typeof buttonVariants>
