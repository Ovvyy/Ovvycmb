/**
 * AI Market Analyst — Heuristic + optional LLM analysis
 *
 * Generates natural language market insights, daily reports, and strategy suggestions.
 * Works fully offline using rule-based analysis.
 * Optional: connect to Claude API for enhanced reasoning.
 */

import type { RankedOpportunity } from '@/engine/opportunity-ranker'
import type { DetectedPattern } from '@/engine/pattern-detection'
import { formatGold } from '@/utils/gold'

// ── Types ────────────────────────────────────────────────────────────────────

export interface AIInsight {
  id: string
  title: string
  body: string
  type: 'opportunity' | 'warning' | 'trend' | 'strategy' | 'daily_report'
  priority: 'high' | 'medium' | 'low'
  icon: string
  timestamp: Date
  relatedItems?: number[]
  actionable: boolean
  actions?: string[]
}

export interface DailyReport {
  date: string
  summary: string
  marketSentiment: 'bullish' | 'bearish' | 'neutral' | 'mixed'
  topOpportunities: AIInsight[]
  warnings: AIInsight[]
  strategies: AIInsight[]
  keyMetrics: {
    avgROI: number
    totalOpportunities: number
    marketVolatility: string
    trendingUp: number
    trendingDown: number
  }
}

// ── Insight Generators ───────────────────────────────────────────────────────

let _insightCounter = 0
function nextId(): string {
  return `insight-${++_insightCounter}-${Date.now()}`
}

/** Generate insight for a single opportunity */
export function generateItemInsight(opp: RankedOpportunity): AIInsight {
  const { itemName, signal, overallScore, estimatedProfit, roi, patterns, weeklyCycle, aiSummary, actionItems } = opp

  let title = ''
  let priority: AIInsight['priority'] = 'medium'
  let type: AIInsight['type'] = 'opportunity'
  let icon = '📊'

  if (signal === 'strong_buy') {
    title = `🟢 Signal d'achat fort: ${itemName}`
    priority = 'high'
    icon = '🎯'
  } else if (signal === 'buy') {
    title = `🟢 Opportunité d'achat: ${itemName}`
    icon = '💡'
  } else if (signal === 'sell' || signal === 'strong_sell') {
    title = `🔴 Signal de vente: ${itemName}`
    type = 'warning'
    icon = '⚠️'
  } else {
    title = `🟡 Surveillance: ${itemName}`
    priority = 'low'
    icon = '👁️'
  }

  const body = [
    aiSummary,
    '',
    `**Score global**: ${overallScore}/100 · **ROI estimé**: ${roi}% · **Profit potentiel**: ${formatGold(estimatedProfit, true)}`,
    '',
    patterns.length > 0 ? `**Patterns détectés**: ${patterns.map(p => `${p.icon} ${p.type.replace(/_/g, ' ')}`).join(', ')}` : '',
    weeklyCycle.confidence > 50 ? `**Cycle hebdo**: Acheter ${weeklyCycle.bestBuyDay} (-${weeklyCycle.avgBuyDiscount}%) → Vendre ${weeklyCycle.bestSellDay} (+${weeklyCycle.avgSellPremium}%)` : '',
  ].filter(Boolean).join('\n')

  return {
    id: nextId(),
    title,
    body,
    type,
    priority,
    icon,
    timestamp: new Date(),
    relatedItems: [opp.itemId],
    actionable: signal === 'strong_buy' || signal === 'buy',
    actions: actionItems,
  }
}

/** Generate pattern-based warnings */
export function generatePatternWarnings(patterns: DetectedPattern[], itemName: string, itemId: number): AIInsight[] {
  return patterns
    .filter(p => p.severity === 'high' || p.severity === 'medium')
    .map(p => ({
      id: nextId(),
      title: `${p.icon} ${p.type.replace(/_/g, ' ').toUpperCase()}: ${itemName}`,
      body: `${p.description}\n\n**Recommandation**: ${p.recommendation}\n\n*Confiance: ${p.confidence}% · Sévérité: ${p.severity}*`,
      type: 'warning' as const,
      priority: p.severity === 'high' ? 'high' as const : 'medium' as const,
      icon: p.icon,
      timestamp: new Date(),
      relatedItems: [itemId],
      actionable: true,
      actions: [p.recommendation],
    }))
}

/** Generate strategy suggestions based on day of week */
export function generateTimingStrategies(): AIInsight[] {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const hour = now.getHours()
  const insights: AIInsight[] = []

  // Raid reset (Tuesday / Wednesday depending on region)
  if (dayOfWeek === 1 || (dayOfWeek === 2 && hour < 12)) {
    insights.push({
      id: nextId(),
      title: '⏰ Pré-Reset: Vendez vos consommables!',
      body: 'Le reset hebdomadaire approche. Les prix des flacons, potions, enchants et nourriture atteignent leur pic ce soir/demain matin.\n\n**Action**: Postez vos consommables MAINTENANT pour profiter de la demande maximale.',
      type: 'strategy',
      priority: 'high',
      icon: '⏰',
      timestamp: now,
      actionable: true,
      actions: [
        '🧪 Poster les flacons/phials à prix premium',
        '✨ Poster les enchantements',
        '💎 Poster les gems coupées',
        '🍖 Poster la nourriture de raid',
      ],
    })
  }

  // Weekend farming advice (Saturday/Sunday)
  if (dayOfWeek === 6 || dayOfWeek === 0) {
    insights.push({
      id: nextId(),
      title: '📉 Weekend: Achetez les matériaux!',
      body: 'Les prix des matériaux bruts (herbes, minerais, cuir) baissent le weekend à cause de l\'afflux de farmers.\n\n**Action**: Achetez maintenant et stockez pour craft/revente mardi.',
      type: 'strategy',
      priority: 'medium',
      icon: '📉',
      timestamp: now,
      actionable: true,
      actions: [
        '🌿 Acheter herbes sous la MA7',
        '⛏️ Acheter minerais à prix cassé',
        '📦 Stocker pour craft mardi',
      ],
    })
  }

  // Monday morning
  if (dayOfWeek === 1 && hour < 12) {
    insights.push({
      id: nextId(),
      title: '🏭 Lundi matin: Craftez en masse!',
      body: 'Les matériaux sont encore bon marché du weekend. Craftez maintenant pour vendre ce soir/demain au prix fort.',
      type: 'strategy',
      priority: 'medium',
      icon: '🏭',
      timestamp: now,
      actionable: true,
      actions: [
        '⚗️ Crafter flacons avec les herbes bon marché',
        '⚒️ Crafter gear avec les minerais stockés',
        '📜 Crafter missives et vantus runes',
      ],
    })
  }

  return insights
}

// ── Daily Report Generator ───────────────────────────────────────────────────

export function generateDailyReport(opportunities: RankedOpportunity[]): DailyReport {
  const now = new Date()
  const topOpps = opportunities.slice(0, 5)
  const warnings = opportunities.flatMap(o => generatePatternWarnings(o.patterns, o.itemName, o.itemId))
  const timingStrategies = generateTimingStrategies()

  const avgROI = opportunities.length > 0
    ? opportunities.reduce((s, o) => s + o.roi, 0) / opportunities.length
    : 0

  const trendingUp = opportunities.filter(o => o.marketScores.trendDirection === 'bullish').length
  const trendingDown = opportunities.filter(o => o.marketScores.trendDirection === 'bearish').length
  const avgVolatility = opportunities.length > 0
    ? opportunities.reduce((s, o) => s + o.marketScores.volatilityScore, 0) / opportunities.length
    : 0

  const sentiment: DailyReport['marketSentiment'] =
    trendingUp > trendingDown * 1.5 ? 'bullish' :
    trendingDown > trendingUp * 1.5 ? 'bearish' :
    avgVolatility > 60 ? 'mixed' : 'neutral'

  const sentimentEmoji = { bullish: '🟢', bearish: '🔴', neutral: '⚪', mixed: '🟡' }
  const sentimentLabel = { bullish: 'Haussier', bearish: 'Baissier', neutral: 'Neutre', mixed: 'Mixte' }

  const summary = [
    `## Rapport du ${now.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
    '',
    `**Sentiment du marché**: ${sentimentEmoji[sentiment]} ${sentimentLabel[sentiment]}`,
    `**Opportunités détectées**: ${opportunities.filter(o => o.signal === 'strong_buy' || o.signal === 'buy').length}`,
    `**ROI moyen**: ${avgROI.toFixed(1)}%`,
    `**Tendances**: ${trendingUp} items en hausse, ${trendingDown} en baisse`,
    '',
    `### Top 3 Opportunités`,
    ...topOpps.slice(0, 3).map((o, i) =>
      `${i + 1}. **${o.itemName}** — ${formatGold(o.estimatedProfit, true)} profit · ${o.roi}% ROI · Signal: ${o.signal}`
    ),
    '',
    warnings.length > 0 ? `### ⚠️ Alertes (${warnings.length})` : '',
    ...warnings.slice(0, 3).map(w => `- ${w.title}`),
  ].filter(Boolean).join('\n')

  return {
    date: now.toISOString().split('T')[0],
    summary,
    marketSentiment: sentiment,
    topOpportunities: topOpps.map(generateItemInsight),
    warnings: warnings.slice(0, 10),
    strategies: timingStrategies,
    keyMetrics: {
      avgROI: Math.round(avgROI * 10) / 10,
      totalOpportunities: opportunities.filter(o => o.signal === 'strong_buy' || o.signal === 'buy').length,
      marketVolatility: avgVolatility > 60 ? 'Élevée' : avgVolatility > 30 ? 'Modérée' : 'Faible',
      trendingUp,
      trendingDown,
    },
  }
}
