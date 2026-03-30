import { formatGold } from '@/utils/gold'
import { cn } from '@/utils/cn'

interface GoldDisplayProps {
  copper: number
  compact?: boolean
  className?: string
  showSign?: boolean
}

export function GoldDisplay({ copper, compact = false, className, showSign }: GoldDisplayProps) {
  const isPositive = copper > 0
  const isNegative = copper < 0
  const absCopper = Math.abs(copper)
  const formatted = formatGold(absCopper, compact)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 font-mono text-sm font-medium',
        isPositive && showSign && 'text-emerald-400',
        isNegative && 'text-red-400',
        !showSign && 'text-wow-gold',
        className
      )}
    >
      {showSign && isPositive && '+'}
      {isNegative && '-'}
      <span className="text-wow-gold">{formatted}</span>
    </span>
  )
}

/** Inline gold coin icon + amount */
export function GoldBadge({ copper, compact = true }: { copper: number; compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 bg-wow-gold/10 border border-wow-gold/20 text-wow-gold text-sm font-medium font-mono">
      <span className="text-xs">🪙</span>
      {formatGold(copper, compact)}
    </span>
  )
}
