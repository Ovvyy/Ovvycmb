import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageWrapper, Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge, RatingStars } from '@/components/ui/Badge'
import { GoldDisplay, GoldBadge } from '@/components/ui/GoldDisplay'
import { Button } from '@/components/ui/Button'
import { PriceChart } from '@/components/charts/PriceChart'
import { generateMockOpportunities, generateMockPriceHistory, wowheadUrl } from '@/data/items'
import { GOLD_STRATEGIES } from '@/data/strategies'
import { formatGold } from '@/utils/gold'
import type { MarketOpportunity } from '@/types'

function StatCard({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon: string }) {
  return (
    <Card className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-wow-gold/10 flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500 mb-0.5">{label}</p>
        <p className="text-xl font-bold font-mono text-wow-gold">{value}</p>
        {sub && <p className="text-xs text-slate-600 mt-0.5">{sub}</p>}
      </div>
    </Card>
  )
}

function OpportunityRow({ opp }: { opp: MarketOpportunity }) {
  const roi = opp.roi.toFixed(0)
  return (
    <a
      href={wowheadUrl(opp.itemId)}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-4 py-3 hover:bg-wow-gold/3 transition-colors cursor-pointer group border-b border-wow-border/30 last:border-b-0"
    >
      <div className="w-8 h-8 rounded bg-wow-surface border border-wow-border flex items-center justify-center text-sm flex-shrink-0">
        {opp.type === 'craft' ? '⚒️' : opp.type === 'flip' ? '📈' : '⚔️'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white group-hover:text-wow-gold transition-colors truncate">
          {opp.itemName}
        </p>
        <p className="text-xs text-slate-500 truncate">{opp.description}</p>
      </div>
      <div className="text-right flex-shrink-0 space-y-0.5">
        <div className="flex items-center justify-end gap-1.5">
          <GoldDisplay copper={opp.profit} showSign compact />
          <Badge variant={Number(roi) >= 50 ? 'profit' : 'neutral'}>
            {roi}% ROI
          </Badge>
        </div>
        <p className="text-xs text-slate-600">
          Vol: {opp.volume.toLocaleString()}
        </p>
      </div>
    </a>
  )
}

export function Dashboard() {
  const [opportunities] = useState<MarketOpportunity[]>(generateMockOpportunities())
  const [chartData] = useState(() => generateMockPriceHistory(65000, 30))
  const [refreshing, setRefreshing] = useState(false)

  const topStrategies = GOLD_STRATEGIES
    .sort((a, b) => b.estimatedGoldPerHour - a.estimatedGoldPerHour)
    .slice(0, 4)

  const totalPotential = opportunities.reduce((s, o) => s + o.profit, 0)
  const avgROI = (opportunities.reduce((s, o) => s + o.roi, 0) / opportunities.length).toFixed(0)

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1500)
  }

  return (
    <PageWrapper>
      <Header
        title="Tableau de Bord"
        subtitle="Vue d'ensemble du marché et opportunités en temps réel"
        actions={
          <Button variant="gold" size="sm" onClick={handleRefresh} loading={refreshing}>
            🔄 Actualiser
          </Button>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon="💰" label="Profit potentiel" value={formatGold(totalPotential, true)} sub="Basé sur les opportunités" />
        <StatCard icon="📈" label="ROI moyen" value={`${avgROI}%`} sub="Toutes opportunités" />
        <StatCard icon="🔥" label="Meilleur flip" value={formatGold(opportunities[0].profit, true)} sub={opportunities[0].itemName} />
        <StatCard icon="⚒️" label="Top craft" value={formatGold(opportunities[1].profit, true)} sub={opportunities[1].itemName} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Price chart */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle icon="📊">Évolution du marché — Phial of Tepid Versatility</CardTitle>
            <Badge variant="gold">30 jours</Badge>
          </CardHeader>
          <PriceChart data={chartData} height={220} />
          <div className="flex gap-4 mt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-wow-gold inline-block" /> Prix marché</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-blue-400 inline-block" /> Prix minimum</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-wow-gold/40 inline-block border-dashed" /> Moyenne</span>
          </div>
        </Card>

        {/* Quick stats */}
        <Card>
          <CardHeader>
            <CardTitle icon="⚡">Alertes & Tendances</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {[
              { icon: '🟢', text: 'Flacons en hausse +12% avant reset', time: 'il y a 2h' },
              { icon: '🔴', text: 'Herbes: prix bas ce matin', time: 'il y a 4h' },
              { icon: '🟡', text: 'Gems: stock faible sur AH', time: 'il y a 6h' },
              { icon: '🔵', text: 'Reset hebdo: mardi 09:00', time: 'demain' },
              { icon: '🟣', text: 'DMF commence dans 3 jours', time: 'planifier' },
            ].map((alert, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm">
                <span className="text-base mt-0.5 flex-shrink-0">{alert.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-300 text-xs leading-snug">{alert.text}</p>
                  <p className="text-slate-600 text-[10px] mt-0.5">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Opportunities */}
        <Card className="overflow-hidden p-0">
          <div className="px-4 py-3 border-b border-wow-border flex items-center justify-between">
            <CardTitle icon="🎯" className="px-0">Meilleures Opportunités</CardTitle>
            <Link to="/items">
              <Button variant="ghost" size="sm">Voir tout →</Button>
            </Link>
          </div>
          <div>
            {opportunities.map((opp) => (
              <OpportunityRow key={opp.itemId} opp={opp} />
            ))}
          </div>
        </Card>

        {/* Top strategies */}
        <Card className="overflow-hidden p-0">
          <div className="px-4 py-3 border-b border-wow-border flex items-center justify-between">
            <CardTitle icon="📋" className="px-0">Stratégies Top</CardTitle>
            <Link to="/strategies">
              <Button variant="ghost" size="sm">Voir tout →</Button>
            </Link>
          </div>
          <div>
            {topStrategies.map((s) => (
              <Link
                key={s.id}
                to={`/strategies?id=${s.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-wow-gold/3 transition-colors border-b border-wow-border/30 last:border-b-0"
              >
                <span className="text-2xl">{s.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{s.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant={
                      s.category === 'crafting' ? 'blue' :
                      s.category === 'flipping' ? 'gold' :
                      s.category === 'service' ? 'purple' : 'profit'
                    }>
                      {s.category}
                    </Badge>
                    <RatingStars rating={s.goldRating} />
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <GoldBadge copper={s.estimatedGoldPerHour * 10000} />
                  <p className="text-xs text-slate-600 mt-0.5">/ heure</p>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* Midnight Banner */}
      <div className="mt-6 rounded-xl border border-wow-gold/20 bg-gradient-to-r from-wow-gold/5 via-transparent to-wow-gold/5 p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-4xl animate-float">🌑</span>
          <div>
            <h3 className="font-wow text-wow-gold font-bold">WoW Midnight — Quel'Thalas vous attend !</h3>
            <p className="text-sm text-slate-400 mt-0.5">
              Extension sortie le 2 mars 2026 · Saison 1 active · Nouvelles herbes, minerais et gems à tracker
            </p>
          </div>
        </div>
        <Link to="/strategies">
          <Button variant="gold" size="sm">Stratégies Midnight</Button>
        </Link>
      </div>
    </PageWrapper>
  )
}
