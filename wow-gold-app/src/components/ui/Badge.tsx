import { cn } from '@/utils/cn'
import type { ReactNode } from 'react'

type BadgeVariant = 'gold' | 'profit' | 'loss' | 'neutral' | 'blue' | 'purple' | 'orange' | 'gray'

const VARIANTS: Record<BadgeVariant, string> = {
  gold:    'bg-wow-gold/15 text-wow-gold border-wow-gold/30',
  profit:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  loss:    'bg-red-500/15 text-red-400 border-red-500/30',
  neutral: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  blue:    'bg-blue-500/15 text-blue-400 border-blue-500/30',
  purple:  'bg-purple-500/15 text-purple-400 border-purple-500/30',
  orange:  'bg-orange-500/15 text-orange-400 border-orange-500/30',
  gray:    'bg-slate-700/50 text-slate-400 border-slate-600/30',
}

export function Badge({ children, variant = 'neutral', className }: { children: ReactNode; variant?: BadgeVariant; className?: string }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border',
      VARIANTS[variant],
      className
    )}>
      {children}
    </span>
  )
}

export function RatingStars({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < rating ? 'text-wow-gold' : 'text-wow-border'}>
          ★
        </span>
      ))}
    </span>
  )
}

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    beginner:     { label: 'Débutant',     variant: 'profit' },
    intermediate: { label: 'Intermédiaire', variant: 'gold' },
    advanced:     { label: 'Avancé',       variant: 'loss' },
  }
  const d = map[difficulty] ?? { label: difficulty, variant: 'neutral' }
  return <Badge variant={d.variant}>{d.label}</Badge>
}

export function QualityBadge({ quality }: { quality: string }) {
  const qualityMap: Record<string, BadgeVariant> = {
    poor: 'gray', common: 'neutral', uncommon: 'profit',
    rare: 'blue', epic: 'purple', legendary: 'orange', artifact: 'gold',
  }
  const labels: Record<string, string> = {
    poor: 'Médiocre', common: 'Commun', uncommon: 'Peu commun',
    rare: 'Rare', epic: 'Épique', legendary: 'Légendaire', artifact: 'Artefact',
  }
  return <Badge variant={qualityMap[quality] ?? 'neutral'}>{labels[quality] ?? quality}</Badge>
}
