/**
 * AI Insights Page — Daily reports, timing strategies, market analysis
 */
import { useMemo, useState } from 'react'
import { PageWrapper, Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { generateMockItemData } from '@/data/mock-engine'
import { rankAllOpportunities } from '@/engine/opportunity-ranker'
import { generateDailyReport, generateItemInsight, generateTimingStrategies } from '@/ai/market-analyst'
import { cn } from '@/utils/cn'

export function AIInsights() {
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null)

  const { report, insights, timingStrategies } = useMemo(() => {
    const items = generateMockItemData()
    const opps = rankAllOpportunities(items)
    const rpt = generateDailyReport(opps)
    const allInsights = opps.slice(0, 10).map(generateItemInsight)
    const timing = generateTimingStrategies()
    return { report: rpt, insights: allInsights, timingStrategies: timing }
  }, [])

  const sentimentConfig = {
    bullish: { icon: '🟢', label: 'Haussier', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    bearish: { icon: '🔴', label: 'Baissier', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
    neutral: { icon: '⚪', label: 'Neutre', color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20' },
    mixed:   { icon: '🟡', label: 'Mixte', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  }
  const sent = sentimentConfig[report.marketSentiment]

  return (
    <PageWrapper>
      <Header
        title="Insights IA"
        subtitle="Analyse automatisée du marché, stratégies et rapport quotidien"
        actions={
          <Badge variant="gold" className="text-sm">
            🤖 Analyse heuristique
          </Badge>
        }
      />

      {/* Market Sentiment + Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className={cn('border', sent.bg)}>
          <div className="text-center">
            <span className="text-3xl">{sent.icon}</span>
            <p className={cn('text-lg font-bold mt-1', sent.color)}>{sent.label}</p>
            <p className="text-xs text-slate-500">Sentiment du marché</p>
          </div>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold font-mono text-wow-gold">{report.keyMetrics.totalOpportunities}</p>
          <p className="text-xs text-slate-500 mt-1">Opportunités détectées</p>
          <p className="text-[10px] text-emerald-400 mt-0.5">ROI moy. {report.keyMetrics.avgROI}%</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold font-mono text-emerald-400">{report.keyMetrics.trendingUp}</p>
          <p className="text-xs text-slate-500 mt-1">Items en hausse</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold font-mono text-red-400">{report.keyMetrics.trendingDown}</p>
          <p className="text-xs text-slate-500 mt-1">Items en baisse</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main column: Daily Report + Insights */}
        <div className="xl:col-span-2 space-y-6">
          {/* Daily Report */}
          <Card>
            <CardHeader>
              <CardTitle icon="📋">Rapport Quotidien</CardTitle>
              <Badge variant="gold">{report.date}</Badge>
            </CardHeader>
            <div className="prose prose-invert prose-sm max-w-none">
              {report.summary.split('\n').map((line, i) => {
                if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-wow text-wow-gold mb-2">{line.replace('## ', '')}</h2>
                if (line.startsWith('### ')) return <h3 key={i} className="text-sm font-semibold text-white mt-4 mb-2">{line.replace('### ', '')}</h3>
                if (line.startsWith('**')) return <p key={i} className="text-sm text-slate-300 mb-1">{line.replace(/\*\*/g, '')}</p>
                if (line.startsWith('- ')) return <p key={i} className="text-sm text-slate-400 pl-3 mb-0.5">{line}</p>
                if (line.match(/^\d\./)) return <p key={i} className="text-sm text-slate-300 mb-1">{line}</p>
                return line ? <p key={i} className="text-sm text-slate-400 mb-1">{line}</p> : <br key={i} />
              })}
            </div>
          </Card>

          {/* Item Insights */}
          <Card>
            <CardHeader>
              <CardTitle icon="🎯">Analyses par item</CardTitle>
              <Badge variant="neutral">{insights.length} items</Badge>
            </CardHeader>
            <div className="space-y-2">
              {insights.map(insight => (
                <div
                  key={insight.id}
                  className={cn(
                    'rounded-lg border transition-all cursor-pointer',
                    insight.priority === 'high' ? 'border-emerald-500/20 bg-emerald-500/5' :
                    insight.priority === 'medium' ? 'border-wow-gold/15 bg-wow-gold/3' :
                    'border-wow-border/30 bg-wow-surface/20'
                  )}
                >
                  <div
                    className="flex items-center gap-3 px-4 py-3"
                    onClick={() => setExpandedInsight(expandedInsight === insight.id ? null : insight.id)}
                  >
                    <span className="text-lg flex-shrink-0">{insight.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{insight.title}</p>
                    </div>
                    <Badge variant={insight.priority === 'high' ? 'profit' : insight.priority === 'medium' ? 'gold' : 'neutral'}>
                      {insight.priority}
                    </Badge>
                    <span className={cn('text-xs text-slate-500 transition-transform', expandedInsight === insight.id && 'rotate-180')}>
                      ▼
                    </span>
                  </div>
                  {expandedInsight === insight.id && (
                    <div className="px-4 pb-4 border-t border-wow-border/20 pt-3">
                      {insight.body.split('\n').map((line, i) =>
                        line ? <p key={i} className="text-xs text-slate-400 mb-1">{line.replace(/\*\*/g, '')}</p> : <br key={i} />
                      )}
                      {insight.actions && insight.actions.length > 0 && (
                        <div className="mt-3 space-y-1">
                          <p className="text-[10px] uppercase text-slate-600 font-semibold tracking-wider">Actions</p>
                          {insight.actions.map((a, i) => (
                            <p key={i} className="text-xs text-slate-300 pl-2 border-l-2 border-wow-gold/30">{a}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Side column */}
        <div className="space-y-6">
          {/* Timing Strategies */}
          <Card>
            <CardHeader>
              <CardTitle icon="⏰">Stratégies temporelles</CardTitle>
            </CardHeader>
            {timingStrategies.length > 0 ? (
              <div className="space-y-3">
                {timingStrategies.map(s => (
                  <div key={s.id} className="p-3 rounded-lg bg-wow-surface/50 border border-wow-border/30">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-lg">{s.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-white">{s.title}</p>
                        <Badge variant={s.priority === 'high' ? 'loss' : 'gold'} className="mt-1">
                          {s.priority}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{s.body.split('\n')[0]}</p>
                    {s.actions && (
                      <div className="mt-2 space-y-1">
                        {s.actions.map((a, i) => (
                          <p key={i} className="text-[11px] text-slate-500">{a}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-3xl mb-2">📅</p>
                <p className="text-slate-400 text-sm">Pas de stratégie temporelle active</p>
                <p className="text-slate-600 text-xs mt-1">Astuce: Achetez le weekend, vendez le mardi!</p>
              </div>
            )}
          </Card>

          {/* Warnings */}
          <Card>
            <CardHeader>
              <CardTitle icon="⚠️">Alertes Patterns</CardTitle>
              <Badge variant="loss">{report.warnings.length}</Badge>
            </CardHeader>
            {report.warnings.length > 0 ? (
              <div className="space-y-2">
                {report.warnings.slice(0, 5).map((w, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                    <span className="text-sm mt-0.5">{w.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs text-white truncate">{w.title}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{w.body.split('\n')[0]}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">Aucune alerte critique</p>
            )}
          </Card>

          {/* Top 3 Opportunities summary */}
          <Card>
            <CardHeader>
              <CardTitle icon="🏆">Top 3</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              {report.topOpportunities.slice(0, 3).map((o, i) => (
                <div key={o.id} className="flex items-center gap-3">
                  <span className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
                    i === 0 ? 'bg-wow-gold/20 text-wow-gold' :
                    i === 1 ? 'bg-slate-400/20 text-slate-300' :
                    'bg-orange-500/20 text-orange-400'
                  )}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white truncate">{o.title.replace(/[🟢🔴🟡] /, '')}</p>
                  </div>
                  <Badge variant={o.priority === 'high' ? 'profit' : 'gold'}>{o.priority}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PageWrapper>
  )
}
