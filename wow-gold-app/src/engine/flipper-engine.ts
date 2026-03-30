/**
 * Advanced Flipper Engine
 * Expected profit/hour, sell rate estimation, competition density, deposit costs
 */

import type { PriceSnapshot } from './market-intelligence'
import { calcVolatility, calcTrend } from './market-intelligence'

export interface FlipAnalysis {
  itemId: number
  itemName: string

  // Pricing
  buyPrice: number
  sellPrice: number
  depositCost: number
  ahCut: number
  netProfit: number
  roi: number

  // Time & Speed
  estimatedSellTimeHours: number
  expectedProfitPerHour: number
  sellRateProbability: number     // 0–100 % chance of selling within 48h

  // Competition
  competitionDensity: number      // 0–100 (high = many sellers)
  averageListings: number
  undercutRisk: number            // 0–100

  // Risk
  riskScore: number               // 0–100 (higher = riskier)
  riskFactors: string[]

  // Composite
  overallScore: number            // 0–100 final ranking score
  signal: 'strong_flip' | 'flip' | 'risky_flip' | 'avoid'
}

// ── Estimation Functions ─────────────────────────────────────────────────────

/** Estimate sell time in hours based on volume and competition */
function estimateSellTime(
  dailyVolume: number,
  listings: number,
  price: number,
  avgPrice: number,
): number {
  if (dailyVolume <= 0) return 168 // 7 days default

  // Base: how long to sell one unit at current volume
  const baseHours = (24 / dailyVolume) * listings

  // Price factor: underpriced items sell faster
  const priceFactor = avgPrice > 0 ? Math.max(0.5, price / avgPrice) : 1

  // Volume factor: high-volume items sell faster
  const volumeFactor = dailyVolume > 100 ? 0.7 : dailyVolume > 20 ? 1.0 : 1.5

  return Math.max(1, baseHours * priceFactor * volumeFactor)
}

/** Estimate probability of selling within 48 hours */
function estimateSellRate(
  dailyVolume: number,
  listings: number,
  priceVsMarket: number, // ratio: our price / market price
): number {
  if (dailyVolume <= 0) return 10

  // Base rate from volume (high volume = high sell rate)
  const volumeRate = Math.min(80, dailyVolume * 2)

  // Price discount bonus
  const priceBonus = priceVsMarket < 0.95 ? 15 : priceVsMarket < 1.0 ? 10 : 0

  // Competition penalty
  const compPenalty = Math.min(30, listings * 1.5)

  return Math.max(5, Math.min(98, volumeRate + priceBonus - compPenalty))
}

/** Estimate competition density */
function estimateCompetition(
  listings: number,
  dailyVolume: number,
): { density: number; undercutRisk: number } {
  const density = dailyVolume > 0
    ? Math.min(100, (listings / dailyVolume) * 100)
    : listings > 0 ? 80 : 0

  // Undercut risk: many listings + low volume = high undercut risk
  const undercutRisk = density > 50 ? Math.min(90, density * 1.2) : density * 0.8

  return { density: Math.round(density), undercutRisk: Math.round(undercutRisk) }
}

/** Calculate deposit cost estimate (retail WoW: vendor price * quantity * duration factor) */
function calcDepositCost(vendorPrice: number, stackSize: number): number {
  // Simplified: deposits are typically vendor_price * 0.15 per 12h listing
  return Math.max(100, Math.round(vendorPrice * stackSize * 0.15))
}

/** Identify risk factors */
function identifyRisks(
  volatility: number,
  sellRate: number,
  competitionDensity: number,
  roi: number,
  priceHistory: PriceSnapshot[],
): string[] {
  const risks: string[] = []

  if (volatility > 60) risks.push('Haute volatilité — prix imprévisible')
  if (sellRate < 30) risks.push('Taux de vente faible — peut stagner longtemps')
  if (competitionDensity > 70) risks.push('Forte concurrence — risque d\'undercut')
  if (roi > 100) risks.push('ROI trop élevé — méfiance, possible piège')

  if (priceHistory.length >= 7) {
    const trend = calcTrend(priceHistory)
    if (trend.direction === 'bearish' && trend.strength > 30) {
      risks.push('Tendance baissière active — prix en déclin')
    }
  }

  if (risks.length === 0) risks.push('Aucun risque majeur identifié')
  return risks
}

// ── Main Analysis ────────────────────────────────────────────────────────────

export interface FlipInput {
  itemId: number
  itemName: string
  currentBuyPrice: number
  currentSellPrice: number
  dailyVolume: number
  activeListings: number
  vendorPrice: number
  priceHistory: PriceSnapshot[]
}

export function analyzeFlip(input: FlipInput): FlipAnalysis {
  const {
    itemId, itemName, currentBuyPrice, currentSellPrice,
    dailyVolume, activeListings, vendorPrice, priceHistory,
  } = input

  const deposit = calcDepositCost(vendorPrice, 1)
  const ahCutAmount = Math.round(currentSellPrice * 0.05)
  const netProfit = currentSellPrice - ahCutAmount - currentBuyPrice - deposit
  const roi = currentBuyPrice > 0 ? (netProfit / currentBuyPrice) * 100 : 0

  const avgPrice = priceHistory.length > 0
    ? priceHistory.reduce((s, d) => s + d.price, 0) / priceHistory.length
    : currentSellPrice

  const sellTimeHours = estimateSellTime(dailyVolume, activeListings, currentSellPrice, avgPrice)
  const expectedPPH = sellTimeHours > 0 ? netProfit / sellTimeHours : 0
  const sellRate = estimateSellRate(dailyVolume, activeListings, currentSellPrice / avgPrice)
  const { density, undercutRisk } = estimateCompetition(activeListings, dailyVolume)

  const vol = calcVolatility(priceHistory)
  const volatilityPct = Math.min(100, vol.coefficientOfVariation * 400)
  const riskFactors = identifyRisks(volatilityPct, sellRate, density, roi, priceHistory)

  // Risk score: weighted combination
  const riskScore = Math.min(100, Math.round(
    volatilityPct * 0.25 +
    (100 - sellRate) * 0.3 +
    undercutRisk * 0.2 +
    (roi > 100 ? 20 : 0) +
    riskFactors.filter((r) => !r.includes('Aucun')).length * 5
  ))

  // Overall score: profit potential weighed against risk
  const profitNorm = Math.min(100, (expectedPPH / 500) * 100)  // 500 copper/hr = 100 score
  const overallScore = Math.round(
    profitNorm * 0.35 +
    sellRate * 0.25 +
    (100 - riskScore) * 0.25 +
    Math.min(100, roi) * 0.15
  )

  // Signal
  let signal: FlipAnalysis['signal'] = 'avoid'
  if (overallScore >= 70 && riskScore < 40) signal = 'strong_flip'
  else if (overallScore >= 50 && riskScore < 60) signal = 'flip'
  else if (overallScore >= 35) signal = 'risky_flip'

  return {
    itemId, itemName,
    buyPrice: currentBuyPrice,
    sellPrice: currentSellPrice,
    depositCost: deposit,
    ahCut: ahCutAmount,
    netProfit,
    roi: Math.round(roi * 10) / 10,
    estimatedSellTimeHours: Math.round(sellTimeHours * 10) / 10,
    expectedProfitPerHour: Math.round(expectedPPH),
    sellRateProbability: Math.round(sellRate),
    competitionDensity: density,
    averageListings: activeListings,
    undercutRisk,
    riskScore,
    riskFactors,
    overallScore: Math.max(0, Math.min(100, overallScore)),
    signal,
  }
}

/** Rank multiple flip opportunities by overall score */
export function rankFlipOpportunities(analyses: FlipAnalysis[]): FlipAnalysis[] {
  return [...analyses].sort((a, b) => b.overallScore - a.overallScore)
}
