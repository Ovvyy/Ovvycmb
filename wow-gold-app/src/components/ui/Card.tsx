import { cn } from '@/utils/cn'
import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  glowing?: boolean
  onClick?: () => void
  hover?: boolean
}

export function Card({ children, className, glowing, onClick, hover = false }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl bg-wow-card border border-wow-border p-4',
        'transition-all duration-200',
        hover && 'cursor-pointer hover:border-wow-gold/40 hover:shadow-gold-sm',
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
    <div className={cn('flex items-center justify-between mb-4', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, icon, className }: { children: ReactNode; icon?: string; className?: string }) {
  return (
    <h3 className={cn('flex items-center gap-2 text-base font-semibold text-white font-wow', className)}>
      {icon && <span>{icon}</span>}
      {children}
    </h3>
  )
}
