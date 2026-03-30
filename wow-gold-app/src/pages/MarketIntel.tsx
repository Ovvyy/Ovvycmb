/**
 * Market Intelligence Page — Deep analysis of all tracked items
 * Shows scores, signals, patterns, trends for every item
 */
import { useState, useMemo } from 'react'
import { PageWrapper, Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { GoldDisplay } from '@/components/ui/GoldDisplay'
import { SignalBadge, SignalDot } from '@/components/ui/Signal'
import { ScoreGauge, ScoreBar } from '@/components/ui/ScoreGauge'
import { SparkLine } from '@/components/ui/SparkLine'
import { generateMockItemData } from '@/data/mock-engine'
import { rankAllOpportunities, type RankedOpportunity } from '@/engine/opportunity-ranker'
import { formatGold } from '@/utils/gold'
import { cn } from '@/utils/cn'
import { useAlertStore } from '@/alerts/alert-store'
import { wowheadUrl } from '@/data/items'

type SortKey = 'score' | 'roi' | 'profit' | 'volume' | 'risk'
type FilterSignal = 'all' | 'strong_buy' | 'buy' | 'hold' | 'sell'

export function MarketIntel() {
  const [sortBy, setSortBy] = useState<SortKey>('score')
  const [filterSignal, setFilterSignal] = useState<FilterSignal>('all')
  const [selectedItem, setSelectedItem] = useState<RankedOpportunity | null>(null)
  const { addToWatchlist, isWatched, removeFromWatchlist } = useAlertStore()

  const opportunities = useMemo(() => {
    const items = generateMockItemData()
    return rankAllOpportunities(items)
  }, [])

  const filtered = useMemo(() => {
    let list = [...opportunities]
    if (filterSignal !== 'all') list = list.filter(o => o.signal === filterSignal)
    switch (sortBy) {
      case 'roi': list.sort((a, b) => b.roi - a.roi); break
      case 'profit': list.sort((a, b) => b.estimatedProfit - a.estimatedProfit); break
      case 'volume': list.sort((a, b) => b.volume - a.volume); break
      case 'risk': list.sort((a, b) => b.riskScore - a.riskScore); break
      default: list.sort((a, b) => b.overallScore - a.overallScore)
    }
    return list
  }, [opportunities, sortBy, filterSignal])

  const detail = selectedItem ?? opportunities[0]

  return (
    <PageWrapper>
      <Header
        title="Market Intelligence"
        subtitle="Analyse approfondie de tous les items trackés"
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500">Signal:</span>
          {(['all', 'strong_buy', 'buy', 'hold', 'sell'] as FilterSignal[]).map(f => (
            <Button
              key={f}
              variant={filterSignal === f ? 'gold' : 'ghost'}
              size="sm"
              onClick={() => setFilterSignal(f)}
            >
              {f === 'all' ? 'Tous' : f === 'strong_buy' ? '🟢 Fort' : f === 'buy' ? '🟢 Achat' : f === 'hold' ? '🟡 Attente' : '🔴 Vente'}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-xs text-slate-500">Trier:</span>
          {([['score', 'Score'], ['roi', 'ROI'], ['profit', 'Profit'], ['volume', 'Volume'], ['risk', 'Sécurité']] as [SortKey, string][]).map(([key, label]) => (
            <Button
              key={key}
              variant={sortBy === key ? 'gold' : 'ghost'}
              size="sm"
              onClick={() => setSortBy(key)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Item List */}
        <div className="xl:col-span-2 space-y-2">
          {filtered.map(opp => (
            <Card
              key={opp.itemId}
              hover
              onClick={() => setSelectedItem(opp)}
              className={cn(
                'p-3 cursor-pointer',
                detail?.itemId === opp.itemId && 'border-wow-gold/40 bg-wow-gold/5'
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  <ScoreGauge score={opp.overallScore} size={44} />
                  <span className="text-[9px] text-slate-600">#{opp.rank}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <a href={wowheadUrl(opp.itemId)} target="_blank" rel="noopener noreferrer"
                       className="text-sm font-medium text-white hover:text-wow-gold transition-colors truncate"
                       onClick={e => e.stopPropagation()}>
                      {opp.itemName}
                    </a>
                    <SignalDot signal={opp.signal} />
                    <Badge variant={opp.type === 'craft' ? 'blue' : opp.type === 'snipe' ? 'purple' : opp.type === 'flip' ? 'gold' : 'gray'}>
                      {opp.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>Prix: {formatGold(opp.currentPrice, true)}</span>
                    <span>→ {formatGold(opp.targetPrice, true)}</span>
                    <span className="text-emerald-400">+{opp.roi}% ROI</span>
                    <span>Vol: {opp.volume}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <SparkLine data={[
                    opp.currentPrice * 0.92, opp.currentPrice * 0.95,
                    opp.currentPrice * 1.01, opp.currentPrice * 0.97,
                    opp.currentPrice * 1.03, opp.currentPrice
                  ]} width={60} height={20} />
                  <div className="text-right">
                    <GoldDisplay copper={opp.estimatedProfit} showSign compact />
                    <SignalBadge signal={opp.signal} size="sm" />
                  </div>
                </div>
              </div>
              {/* Score bars */}
              <div className="grid grid-cols-3 gap-3 mt-3">
                <ScoreBar score={opp.profitScore} label="Profit" />
                <ScoreBar score={opp.speedScore} label="Vitesse" />
                <ScoreBar score={opp.riskScore} label="Sécurité" />
              </div>
            </Card>
          ))}
        </div>

        {/* Detail Panel */}
        {detail && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle icon="🔍">{detail.itemName}</CardTitle>
                <SignalBadge signal={detail.signal} />
              </CardHeader>

              <div className="flex justify-center mb-4">
                <ScoreGauge score={detail.overallScore} label="Score Global" size={80} />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center p-2 rounded-lg bg-wow-surface/50">
                  <p className="text-[10px] text-slate-500">Prix actuel</p>
                  <p className="text-sm font-mono text-wow-gold">{formatGold(detail.currentPrice, true)}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-wow-surface/50">
                  <p className="text-[10px] text-slate-500">Prix cible</p>
                  <p className="text-sm font-mono text-emerald-400">{formatGold(detail.targetPrice, true)}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-wow-surface/50">
                  <p className="text-[10px] text-slate-500">Profit estimé</p>
                  <GoldDisplay copper={detail.estimatedProfit} showSign compact />
                </div>
                <div className="text-center p-2 rounded-lg bg-wow-surface/50">
                  <p className="text-[10px] text-slate-500">ROI</p>
                  <p className="text-sm font-mono text-emerald-400">{detail.roi}%</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <ScoreBar score={detail.profitScore} label="Profit" />
                <ScoreBar score={detail.speedScore} label="Vitesse de vente" />
                <ScoreBar score={detail.riskScore} label="Sécurité" />
                <ScoreBar score={detail.marketScores.opportunityScore} label="Opportunité" />
                <ScoreBar score={detail.marketScores.healthScore} label="Santé marché" />
              </div>

              <Button
                variant={isWatched(detail.itemId) ? 'danger' : 'success'}
                size="sm"
                className="w-full"
                onClick={() => {
                  if (isWatched(detail.itemId)) {
                    removeFromWatchlist(detail.itemId)
                  } else {
                    addToWatchlist({ itemId: detail.itemId, itemName: detail.itemName, addedAt: new Date().toISOString() })
                  }
                }}
              >
                {isWatched(detail.itemId) ? '✕ Retirer de la watchlist' : '+ Ajouter à la watchlist'}
              </Button>
            </Card>

            {/* AI Summary */}
            <Card>
              <CardHeader>
                <CardTitle icon="🤖">Analyse IA</CardTitle>
              </CardHeader>
              <p className="text-sm text-slate-300 leading-relaxed mb-3">{detail.aiSummary}</p>
              {detail.actionItems.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs text-slate-500 font-semibold">Actions recommandées:</p>
                  {detail.actionItems.map((a, i) => (
                    <p key={i} className="text-xs text-slate-400 pl-2 border-l-2 border-wow-gold/30">{a}</p>
                  ))}
                </div>
              )}
            </Card>

            {/* Patterns */}
            {detail.patterns.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle icon="🔮">Patterns détectés</CardTitle>
                </CardHeader>
                <div className="space-y-2">
                  {detail.patterns.map((p, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-wow-surface/30">
                      <span className="text-lg">{p.icon}</span>
                      <div>
                        <p className="text-xs font-medium text-white">{p.type.replace(/_/g, ' ')}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{p.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={p.severity === 'high' ? 'loss' : p.severity === 'medium' ? 'gold' : 'neutral'}>
                            {p.severity}
                          </Badge>
                          <span className="text-[10px] text-slate-500">Confiance: {p.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Weekly Cycle */}
            {detail.weeklyCycle.confidence > 30 && (
              <Card>
                <CardHeader>
                  <CardTitle icon="📅">Cycle hebdomadaire</CardTitle>
                  <Badge variant="gold">{detail.weeklyCycle.confidence}% confiance</Badge>
                </CardHeader>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-[10px] text-slate-500">Acheter le</p>
                    <p className="text-sm font-medium text-emerald-400">{detail.weeklyCycle.bestBuyDay}</p>
                    <p className="text-[10px] text-emerald-400/70">-{detail.weeklyCycle.avgBuyDiscount}%</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-[10px] text-slate-500">Vendre le</p>
                    <p className="text-sm font-medium text-red-400">{detail.weeklyCycle.bestSellDay}</p>
                    <p className="text-[10px] text-red-400/70">+{detail.weeklyCycle.avgSellPremium}%</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
