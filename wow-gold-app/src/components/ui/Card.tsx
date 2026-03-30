import { cn } from '@/utils/cn'
import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  glowing?: boolean
  onClick?: () => void
  hover?: boolean
  variant?: 'default' | 'arcane' | 'gold'
}

export function Card({ children, className, glowing, onClick, hover = false, variant = 'default' }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl border p-4 transition-all duration-200',
        variant === 'default' && 'bg-wow-card border-wow-border hover:border-wow-gold/20',
        variant === 'arcane'  && 'bg-gradient-to-br from-wow-arcane/8 via-wow-card to-wow-card border-wow-arcane/25 hover:border-wow-arcane/40',
        variant === 'gold'    && 'bg-gradient-to-br from-wow-gold/6 via-wow-card to-wow-card border-wow-gold/25 hover:border-wow-gold/45',
        hover  && 'cursor-pointer hover:border-wow-gold/35 hover:shadow-gold-sm hover:bg-wow-cardHover',
        glowing && 'animate-pulse-gold border-wow-gold/30',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, icon, className }: { children: ReactNode; icon?: string; className?: string }) {
  return (
    <h3 className={cn('flex items-center gap-2 text-sm font-semibold text-slate-200 font-wow tracking-wide', className)}>
      {icon && <span className="text-base leading-none opacity-80">{icon}</span>}
      {children}
    </h3>
  )
}

export function CardDivider() {
  return <div className="my-3 h-px bg-gradient-to-r from-transparent via-wow-border to-transparent" />
}
