import { cn } from '@/utils/cn'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type BtnVariant = 'gold' | 'outline' | 'ghost' | 'danger' | 'success'
type BtnSize    = 'sm' | 'md' | 'lg'

const VARIANTS: Record<BtnVariant, string> = {
  gold:    'bg-gradient-to-r from-wow-goldDark via-wow-gold to-wow-goldLight text-wow-bg font-semibold shadow-gold-sm hover:shadow-gold hover:scale-[1.02]',
  outline: 'border border-wow-border text-slate-300 hover:border-wow-gold/50 hover:text-white',
  ghost:   'text-slate-400 hover:text-white hover:bg-white/5',
  danger:  'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25',
  success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25',
}

const SIZES: Record<BtnSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2.5',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant
  size?: BtnSize
  icon?: ReactNode
  children?: ReactNode
  loading?: boolean
}

export function Button({ variant = 'outline', size = 'md', icon, children, loading, className, disabled, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-150',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon}
      {children}
    </button>
  )
}
