import { useState } from 'react'
import { PageWrapper, Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Badge, DifficultyBadge, RatingStars } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { GoldBadge } from '@/components/ui/GoldDisplay'
import { GOLD_STRATEGIES, STRATEGY_CATEGORIES } from '@/data/strategies'
import { PROFESSION_COLORS } from '@/data/professions'
import { formatGold } from '@/utils/gold'
import type { GoldStrategy, StrategyCategory } from '@/types'

function StrategyCard({ s, onClick, expanded }: { s: GoldStrategy; onClick: () => void; expanded: boolean }) {
  const catColor: Record<string, string> = {
    crafting: 'blue', farming: 'profit', flipping: 'gold',
    gathering: 'profit', service: 'purple', passive: 'gray',
  }

  return (
    <Card
      hover
      onClick={onClick}
      className={`transition-all duration-200 ${expanded ? 'border-wow-gold/40 bg-wow-gold/4' : ''}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <span className="text-3xl flex-shrink-0">{s.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-base leading-snug">{s.title}</h3>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <Badge variant={catColor[s.category] as any}>{s.category}</Badge>
            <DifficultyBadge difficulty={s.difficulty} />
            {s.professions?.slice(0, 2).map((p) => (
              <span
                key={p}
                className="text-xs px-1.5 py-0.5 rounded font-medium"
                style={{
                  background: `${PROFESSION_COLORS[p]}22`,
                  color: PROFESSION_COLORS[p],
                  border: `1px solid ${PROFESSION_COLORS[p]}44`,
                }}
              >
                {p}
              </span>
            ))}
            {(s.professions?.length ?? 0) > 2 && (
              <Badge variant="neutral">+{(s.professions?.length ?? 0) - 2}</Badge>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <RatingStars rating={s.goldRating} />
          <p className="text-[10px] text-slate-500 mt-1">{s.expansion}</p>
        </div>
      </div>

      <p className="text-sm text-slate-400 leading-relaxed mb-3">{s.description}</p>

      <div className="flex items-center justify-between">
        <GoldBadge copper={s.estimatedGoldPerHour * 10000} />
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600">/ heure</span>
          <Button variant="ghost" size="sm">
            {expanded ? '▲ Moins' : '▼ Voir guide'}
          </Button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-wow-border/50 space-y-4">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase mb-2">📋 Étapes</p>
            <ol className="space-y-2">
              {s.steps.map((step, i) => (
                <li key={i} className="flex gap-2.5 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-wow-gold/15 text-wow-gold text-xs flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
                  <span className="text-slate-300 leading-snug">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase mb-2">💡 Conseils Pro</p>
            <ul className="space-y-1.5">
              {s.tips.map((tip, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-400">
                  <span className="text-wow-gold flex-shrink-0">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {s.requiredItems && s.requiredItems.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase mb-2">🎯 Prérequis</p>
              <div className="flex flex-wrap gap-1.5">
                {s.requiredItems.map((req, i) => (
                  <Badge key={i} variant="neutral">{req}</Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase mb-2">🏷️ Tags</p>
            <div className="flex flex-wrap gap-1">
              {s.tags.map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded bg-wow-border/50 text-slate-500">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

export function Strategies() {
  const [category, setCategory] = useState<StrategyCategory | 'all'>('all')
  const [difficulty, setDifficulty] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'gold' | 'rating' | 'difficulty'>('gold')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const DIFFICULTIES = [
    { id: 'all', label: 'Tous niveaux' },
    { id: 'beginner', label: 'Débutant' },
    { id: 'intermediate', label: 'Intermédiaire' },
    { id: 'advanced', label: 'Avancé' },
  ]

  const filtered = GOLD_STRATEGIES
    .filter((s) => {
      if (category !== 'all' && s.category !== category) return false
      if (difficulty !== 'all' && s.difficulty !== difficulty) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'gold')       return b.estimatedGoldPerHour - a.estimatedGoldPerHour
      if (sortBy === 'rating')     return b.goldRating - a.goldRating
      if (sortBy === 'difficulty') {
        const d: Record<string, number> = { beginner: 0, intermediate: 1, advanced: 2 }
        return d[a.difficulty] - d[b.difficulty]
      }
      return 0
    })

  const totalEstimated = filtered.reduce((s, f) => s + f.estimatedGoldPerHour, 0)

  return (
    <PageWrapper>
      <Header
        title="Stratégies Gold"
        subtitle={`${filtered.length} stratégies · Potentiel combiné: ${formatGold(totalEstimated * 10000, true)}/h`}
      />

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {STRATEGY_CATEGORIES.map((c) => (
          <Button
            key={c.id}
            variant={category === c.id ? 'gold' : 'outline'}
            size="sm"
            onClick={() => setCategory(c.id as any)}
          >
            {c.icon} {c.label}
          </Button>
        ))}
      </div>

      {/* Sub-filters */}
      <Card className="mb-6 p-3 flex flex-wrap items-center gap-4">
        <div className="flex gap-1">
          {DIFFICULTIES.map((d) => (
            <Button
              key={d.id}
              variant={difficulty === d.id ? 'outline' : 'ghost'}
              size="sm"
              onClick={() => setDifficulty(d.id)}
            >
              {d.label}
            </Button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
          <span>Trier par:</span>
          <Button size="sm" variant={sortBy === 'gold' ? 'outline' : 'ghost'} onClick={() => setSortBy('gold')}>💰 Or/h</Button>
          <Button size="sm" variant={sortBy === 'rating' ? 'outline' : 'ghost'} onClick={() => setSortBy('rating')}>⭐ Note</Button>
          <Button size="sm" variant={sortBy === 'difficulty' ? 'outline' : 'ghost'} onClick={() => setSortBy('difficulty')}>📊 Difficulté</Button>
        </div>
      </Card>

      {/* Strategy grid */}
      {filtered.length === 0 ? (
        <Card className="text-center py-16">
          <p className="text-slate-500">Aucune stratégie pour ces filtres</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filtered.map((s) => (
            <StrategyCard
              key={s.id}
              s={s}
              expanded={expandedId === s.id}
              onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
            />
          ))}
        </div>
      )}
    </PageWrapper>
  )
}
