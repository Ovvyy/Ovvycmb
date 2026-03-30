import { useState } from 'react'
import { PageWrapper, Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { GoldDisplay } from '@/components/ui/GoldDisplay'
import { PriceChart } from '@/components/charts/PriceChart'
import { TRACKED_ITEMS, generateMockPriceHistory, wowheadUrl } from '@/data/items'
import { formatGold, afterAHCut, calcROI } from '@/utils/gold'
import type { MarketOpportunity } from '@/types'

interface FlipOpportunity extends MarketOpportunity {
  currentListings: number
  avgStack: number
  recommendedBuy: number
  recommendedSell: number
  daysToSell: number
  confidence: 'high' | 'medium' | 'low'
}

function generateFlipOpportunities(): FlipOpportunity[] {
  const items = TRACKED_ITEMS.slice(0, 12)
  return items
    .map((item): FlipOpportunity => {
      const basePrice = Math.floor(Math.random() * 50000) + 5000
      const marketVal = basePrice * (1 + Math.random() * 0.3)
      const currentBuy = basePrice * (0.65 + Math.random() * 0.2)
      const profit = afterAHCut(marketVal) - currentBuy
      const roi = calcROI(currentBuy, afterAHCut(marketVal))
      const volume = Math.floor(Math.random() * 1000) + 50
      const risk: FlipOpportunity['riskLevel'] = roi > 50 ? 'low' : roi > 20 ? 'medium' : 'high'
      const confidence: FlipOpportunity['confidence'] = roi > 40 ? 'high' : roi > 20 ? 'medium' : 'low'

      return {
        type: 'flip',
        itemId: item.id,
        itemName: item.name,
        itemQuality: item.quality,
        buyPrice: Math.round(currentBuy),
        sellPrice: Math.round(marketVal),
        profit: Math.round(profit),
        roi: Math.round(roi),
        riskLevel: risk,
        volume,
        description: `Achetez sous ${formatGold(Math.round(currentBuy * 1.05), true)} · Revendez à ${formatGold(Math.round(marketVal), true)}`,
        currentListings: Math.floor(Math.random() * 30) + 2,
        avgStack: Math.floor(Math.random() * 20) + 1,
        recommendedBuy: Math.round(currentBuy),
        recommendedSell: Math.round(marketVal * 0.97),
        daysToSell: Math.floor(Math.random() * 7) + 1,
        confidence,
      }
    })
    .filter((o) => o.profit > 0)
    .sort((a, b) => b.roi - a.roi)
}

function OpportunityCard({ opp, selected, onClick }: { opp: FlipOpportunity; selected: boolean; onClick: () => void }) {
  const confColor = { high: 'profit', medium: 'gold', low: 'loss' } as const
  const riskIcon = { low: '🟢', medium: '🟡', high: '🔴' }

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 ${
        selected
          ? 'border-wow-gold/50 bg-wow-gold/5'
          : 'border-wow-border bg-wow-card hover:border-wow-gold/25'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <a
            href={wowheadUrl(opp.itemId)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-sm font-medium text-white hover:text-wow-gold transition-colors"
          >
            {opp.itemName}
          </a>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xs">{riskIcon[opp.riskLevel]}</span>
            <Badge variant={confColor[opp.confidence]}>
              {opp.confidence === 'high' ? 'Confiance élevée' : opp.confidence === 'medium' ? 'Confiance moyenne' : 'Risqué'}
            </Badge>
            <span className="text-xs text-slate-600">Vol: {opp.volume.toLocaleString()}</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-base font-bold font-mono text-emerald-400">+{formatGold(opp.profit, true)}</p>
          <Badge variant="profit">{opp.roi}% ROI</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs mt-3">
        <div>
          <span className="text-slate-500">Acheter sous</span>
          <p className="font-mono text-slate-300">{formatGold(opp.recommendedBuy)}</p>
        </div>
        <div>
          <span className="text-slate-500">Vendre à</span>
          <p className="font-mono text-wow-gold">{formatGold(opp.recommendedSell)}</p>
        </div>
        <div>
          <span className="text-slate-500">Annonces actives</span>
          <p className="text-slate-300">{opp.currentListings}</p>
        </div>
        <div>
          <span className="text-slate-500">Délai estimé</span>
          <p className="text-slate-300">~{opp.daysToSell}j</p>
        </div>
      </div>
    </div>
  )
}

export function MarketFlipper() {
  const [opportunities] = useState<FlipOpportunity[]>(generateFlipOpportunities)
  const [selected, setSelected] = useState<FlipOpportunity | null>(null)
  const [minRoi, setMinRoi] = useState(20)
  const [riskFilter, setRiskFilter] = useState<'all' | 'low' | 'medium'>('all')
  const [minProfit, setMinProfit] = useState(1000)

  const filtered = opportunities.filter((o) => {
    if (o.roi < minRoi) return false
    if (riskFilter !== 'all' && o.riskLevel !== riskFilter) return false
    if (o.profit < minProfit) return false
    return true
  })

  const chartData = selected
    ? generateMockPriceHistory(selected.sellPrice, 30)
    : []

  const totalPotential = filtered.reduce((s, o) => s + o.profit, 0)

  return (
    <PageWrapper>
      <Header
        title="Market Flipper"
        subtitle="Identifiez les opportunités de flip sur l'Hôtel des Ventes"
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="flex items-center gap-3">
          <span className="text-2xl">🎯</span>
          <div>
            <p className="text-xs text-slate-500">Opportunités</p>
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
            <p className="text-xl font-bold text-wow-gold">
              {filtered.length ? (filtered.reduce((s, o) => s + o.roi, 0) / filtered.length).toFixed(0) : 0}%
            </p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6 p-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">ROI min:</span>
            <input
              type="range"
              min={0}
              max={100}
              value={minRoi}
              onChange={(e) => setMinRoi(Number(e.target.value))}
              className="w-28 accent-wow-gold"
            />
            <Badge variant="gold">{minRoi}%</Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">Profit min:</span>
            <input
              type="range"
              min={0}
              max={50000}
              step={1000}
              value={minProfit}
              onChange={(e) => setMinProfit(Number(e.target.value))}
              className="w-28 accent-wow-gold"
            />
            <Badge variant="gold">{formatGold(minProfit, true)}</Badge>
          </div>
          <div className="flex gap-1 ml-auto">
            {['all', 'low', 'medium'].map((r) => (
              <Button
                key={r}
                size="sm"
                variant={riskFilter === r ? 'gold' : 'ghost'}
                onClick={() => setRiskFilter(r as any)}
              >
                {r === 'all' ? '🌟 Tous' : r === 'low' ? '🟢 Faible risque' : '🟡 Risque moyen'}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Opportunity list */}
        <div className="flex-1 min-w-0">
          {filtered.length === 0 ? (
            <Card className="text-center py-16">
              <p className="text-slate-500">Aucune opportunité avec ces filtres</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filtered.map((opp) => (
                <OpportunityCard
                  key={opp.itemId}
                  opp={opp}
                  selected={selected?.itemId === opp.itemId}
                  onClick={() => setSelected(opp)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Detail */}
        <div className="w-full xl:w-80 flex-shrink-0">
          {selected ? (
            <div className="space-y-4 sticky top-6">
              <Card>
                <CardHeader>
                  <CardTitle>Analyse: {selected.itemName}</CardTitle>
                  <button onClick={() => setSelected(null)} className="text-slate-600 hover:text-slate-300 text-sm">✕</button>
                </CardHeader>

                <div className="space-y-2 text-sm py-3 border-y border-wow-border/50 mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Prix d'achat recommandé</span>
                    <GoldDisplay copper={selected.recommendedBuy} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Prix de vente cible</span>
                    <GoldDisplay copper={selected.recommendedSell} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Après coupe AH (5%)</span>
                    <GoldDisplay copper={afterAHCut(selected.recommendedSell)} />
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-white">Profit net</span>
                    <GoldDisplay copper={selected.profit} showSign className="text-emerald-400 text-base" />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ROI</span>
                    <Badge variant="profit">{selected.roi}%</Badge>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <p className="text-xs font-semibold text-slate-400 uppercase">📊 Données du marché</p>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Annonces actives</span>
                    <span className="text-white">{selected.currentListings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Volume moyen/jour</span>
                    <span className="text-white">{selected.volume}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Délai de vente estimé</span>
                    <span className="text-white">~{selected.daysToSell} jour(s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Niveau de risque</span>
                    <span>{selected.riskLevel === 'low' ? '🟢 Faible' : selected.riskLevel === 'medium' ? '🟡 Moyen' : '🔴 Élevé'}</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <a href={wowheadUrl(selected.itemId)} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">📖 Wowhead</Button>
                  </a>
                  <a
                    href={`https://www.wowaudit.com/items/${selected.itemId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full">📊 WoWAudit</Button>
                  </a>
                </div>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tendance 30 jours</CardTitle>
                </CardHeader>
                <PriceChart data={chartData} height={180} />
              </Card>

              <Card className="border-wow-gold/20 bg-wow-gold/5">
                <p className="text-xs font-semibold text-wow-gold mb-2">🧠 Conseil de Flip</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Achetez en dessous de <strong className="text-white">{formatGold(selected.recommendedBuy)}</strong> et postez à{' '}
                  <strong className="text-white">{formatGold(selected.recommendedSell)}</strong>.
                  Annulez et repostez si le prix monte. Patience: {selected.daysToSell}j de délai estimé.
                </p>
              </Card>
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center py-16 text-center">
              <span className="text-4xl mb-3">📈</span>
              <p className="text-sm text-slate-500">Sélectionnez une opportunité pour l'analyser en détail</p>
            </Card>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
