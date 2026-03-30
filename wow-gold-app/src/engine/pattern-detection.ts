/**
 * Pattern Detection System
 * Detects supply shocks, demand spikes, crashes, manipulation, weekly cycles
 */

import type { PriceSnapshot } from './market-intelligence'

export type PatternType =
  | 'supply_shock'
  | 'demand_spike'
  | 'market_crash'
  | 'manipulation'
  | 'weekly_cycle_low'
  | 'weekly_cycle_high'
  | 'pre_raid_spike'
  | 'post_reset_dip'
  | 'accumulation'
  | 'distribution'

export interface DetectedPattern {
  type: PatternType
  severity: 'low' | 'medium' | 'high'
  confidence: number       // 0–100
  description: string
  recommendation: string
  detectedAt: string       // ISO date
  icon: string
}

// ── Pattern Detectors ────────────────────────────────────────────────────────

/** Supply shock: sudden quantity drop with price spike */
function detectSupplyShock(data: PriceSnapshot[]): DetectedPattern | null {
  if (data.length < 7) return null
  const recent = data.slice(-3)
  const prior = data.slice(-10, -3)

  const recentQty = recent.reduce((s, d) => s + d.quantity, 0) / recent.length
  const priorQty = prior.reduce((s, d) => s + d.quantity, 0) / prior.length
  const recentPrice = recent[recent.length - 1].price
  const priorPrice = prior.reduce((s, d) => s + d.price, 0) / prior.length

  const qtyDrop = priorQty > 0 ? (priorQty - recentQty) / priorQty : 0
  const priceRise = priorPrice > 0 ? (recentPrice - priorPrice) / priorPrice : 0

  if (qtyDrop > 0.4 && priceRise > 0.15) {
    return {
      type: 'supply_shock',
      severity: qtyDrop > 0.6 ? 'high' : 'medium',
      confidence: Math.min(95, Math.round(qtyDrop * 100 + priceRise * 100)),
      description: `Choc d'offre: quantité en baisse de ${(qtyDrop * 100).toFixed(0)}% avec hausse de prix de ${(priceRise * 100).toFixed(0)}%.`,
      recommendation: 'ACHETER maintenant — prix vont continuer à monter tant que le stock reste faible.',
      detectedAt: recent[recent.length - 1].date,
      icon: '⚡',
    }
  }
  return null
}

/** Demand spike: price increase with stable or increasing volume */
function detectDemandSpike(data: PriceSnapshot[]): DetectedPattern | null {
  if (data.length < 7) return null
  const recent = data.slice(-3)
  const prior = data.slice(-10, -3)

  const recentPrice = recent.reduce((s, d) => s + d.price, 0) / recent.length
  const priorPrice = prior.reduce((s, d) => s + d.price, 0) / prior.length
  const recentQty = recent.reduce((s, d) => s + d.quantity, 0) / recent.length
  const priorQty = prior.reduce((s, d) => s + d.quantity, 0) / prior.length

  const priceRise = priorPrice > 0 ? (recentPrice - priorPrice) / priorPrice : 0
  const qtyStable = priorQty > 0 ? Math.abs(recentQty - priorQty) / priorQty < 0.2 : false
  const qtyRise = priorQty > 0 ? (recentQty - priorQty) / priorQty > 0.1 : false

  if (priceRise > 0.2 && (qtyStable || qtyRise)) {
    return {
      type: 'demand_spike',
      severity: priceRise > 0.4 ? 'high' : 'medium',
      confidence: Math.min(90, Math.round(priceRise * 150)),
      description: `Pic de demande: prix en hausse de ${(priceRise * 100).toFixed(0)}% avec volume stable. Forte demande.`,
      recommendation: 'VENDRE si vous avez du stock. Ou CRAFTER et vendre rapidement.',
      detectedAt: recent[recent.length - 1].date,
      icon: '🔥',
    }
  }
  return null
}

/** Market crash: rapid price decline with volume spike */
function detectMarketCrash(data: PriceSnapshot[]): DetectedPattern | null {
  if (data.length < 7) return null
  const recent = data.slice(-3)
  const prior = data.slice(-10, -3)

  const recentPrice = recent.reduce((s, d) => s + d.price, 0) / recent.length
  const priorPrice = prior.reduce((s, d) => s + d.price, 0) / prior.length
  const recentQty = recent.reduce((s, d) => s + d.quantity, 0) / recent.length
  const priorQty = prior.reduce((s, d) => s + d.quantity, 0) / prior.length

  const priceDrop = priorPrice > 0 ? (priorPrice - recentPrice) / priorPrice : 0
  const qtySpike = priorQty > 0 ? (recentQty - priorQty) / priorQty : 0

  if (priceDrop > 0.25 && qtySpike > 0.3) {
    return {
      type: 'market_crash',
      severity: priceDrop > 0.5 ? 'high' : 'medium',
      confidence: Math.min(90, Math.round(priceDrop * 120)),
      description: `Crash: prix en baisse de ${(priceDrop * 100).toFixed(0)}% avec afflux de vendeurs (+${(qtySpike * 100).toFixed(0)}% volume).`,
      recommendation: 'ATTENDRE que le prix se stabilise, puis ACHETER au point bas.',
      detectedAt: recent[recent.length - 1].date,
      icon: '📉',
    }
  }
  return null
}

/** Manipulation: sudden price spike on very low volume → artificial */
function detectManipulation(data: PriceSnapshot[]): DetectedPattern | null {
  if (data.length < 7) return null
  const recent = data.slice(-2)
  const prior = data.slice(-10, -2)

  const recentPrice = recent[recent.length - 1].price
  const priorPrice = prior.reduce((s, d) => s + d.price, 0) / prior.length
  const recentQty = recent.reduce((s, d) => s + d.quantity, 0) / recent.length
  const priorQty = prior.reduce((s, d) => s + d.quantity, 0) / prior.length

  const priceChange = priorPrice > 0 ? Math.abs(recentPrice - priorPrice) / priorPrice : 0
  const qtyDrop = priorQty > 0 ? (priorQty - recentQty) / priorQty : 0

  if (priceChange > 0.3 && qtyDrop > 0.5) {
    return {
      type: 'manipulation',
      severity: 'high',
      confidence: Math.min(80, Math.round(priceChange * 100)),
      description: `Possible manipulation: variation de prix de ${(priceChange * 100).toFixed(0)}% sur volume très faible (-${(qtyDrop * 100).toFixed(0)}%).`,
      recommendation: 'NE PAS ACHETER. Prix artificiellement gonflé. Attendre le retour à la normale.',
      detectedAt: recent[recent.length - 1].date,
      icon: '⚠️',
    }
  }
  return null
}

/** Accumulation: price stable on increasing volume → someone stocking up */
function detectAccumulation(data: PriceSnapshot[]): DetectedPattern | null {
  if (data.length < 10) return null
  const recent = data.slice(-5)
  const prior = data.slice(-10, -5)

  const recentPrice = recent.reduce((s, d) => s + d.price, 0) / recent.length
  const priorPrice = prior.reduce((s, d) => s + d.price, 0) / prior.length
  const recentQty = recent.reduce((s, d) => s + d.quantity, 0) / recent.length
  const priorQty = prior.reduce((s, d) => s + d.quantity, 0) / prior.length

  const priceStable = priorPrice > 0 ? Math.abs(recentPrice - priorPrice) / priorPrice < 0.05 : false
  const qtyDrop = priorQty > 0 ? (priorQty - recentQty) / priorQty : 0

  if (priceStable && qtyDrop > 0.25) {
    return {
      type: 'accumulation',
      severity: 'medium',
      confidence: Math.round(60 + qtyDrop * 40),
      description: `Phase d'accumulation: prix stable mais stock AH en baisse (-${(qtyDrop * 100).toFixed(0)}%). Quelqu'un stocke.`,
      recommendation: 'ACHETER avant le breakout. Un mouvement haussier est probable.',
      detectedAt: recent[recent.length - 1].date,
      icon: '🧲',
    }
  }
  return null
}

// ── Weekly Cycle Detection ───────────────────────────────────────────────────

export interface WeeklyCycle {
  bestBuyDay: string
  bestSellDay: string
  avgBuyDiscount: number   // % below weekly avg on best buy day
  avgSellPremium: number   // % above weekly avg on best sell day
  confidence: number
  dayScores: Record<string, number>  // day name → relative price index
}

const DAY_NAMES = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

export function analyzeWeeklyCycle(data: PriceSnapshot[]): WeeklyCycle {
  const defaultCycle: WeeklyCycle = {
    bestBuyDay: 'Lun', bestSellDay: 'Mar',
    avgBuyDiscount: 3, avgSellPremium: 8,
    confidence: 40, dayScores: {},
  }
  if (data.length < 14) return defaultCycle

  const dayPrices: Record<number, number[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }

  for (const snap of data) {
    const day = new Date(snap.date).getDay()
    dayPrices[day].push(snap.price)
  }

  const dayAvgs: Record<number, number> = {}
  const overallMean = data.reduce((s, d) => s + d.price, 0) / data.length

  for (let d = 0; d < 7; d++) {
    const vals = dayPrices[d]
    dayAvgs[d] = vals.length > 0 ? vals.reduce((s, v) => s + v, 0) / vals.length : overallMean
  }

  // Find best buy (lowest) and sell (highest) day
  let bestBuy = 0, bestSell = 0
  for (let d = 0; d < 7; d++) {
    if (dayAvgs[d] < dayAvgs[bestBuy]) bestBuy = d
    if (dayAvgs[d] > dayAvgs[bestSell]) bestSell = d
  }

  const buyDiscount = overallMean > 0 ? ((overallMean - dayAvgs[bestBuy]) / overallMean) * 100 : 0
  const sellPremium = overallMean > 0 ? ((dayAvgs[bestSell] - overallMean) / overallMean) * 100 : 0

  const dayScores: Record<string, number> = {}
  for (let d = 0; d < 7; d++) {
    dayScores[DAY_NAMES[d]] = overallMean > 0 ? Math.round((dayAvgs[d] / overallMean) * 100) : 100
  }

  const confidence = Math.min(90, data.length * 1.5 + (buyDiscount + sellPremium) * 5)

  return {
    bestBuyDay: DAY_NAMES[bestBuy],
    bestSellDay: DAY_NAMES[bestSell],
    avgBuyDiscount: Math.round(buyDiscount * 10) / 10,
    avgSellPremium: Math.round(sellPremium * 10) / 10,
    confidence: Math.round(confidence),
    dayScores,
  }
}

// ── Main Detection Pipeline ──────────────────────────────────────────────────

export function detectAllPatterns(data: PriceSnapshot[]): DetectedPattern[] {
  const patterns: DetectedPattern[] = []

  const detectors = [
    detectSupplyShock,
    detectDemandSpike,
    detectMarketCrash,
    detectManipulation,
    detectAccumulation,
  ]

  for (const detector of detectors) {
    const result = detector(data)
    if (result) patterns.push(result)
  }

  // Sort by severity then confidence
  const severityOrder = { high: 0, medium: 1, low: 2 }
  patterns.sort((a, b) =>
    severityOrder[a.severity] - severityOrder[b.severity] || b.confidence - a.confidence
  )

  return patterns
}
