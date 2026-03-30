import { cn } from '@/utils/cn'
import type { ReactNode } from 'react'

type BadgeVariant = 'gold' | 'profit' | 'loss' | 'neutral' | 'blue' | 'purple' | 'orange' | 'gray' | 'arcane' | 'teal'

const VARIANTS: Record<BadgeVariant, string> = {
  gold:    'bg-wow-gold/12 text-wow-gold border-wow-gold/25',
  profit:  'bg-wow-green/12 text-wow-green border-wow-green/25',
  loss:    'bg-wow-red/12 text-wow-red border-wow-red/25',
  neutral: 'bg-slate-500/12 text-slate-400 border-slate-500/20',
  blue:    'bg-wow-blue/12 text-wow-blue border-wow-blue/25',
  purple:  'bg-wow-purple/12 text-wow-purple border-wow-purple/25',
  arcane:  'bg-wow-arcane/12 text-wow-arcaneLight border-wow-arcane/25',
  orange:  'bg-wow-orange/12 text-wow-orange border-wow-orange/25',
  teal:    'bg-wow-teal/12 text-wow-teal border-wow-teal/25',
  gray:    'bg-slate-700/40 text-slate-400 border-slate-600/25',
}

export function Badge({ children, variant = 'neutral', className }: { children: ReactNode; variant?: BadgeVariant; className?: string }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium border tracking-wide',
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
        <span key={i} className={i < rating ? 'text-wow-gold' : 'text-wow-border'}>★</span>
      ))}
    </span>
  )
}

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    beginner:     { label: 'Débutant',      variant: 'profit' },
    intermediate: { label: 'Intermédiaire', variant: 'gold' },
    advanced:     { label: 'Avancé',        variant: 'loss' },
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
