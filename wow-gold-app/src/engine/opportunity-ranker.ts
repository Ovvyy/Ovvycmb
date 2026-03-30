/**
 * Opportunity Ranker
 * Ranks ALL items across all strategies by profit, speed, and risk.
 */

import type { PriceSnapshot, MarketScores, SignalType } from './market-intelligence'
import { computeMarketScores, calcAllMovingAverages, calcVolatility, calcTrend } from './market-intelligence'
import { detectAllPatterns, analyzeWeeklyCycle, type WeeklyCycle, type DetectedPattern } from './pattern-detection'

export type OpportunityType = 'flip' | 'craft' | 'snipe' | 'farm' | 'hold'

export interface RankedOpportunity {
  rank: number
  itemId: number
  itemName: string
  type: OpportunityType
  signal: SignalType

  // Scores
  overallScore: number       // 0–100 composite ranking
  profitScore: number        // 0–100
  speedScore: number         // 0–100 how fast can you profit
  riskScore: number          // 0–100 (inverted: 100 = safest)

  // Data
  currentPrice: number
  targetPrice: number
  estimatedProfit: number
  roi: number
  volume: number

  // Intelligence
  marketScores: MarketScores
  patterns: DetectedPattern[]
  weeklyCycle: WeeklyCycle
  aiSummary: string          // plain language explanation
  actionItems: string[]      // concrete next steps

  // Visual
  signalColor: 'green' | 'yellow' | 'red' | 'blue'
  urgency: 'now' | 'soon' | 'watch' | 'avoid'
}

export interface ItemData {
  itemId: number
  name: string
  currentPrice: number
  minBuyout: number
  volume: number
  priceHistory: PriceSnapshot[]
  craftingCost?: number
}

function signalColor(signal: SignalType): 'green' | 'yellow' | 'red' | 'blue' {
  switch (signal) {
    case 'strong_buy': return 'green'
    case 'buy': return 'green'
    case 'hold': return 'yellow'
    case 'sell': return 'red'
    case 'strong_sell': return 'red'
  }
}

function urgencyFromScore(score: number, signal: SignalType): RankedOpportunity['urgency'] {
  if (signal === 'strong_buy' && score > 70) return 'now'
  if (score > 60) return 'soon'
  if (score > 30) return 'watch'
  return 'avoid'
}

/** Generate plain-language summary of the opportunity */
function generateSummary(
  item: ItemData,
  scores: MarketScores,
  patterns: DetectedPattern[],
  cycle: WeeklyCycle,
  _type: OpportunityType,
): string {
  const parts: string[] = []

  // Price context
  if (scores.signal === 'strong_buy' || scores.signal === 'buy') {
    parts.push(`${item.name} est actuellement sous-évalué`)
  } else if (scores.signal === 'sell' || scores.signal === 'strong_sell') {
    parts.push(`${item.name} est en zone de surachat`)
  } else {
    parts.push(`${item.name} est à un prix neutre`)
  }

  // Trend
  if (scores.trendDirection === 'bullish') parts.push('avec une tendance haussière')
  else if (scores.trendDirection === 'bearish') parts.push('avec une tendance baissière')

  // Patterns
  if (patterns.length > 0) {
    parts.push(`. ${patterns[0].description}`)
  }

  // Weekly cycle
  if (cycle.confidence > 50) {
    parts.push(`. Meilleur jour d'achat: ${cycle.bestBuyDay} (-${cycle.avgBuyDiscount}%), meilleur jour de vente: ${cycle.bestSellDay} (+${cycle.avgSellPremium}%)`)
  }

  return parts.join('')  + '.'
}

/** Generate action items */
function generateActions(
  scores: MarketScores,
  patterns: DetectedPattern[],
  type: OpportunityType,
  cycle: WeeklyCycle,
): string[] {
  const actions: string[] = []

  if (scores.signal === 'strong_buy') {
    actions.push('🟢 ACHETER maintenant — prix en dessous de la moyenne')
  } else if (scores.signal === 'buy') {
    actions.push('🟢 Accumuler progressivement')
  } else if (scores.signal === 'sell' || scores.signal === 'strong_sell') {
    actions.push('🔴 Vendre votre stock maintenant')
  }

  if (type === 'craft') {
    actions.push('⚒️ Vérifier le coût de craft vs prix marché')
  }

  if (cycle.confidence > 50) {
    actions.push(`📅 Acheter le ${cycle.bestBuyDay}, vendre le ${cycle.bestSellDay}`)
  }

  for (const p of patterns.slice(0, 2)) {
    actions.push(`${p.icon} ${p.recommendation}`)
  }

  if (scores.volatilityScore > 70) {
    actions.push('⚠️ Volatilité élevée — réduire la taille des positions')
  }

  return actions
}

/** Rank a single item and produce a full opportunity analysis */
export function analyzeOpportunity(item: ItemData): RankedOpportunity {
  const scores = computeMarketScores(item.priceHistory)
  const patterns = detectAllPatterns(item.priceHistory)
  const cycle = analyzeWeeklyCycle(item.priceHistory)
  const volatility = calcVolatility(item.priceHistory)
  const trend = calcTrend(item.priceHistory)
  const ma = calcAllMovingAverages(item.priceHistory)

  // Determine opportunity type
  const type: OpportunityType = item.craftingCost && item.craftingCost < item.currentPrice * 0.85
    ? 'craft'
    : ma.deviationFromMa30 < -10 ? 'snipe'
    : scores.signal === 'strong_buy' ? 'flip'
    : 'hold'

  // Target price: MA30 for underpriced items, resistance for flips
  const targetPrice = type === 'snipe' || type === 'flip'
    ? Math.round(ma.ma30 * 1.05)
    : Math.round(trend.resistanceLevel)

  const estimatedProfit = Math.round((targetPrice - item.currentPrice) * 0.95) // after AH cut
  const roi = item.currentPrice > 0 ? (estimatedProfit / item.currentPrice) * 100 : 0

  // Scores (0-100)
  const profitScore = Math.min(100, Math.max(0, roi * 1.5))
  const speedScore = Math.min(100, Math.max(0, item.volume / 10)) // volume driven
  const riskScoreRaw = volatility.coefficientOfVariation * 300 + (patterns.some(p => p.type === 'manipulation') ? 30 : 0)
  const safetyScore = Math.max(0, Math.min(100, 100 - riskScoreRaw))

  const overallScore = Math.round(
    profitScore * 0.4 +
    speedScore * 0.25 +
    safetyScore * 0.2 +
    scores.opportunityScore * 0.15
  )

  const aiSummary = generateSummary(item, scores, patterns, cycle, type)
  const actionItems = generateActions(scores, patterns, type, cycle)

  return {
    rank: 0, // set after sorting
    itemId: item.itemId,
    itemName: item.name,
    type,
    signal: scores.signal,
    overallScore: Math.max(0, Math.min(100, overallScore)),
    profitScore: Math.round(profitScore),
    speedScore: Math.round(speedScore),
    riskScore: Math.round(safetyScore),
    currentPrice: item.currentPrice,
    targetPrice,
    estimatedProfit,
    roi: Math.round(roi * 10) / 10,
    volume: item.volume,
    marketScores: scores,
    patterns,
    weeklyCycle: cycle,
    aiSummary,
    actionItems,
    signalColor: signalColor(scores.signal),
    urgency: urgencyFromScore(overallScore, scores.signal),
  }
}

/** Rank all items and return sorted opportunities */
export function rankAllOpportunities(items: ItemData[]): RankedOpportunity[] {
  const opportunities = items.map(analyzeOpportunity)
  opportunities.sort((a, b) => b.overallScore - a.overallScore)
  opportunities.forEach((o, i) => { o.rank = i + 1 })
  return opportunities
}
