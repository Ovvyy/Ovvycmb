/**
 * Signal indicators — Buy/Sell/Hold visual badges
 */
import { cn } from '@/utils/cn'
import type { SignalType } from '@/engine/market-intelligence'

const SIGNAL_CONFIG: Record<SignalType, { label: string; color: string; bg: string; icon: string }> = {
  strong_buy:  { label: 'ACHAT FORT',  color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/40', icon: '🟢' },
  buy:         { label: 'ACHAT',       color: 'text-emerald-300', bg: 'bg-emerald-500/10 border-emerald-500/25', icon: '🟢' },
  hold:        { label: 'ATTENTE',     color: 'text-yellow-400',  bg: 'bg-yellow-500/10 border-yellow-500/25',   icon: '🟡' },
  sell:        { label: 'VENTE',       color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/25',         icon: '🔴' },
  strong_sell: { label: 'VENTE FORTE', color: 'text-red-500',     bg: 'bg-red-500/20 border-red-500/40',         icon: '🔴' },
}

export function SignalBadge({ signal, size = 'md' }: { signal: SignalType; size?: 'sm' | 'md' | 'lg' }) {
  const cfg = SIGNAL_CONFIG[signal]
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-lg border font-bold tracking-wide',
      cfg.bg, cfg.color,
      size === 'sm' && 'px-2 py-0.5 text-[10px]',
      size === 'md' && 'px-3 py-1 text-xs',
      size === 'lg' && 'px-4 py-1.5 text-sm',
    )}>
      <span>{cfg.icon}</span>
      {cfg.label}
    </span>
  )
}

export function SignalDot({ signal }: { signal: SignalType }) {
  const colors: Record<SignalType, string> = {
    strong_buy: 'bg-emerald-400 shadow-emerald-400/50',
    buy: 'bg-emerald-300',
    hold: 'bg-yellow-400',
    sell: 'bg-red-400',
    strong_sell: 'bg-red-500 shadow-red-500/50',
  }
  return (
    <span className={cn(
      'inline-block w-2.5 h-2.5 rounded-full',
      colors[signal],
      (signal === 'strong_buy' || signal === 'strong_sell') && 'animate-pulse shadow-lg'
    )} />
  )
}

export function FlipSignalBadge({ signal }: { signal: 'strong_flip' | 'flip' | 'risky_flip' | 'avoid' }) {
  const cfg = {
    strong_flip: { label: 'FLIP FORT', color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/40', icon: '🎯' },
    flip:        { label: 'FLIP',      color: 'text-emerald-300', bg: 'bg-emerald-500/10 border-emerald-500/25', icon: '📈' },
    risky_flip:  { label: 'RISQUÉ',    color: 'text-orange-400',  bg: 'bg-orange-500/10 border-orange-500/25',   icon: '⚠️' },
    avoid:       { label: 'ÉVITER',    color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/25',         icon: '🚫' },
  }[signal]
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-lg border font-bold tracking-wide px-3 py-1 text-xs',
      cfg.bg, cfg.color,
    )}>
      <span>{cfg.icon}</span>
      {cfg.label}
    </span>
  )
}
