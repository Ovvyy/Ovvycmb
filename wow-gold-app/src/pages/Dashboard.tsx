import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { PageWrapper, Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { GoldDisplay } from '@/components/ui/GoldDisplay'
import { Button } from '@/components/ui/Button'
import { SignalBadge, SignalDot } from '@/components/ui/Signal'
import { ScoreGauge, ScoreBar } from '@/components/ui/ScoreGauge'
import { SparkLine } from '@/components/ui/SparkLine'
import { PriceChart } from '@/components/charts/PriceChart'
import { generateMockItemData } from '@/data/mock-engine'
import { rankAllOpportunities } from '@/engine/opportunity-ranker'
import { generateDailyReport, generateTimingStrategies } from '@/ai/market-analyst'
import { formatGold } from '@/utils/gold'
import { cn } from '@/utils/cn'
import { useAlertStore } from '@/alerts/alert-store'

function StatCard({ label, value, sub, icon, trend }: { label: string; value: string; sub?: string; icon: string; trend?: 'up' | 'down' | 'flat' }) {
  return (
    <Card className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-wow-gold/10 flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 mb-0.5">{label}</p>
        <p className="text-xl font-bold font-mono text-wow-gold">{value}</p>
        {sub && (
          <p className={cn('text-xs mt-0.5', trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-slate-600')}>
            {trend === 'up' && '▲ '}{trend === 'down' && '▼ '}{sub}
          </p>
        )}
      </div>
    </Card>
  )
}

export function Dashboard() {
  const [refreshing, setRefreshing] = useState(false)
  const watchlist = useAlertStore(s => s.watchlist)

  const { opportunities, report, timingStrategies, chartItem } = useMemo(() => {
    const items = generateMockItemData()
    const opps = rankAllOpportunities(items)
    const rpt = generateDailyReport(opps)
    const timing = generateTimingStrategies()
    const featured = items.find(i => i.name === 'Voidbloom') ?? items[0]
    return { opportunities: opps, report: rpt, timingStrategies: timing, chartItem: featured }
  }, [])

  const buySignals = opportunities.filter(o => o.signal === 'strong_buy' || o.signal === 'buy')
  const totalPotential = buySignals.reduce((s, o) => s + o.estimatedProfit, 0)
  const avgROI = opportunities.length > 0 ? opportunities.reduce((s, o) => s + o.roi, 0) / opportunities.length : 0

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1500)
  }

  const sentimentConfig = {
    bullish: { icon: '🟢', label: 'Haussier', color: 'text-emerald-400' },
    bearish: { icon: '🔴', label: 'Baissier', color: 'text-red-400' },
    neutral: { icon: '⚪', label: 'Neutre', color: 'text-slate-400' },
    mixed:   { icon: '🟡', label: 'Mixte', color: 'text-yellow-400' },
  }
  const sentiment = sentimentConfig[report.marketSentiment]

  return (
    <PageWrapper>
      <Header
        title="Tableau de Bord"
        subtitle="Bloomberg Terminal — Vue d'ensemble du marché WoW"
        actions={
          <div className="flex items-center gap-2">
            <Badge variant={report.marketSentiment === 'bullish' ? 'profit' : report.marketSentiment === 'bearish' ? 'loss' : 'gold'}>
              {sentiment.icon} {sentiment.label}
            </Badge>
            <Button variant="gold" size="sm" onClick={handleRefresh} loading={refreshing}>
              🔄 Actualiser
            </Button>
          </div>
        }
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon="🎯" label="Opportunités"
          value={`${buySignals.length}`}
          sub={`${opportunities.filter(o => o.signal === 'strong_buy').length} signaux forts`}
          trend="up"
        />
        <StatCard
          icon="💰" label="Profit potentiel"
          value={formatGold(totalPotential, true)}
          sub="Basé sur les signaux"
          trend="up"
        />
        <StatCard
          icon="📈" label="ROI moyen"
          value={`${avgROI.toFixed(1)}%`}
          sub={`${report.keyMetrics.trendingUp} en hausse`}
          trend={avgROI > 10 ? 'up' : 'flat'}
        />
        <StatCard
          icon="📊" label="Volatilité marché"
          value={report.keyMetrics.marketVolatility}
          sub={`${report.keyMetrics.trendingDown} en baisse`}
          trend={report.keyMetrics.marketVolatility === 'Élevée' ? 'down' : 'flat'}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Main Chart */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle icon="📊">Évolution — {chartItem.name}</CardTitle>
            <div className="flex items-center gap-2">
              <SparkLine data={chartItem.priceHistory.map(p => p.price)} width={60} height={20} />
              <Badge variant="gold">30j</Badge>
            </div>
          </CardHeader>
          <PriceChart data={chartItem.priceHistory.map(p => ({
            date: p.date,
            price: p.price,
            minPrice: p.minPrice,
            quantity: p.quantity,
          }))} height={220} />
          <div className="flex gap-4 mt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-wow-gold inline-block" /> Prix marché</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-blue-400 inline-block" /> Prix minimum</span>
          </div>
        </Card>

        {/* AI Timing Strategies */}
        <Card>
          <CardHeader>
            <CardTitle icon="🤖">Stratégies IA</CardTitle>
            <Link to="/ai-insights"><Button variant="ghost" size="sm">Voir tout →</Button></Link>
          </CardHeader>
          <div className="space-y-3">
            {timingStrategies.length > 0 ? timingStrategies.map(s => (
              <div key={s.id} className="p-3 rounded-lg bg-wow-surface/50 border border-wow-border/30">
                <div className="flex items-start gap-2">
                  <span className="text-lg">{s.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white leading-snug">{s.title}</p>
                    <div className="mt-2 space-y-1">
                      {s.actions?.slice(0, 2).map((a, i) => (
                        <p key={i} className="text-xs text-slate-400">{a}</p>
                      ))}
                    </div>
                  </div>
                  <Badge variant={s.priority === 'high' ? 'loss' : 'gold'} className="flex-shrink-0">
                    {s.priority === 'high' ? 'Urgent' : 'Info'}
                  </Badge>
                </div>
              </div>
            )) : (
              <div className="text-center py-6">
                <p className="text-slate-500 text-sm">Pas de stratégie temporelle active</p>
                <p className="text-slate-600 text-xs mt-1">Revenez mardi pour les strats reset!</p>
              </div>
            )}
            {/* Daily report summary */}
            <div className="p-3 rounded-lg bg-wow-gold/5 border border-wow-gold/15">
              <p className="text-xs text-wow-gold font-medium mb-1">📋 Rapport quotidien</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {report.keyMetrics.totalOpportunities} opportunités · ROI moy. {report.keyMetrics.avgROI}% · {report.keyMetrics.trendingUp} ↑ {report.keyMetrics.trendingDown} ↓
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Opportunity Feed + Watchlist */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* Top Opportunities */}
        <Card className="overflow-hidden p-0">
          <div className="px-4 py-3 border-b border-wow-border flex items-center justify-between">
            <CardTitle icon="🎯" className="px-0">Top Opportunités</CardTitle>
            <Link to="/market-intel"><Button variant="ghost" size="sm">Analyse →</Button></Link>
          </div>
          <div>
            {opportunities.slice(0, 8).map(opp => (
              <div
                key={opp.itemId}
                className="flex items-center gap-3 px-4 py-3 hover:bg-wow-gold/3 transition-colors border-b border-wow-border/30 last:border-b-0"
              >
                <ScoreGauge score={opp.overallScore} size={40} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white truncate">{opp.itemName}</p>
                    <SignalDot signal={opp.signal} />
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <SignalBadge signal={opp.signal} size="sm" />
                    <span className="text-[10px] text-slate-500">{opp.type}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 space-y-0.5">
                  <GoldDisplay copper={opp.estimatedProfit} showSign compact />
                  <p className="text-xs text-slate-500">{opp.roi}% ROI</p>
                </div>
                <SparkLine data={opp.marketScores ? [opp.currentPrice * 0.9, opp.currentPrice * 0.95, opp.currentPrice * 1.02, opp.currentPrice * 0.98, opp.currentPrice] : []} width={50} height={18} />
              </div>
            ))}
          </div>
        </Card>

        {/* Watchlist + Pattern Alerts */}
        <Card className="overflow-hidden p-0">
          <div className="px-4 py-3 border-b border-wow-border flex items-center justify-between">
            <CardTitle icon="👁️" className="px-0">Watchlist & Alertes</CardTitle>
            <Link to="/watchlist"><Button variant="ghost" size="sm">Gérer →</Button></Link>
          </div>
          <div>
            {watchlist.length > 0 ? (
              watchlist.slice(0, 5).map(w => {
                const opp = opportunities.find(o => o.itemId === w.itemId)
                return (
                  <div key={w.itemId} className="flex items-center gap-3 px-4 py-3 border-b border-wow-border/30 last:border-b-0">
                    <span className="text-lg">📌</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{w.itemName}</p>
                      {opp && <SignalBadge signal={opp.signal} size="sm" />}
                    </div>
                    {opp && <GoldDisplay copper={opp.currentPrice} compact />}
                  </div>
                )
              })
            ) : (
              <div className="text-center py-6 px-4">
                <p className="text-slate-500 text-sm">Watchlist vide</p>
                <p className="text-slate-600 text-xs mt-1">Ajoutez des items depuis l'onglet Marché</p>
              </div>
            )}

            {/* Pattern warnings */}
            <div className="px-4 py-2 border-t border-wow-border/50 bg-wow-surface/30">
              <p className="text-[10px] uppercase text-slate-600 font-semibold tracking-wider mb-2">Patterns détectés</p>
              {report.warnings.slice(0, 3).map((w, i) => (
                <div key={i} className="flex items-start gap-2 py-1.5">
                  <span className="text-sm">{w.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-300 truncate">{w.title}</p>
                    <p className="text-[10px] text-slate-600">Priorité: {w.priority}</p>
                  </div>
                </div>
              ))}
              {report.warnings.length === 0 && (
                <p className="text-xs text-slate-600 py-2">Aucun pattern critique détecté</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Score Breakdown for top 5 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle icon="📊">Scores détaillés — Top 5</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {opportunities.slice(0, 5).map(opp => (
            <div key={opp.itemId} className="text-center space-y-3 p-3 rounded-lg bg-wow-surface/30 border border-wow-border/20">
              <p className="text-xs font-medium text-white truncate">{opp.itemName}</p>
              <ScoreGauge score={opp.overallScore} label="Global" size={56} />
              <div className="space-y-1.5">
                <ScoreBar score={opp.profitScore} label="Profit" />
                <ScoreBar score={opp.speedScore} label="Vitesse" />
                <ScoreBar score={opp.riskScore} label="Sécurité" />
              </div>
              <SignalBadge signal={opp.signal} size="sm" />
            </div>
          ))}
        </div>
      </Card>

      {/* Midnight Banner */}
      <div className="rounded-xl border border-wow-gold/20 bg-gradient-to-r from-wow-gold/5 via-transparent to-wow-gold/5 p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-4xl animate-float">🌑</span>
          <div>
            <h3 className="font-wow text-wow-gold font-bold">WoW Midnight — Bloomberg Terminal Mode</h3>
            <p className="text-sm text-slate-400 mt-0.5">
              Intelligence artificielle · Détection de patterns · Signaux en temps réel · Alertes Discord
            </p>
          </div>
        </div>
        <Link to="/market-intel">
          <Button variant="gold" size="sm">Market Intel →</Button>
        </Link>
      </div>
    </PageWrapper>
  )
}
