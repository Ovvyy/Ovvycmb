import { useState, useMemo } from 'react'
import { PageWrapper, Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { GoldDisplay } from '@/components/ui/GoldDisplay'
import { FlipSignalBadge } from '@/components/ui/Signal'
import { ScoreGauge, ScoreBar } from '@/components/ui/ScoreGauge'
import { generateMockFlipInputs } from '@/data/mock-engine'
import { analyzeFlip, rankFlipOpportunities, type FlipAnalysis } from '@/engine/flipper-engine'
import { formatGold } from '@/utils/gold'
import { wowheadUrl } from '@/data/items'
import { cn } from '@/utils/cn'

export function MarketFlipper() {
  const analyses = useMemo(() => {
    const inputs = generateMockFlipInputs()
    const results = inputs.map(analyzeFlip)
    return rankFlipOpportunities(results)
  }, [])

  const [selected, setSelected] = useState<FlipAnalysis | null>(null)
  const [signalFilter, setSignalFilter] = useState<'all' | 'strong_flip' | 'flip' | 'risky_flip'>('all')
  const [minRoi, setMinRoi] = useState(10)

  const filtered = analyses.filter(a => {
    if (a.roi < minRoi) return false
    if (signalFilter !== 'all' && a.signal !== signalFilter) return false
    if (a.signal === 'avoid' && signalFilter === 'all') return false
    return true
  })

  const totalPotential = filtered.reduce((s, a) => s + Math.max(0, a.netProfit), 0)
  const avgROI = filtered.length > 0 ? filtered.reduce((s, a) => s + a.roi, 0) / filtered.length : 0

  const detail = selected

  return (
    <PageWrapper>
      <Header
        title="Market Flipper"
        subtitle="Analyse avancée des opportunités de flip — Profit/heure, taux de vente, risque"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="flex items-center gap-3">
          <span className="text-2xl">🎯</span>
          <div>
            <p className="text-xs text-slate-500">Flips viables</p>
            <p className="text-xl font-bold text-wow-gold">{filtered.length}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <span className="text-2xl">💰</span>
          <div>
            <p className="text-xs text-slate-500">Profit total potentiel</p>
            <p className="text-xl font-bold text-emerald-400">{formatGold(totalPotential, true)}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <span className="text-2xl">📊</span>
          <div>
            <p className="text-xs text-slate-500">ROI moyen</p>
            <p className="text-xl font-bold text-wow-gold">{avgROI.toFixed(0)}%</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <span className="text-2xl">🏆</span>
          <div>
            <p className="text-xs text-slate-500">Meilleur flip</p>
            <p className="text-sm font-bold text-emerald-400">
              {filtered[0] ? `${formatGold(filtered[0].netProfit, true)} (${filtered[0].itemName})` : '-'}
            </p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6 p-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">ROI min:</span>
            <input type="range" min={0} max={100} value={minRoi} onChange={e => setMinRoi(Number(e.target.value))} className="w-28 accent-wow-gold" />
            <Badge variant="gold">{minRoi}%</Badge>
          </div>
          <div className="flex gap-1 ml-auto">
            {(['all', 'strong_flip', 'flip', 'risky_flip'] as const).map(f => (
              <Button key={f} size="sm" variant={signalFilter === f ? 'gold' : 'ghost'} onClick={() => setSignalFilter(f)}>
                {f === 'all' ? 'Tous' : f === 'strong_flip' ? '🎯 Fort' : f === 'flip' ? '📈 Flip' : '⚠️ Risqué'}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Opportunity list */}
        <div className="flex-1 min-w-0 space-y-2">
          {filtered.length === 0 ? (
            <Card className="text-center py-16">
              <p className="text-slate-500">Aucune opportunité avec ces filtres</p>
            </Card>
          ) : (
            filtered.map(flip => (
              <Card
                key={flip.itemId}
                hover
                onClick={() => setSelected(flip)}
                className={cn('p-3', detail?.itemId === flip.itemId && 'border-wow-gold/40 bg-wow-gold/5')}
              >
                <div className="flex items-center gap-3">
                  <ScoreGauge score={flip.overallScore} size={44} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <a href={wowheadUrl(flip.itemId)} target="_blank" rel="noopener noreferrer"
                        className="text-sm font-medium text-white hover:text-wow-gold transition-colors"
                        onClick={e => e.stopPropagation()}>
                        {flip.itemName}
                      </a>
                      <FlipSignalBadge signal={flip.signal} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>Achat: {formatGold(flip.buyPrice, true)}</span>
                      <span>→ Vente: {formatGold(flip.sellPrice, true)}</span>
                      <span className="text-emerald-400">{flip.expectedProfitPerHour > 0 ? `${formatGold(flip.expectedProfitPerHour, true)}/h` : '-'}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <GoldDisplay copper={flip.netProfit} showSign compact />
                    <p className="text-xs text-slate-500">{flip.roi}% ROI</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 mt-3">
                  <ScoreBar score={flip.sellRateProbability} label="Vente" />
                  <ScoreBar score={100 - flip.riskScore} label="Sécurité" />
                  <ScoreBar score={100 - flip.competitionDensity} label="Concurrence" />
                  <ScoreBar score={100 - flip.undercutRisk} label="Anti-undercut" />
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Detail panel */}
        <div className="w-full xl:w-80 flex-shrink-0">
          {detail ? (
            <div className="space-y-4 sticky top-6">
              <Card>
                <CardHeader>
                  <CardTitle>{detail.itemName}</CardTitle>
                  <FlipSignalBadge signal={detail.signal} />
                </CardHeader>

                <div className="flex justify-center mb-4">
                  <ScoreGauge score={detail.overallScore} label="Score global" size={72} />
                </div>

                <div className="space-y-2 text-sm py-3 border-y border-wow-border/50 mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Prix d'achat</span>
                    <GoldDisplay copper={detail.buyPrice} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Prix de vente</span>
                    <GoldDisplay copper={detail.sellPrice} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Coupe AH (5%)</span>
                    <span className="text-red-400 text-xs font-mono">-{formatGold(detail.ahCut, true)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dépôt</span>
                    <span className="text-red-400 text-xs font-mono">-{formatGold(detail.depositCost, true)}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t border-wow-border/30 pt-2">
                    <span className="text-white">Profit net</span>
                    <GoldDisplay copper={detail.netProfit} showSign className="text-base" />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ROI</span>
                    <Badge variant={detail.roi > 30 ? 'profit' : detail.roi > 10 ? 'gold' : 'loss'}>{detail.roi}%</Badge>
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Métriques avancées</p>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Profit/heure estimé</span>
                    <span className="text-wow-gold font-mono text-xs">{formatGold(detail.expectedProfitPerHour, true)}/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Temps de vente estimé</span>
                    <span className="text-white">{detail.estimatedSellTimeHours}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Probabilité vente 48h</span>
                    <Badge variant={detail.sellRateProbability > 60 ? 'profit' : detail.sellRateProbability > 30 ? 'gold' : 'loss'}>
                      {detail.sellRateProbability}%
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Annonces actives</span>
                    <span className="text-white">{detail.averageListings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Risque d'undercut</span>
                    <Badge variant={detail.undercutRisk > 60 ? 'loss' : detail.undercutRisk > 30 ? 'gold' : 'profit'}>
                      {detail.undercutRisk}%
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <ScoreBar score={detail.sellRateProbability} label="Taux de vente" />
                  <ScoreBar score={100 - detail.riskScore} label="Sécurité" />
                  <ScoreBar score={100 - detail.competitionDensity} label="Faible concurrence" />
                  <ScoreBar score={100 - detail.undercutRisk} label="Anti-undercut" />
                </div>
              </Card>

              {/* Risk Factors */}
              <Card>
                <CardHeader>
                  <CardTitle icon="⚠️">Facteurs de risque</CardTitle>
                </CardHeader>
                <div className="space-y-1.5">
                  {detail.riskFactors.map((r, i) => (
                    <p key={i} className={cn(
                      'text-xs pl-2 border-l-2',
                      r.includes('Aucun') ? 'border-emerald-500/30 text-emerald-400' : 'border-red-500/30 text-red-400'
                    )}>
                      {r}
                    </p>
                  ))}
                </div>
              </Card>

              <div className="flex gap-2">
                <a href={wowheadUrl(detail.itemId)} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">Wowhead</Button>
                </a>
                <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>Fermer</Button>
              </div>
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center py-16 text-center">
              <span className="text-4xl mb-3">📈</span>
              <p className="text-sm text-slate-500">Sélectionnez un flip pour l'analyser</p>
            </Card>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
