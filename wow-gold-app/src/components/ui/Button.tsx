import { cn } from '@/utils/cn'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type BtnVariant = 'gold' | 'outline' | 'ghost' | 'danger' | 'success' | 'arcane'
type BtnSize    = 'sm' | 'md' | 'lg'

const VARIANTS: Record<BtnVariant, string> = {
  gold:    'bg-gradient-to-r from-wow-goldDark via-wow-gold to-wow-goldLight text-wow-bg font-semibold shadow-gold-sm hover:shadow-gold hover:scale-[1.02] active:scale-[0.99]',
  arcane:  'bg-gradient-to-r from-wow-arcane to-wow-arcaneLight text-white font-semibold hover:opacity-90 hover:scale-[1.02]',
  outline: 'border border-wow-border text-slate-300 hover:border-wow-gold/40 hover:text-slate-100 hover:bg-white/[0.03]',
  ghost:   'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]',
  danger:  'bg-wow-red/12 text-wow-red border border-wow-red/25 hover:bg-wow-red/20 hover:border-wow-red/40',
  success: 'bg-wow-green/12 text-wow-green border border-wow-green/25 hover:bg-wow-green/20',
}

const SIZES: Record<BtnSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm rounded-xl gap-2',
  lg: 'px-6 py-2.5 text-base rounded-xl gap-2.5',
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
        'inline-flex items-center justify-center font-medium transition-all duration-150 select-none',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
    >
      {loading
        ? <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        : icon}
      {children}
    </button>
  )
}
