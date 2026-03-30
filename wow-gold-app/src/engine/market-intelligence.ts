/**
 * Market Intelligence Engine
 * Core computation module: scores, moving averages, trends, anomaly detection
 *
 * All monetary values in COPPER (10,000 copper = 1 gold)
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface PriceSnapshot {
  date: string          // ISO date
  price: number         // market value in copper
  minPrice: number      // minimum buyout
  quantity: number      // available quantity
}

export type TrendDirection = 'bullish' | 'bearish' | 'neutral' | 'volatile'
export type SignalType = 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell'

export interface MarketScores {
  healthScore: number        // 0–100 — overall market health
  volatilityScore: number    // 0–100 — how volatile (high = risky)
  opportunityScore: number   // 0–100 — how good the opportunity is
  trendDirection: TrendDirection
  signal: SignalType
  confidence: number         // 0–100
}

export interface MovingAverages {
  ma7: number
  ma14: number
  ma30: number
  currentPrice: number
  deviationFromMa7: number   // % above/below 7d MA
  deviationFromMa30: number  // % above/below 30d MA
}

export interface VolatilityMetrics {
  standardDeviation: number
  coefficientOfVariation: number  // stdDev / mean — normalized volatility
  maxDrawdown: number             // max peak-to-trough drop %
  priceRange: number              // (max - min) / mean %
  dailyVolatility: number         // avg daily change %
}

export interface TrendMetrics {
  direction: TrendDirection
  strength: number           // 0–100
  slope: number              // price change per day
  daysInTrend: number
  momentum: number           // rate of change acceleration
  supportLevel: number       // estimated floor price
  resistanceLevel: number    // estimated ceiling price
}

export interface AnomalyResult {
  isAnomaly: boolean
  type: 'price_spike' | 'price_crash' | 'volume_spike' | 'volume_drought' | null
  severity: 'low' | 'medium' | 'high' | null
  zScore: number
  description: string
}

// ── Calculations ─────────────────────────────────────────────────────────────

/** Simple moving average over the last N data points */
export function calcMovingAverage(data: PriceSnapshot[], period: number): number {
  if (data.length === 0) return 0
  const slice = data.slice(-period)
  return slice.reduce((s, d) => s + d.price, 0) / slice.length
}

/** Exponential moving average for more recent-weighted trends */
export function calcEMA(data: PriceSnapshot[], period: number): number {
  if (data.length === 0) return 0
  const k = 2 / (period + 1)
  let ema = data[0].price
  for (let i = 1; i < data.length; i++) {
    ema = data[i].price * k + ema * (1 - k)
  }
  return ema
}

/** Compute all moving averages for a dataset */
export function calcAllMovingAverages(data: PriceSnapshot[]): MovingAverages {
  const current = data.length > 0 ? data[data.length - 1].price : 0
  const ma7 = calcMovingAverage(data, 7)
  const ma14 = calcMovingAverage(data, 14)
  const ma30 = calcMovingAverage(data, 30)

  return {
    ma7,
    ma14,
    ma30,
    currentPrice: current,
    deviationFromMa7: ma7 > 0 ? ((current - ma7) / ma7) * 100 : 0,
    deviationFromMa30: ma30 > 0 ? ((current - ma30) / ma30) * 100 : 0,
  }
}

/** Standard deviation */
function stdDev(values: number[]): number {
  if (values.length < 2) return 0
  const mean = values.reduce((s, v) => s + v, 0) / values.length
  const sqDiffs = values.map((v) => (v - mean) ** 2)
  return Math.sqrt(sqDiffs.reduce((s, v) => s + v, 0) / (values.length - 1))
}

/** Compute volatility metrics */
export function calcVolatility(data: PriceSnapshot[]): VolatilityMetrics {
  if (data.length < 3) {
    return { standardDeviation: 0, coefficientOfVariation: 0, maxDrawdown: 0, priceRange: 0, dailyVolatility: 0 }
  }

  const prices = data.map((d) => d.price)
  const mean = prices.reduce((s, v) => s + v, 0) / prices.length
  const sd = stdDev(prices)
  const cv = mean > 0 ? sd / mean : 0

  // Max drawdown
  let peak = prices[0]
  let maxDd = 0
  for (const p of prices) {
    if (p > peak) peak = p
    const dd = (peak - p) / peak
    if (dd > maxDd) maxDd = dd
  }

  // Price range
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = mean > 0 ? (max - min) / mean : 0

  // Daily volatility
  const dailyChanges: number[] = []
  for (let i = 1; i < prices.length; i++) {
    if (prices[i - 1] > 0) {
      dailyChanges.push(Math.abs(prices[i] - prices[i - 1]) / prices[i - 1])
    }
  }
  const dailyVol = dailyChanges.length > 0
    ? dailyChanges.reduce((s, v) => s + v, 0) / dailyChanges.length
    : 0

  return {
    standardDeviation: sd,
    coefficientOfVariation: cv,
    maxDrawdown: maxDd * 100,
    priceRange: range * 100,
    dailyVolatility: dailyVol * 100,
  }
}

/** Compute trend direction and strength */
export function calcTrend(data: PriceSnapshot[]): TrendMetrics {
  const defaultTrend: TrendMetrics = {
    direction: 'neutral', strength: 0, slope: 0, daysInTrend: 0,
    momentum: 0, supportLevel: 0, resistanceLevel: 0,
  }
  if (data.length < 5) return defaultTrend

  const prices = data.map((d) => d.price)
  const n = prices.length

  // Linear regression slope
  const xMean = (n - 1) / 2
  const yMean = prices.reduce((s, v) => s + v, 0) / n
  let num = 0, den = 0
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (prices[i] - yMean)
    den += (i - xMean) ** 2
  }
  const slope = den !== 0 ? num / den : 0

  // Normalized slope (% change per day relative to mean)
  const normSlope = yMean > 0 ? (slope / yMean) * 100 : 0

  // Momentum: acceleration (second derivative)
  const recentSlope = prices.length >= 7
    ? (prices[n - 1] - prices[n - 7]) / 7
    : slope
  const olderSlope = prices.length >= 14
    ? (prices[n - 7] - prices[n - 14]) / 7
    : slope
  const momentum = yMean > 0 ? ((recentSlope - olderSlope) / yMean) * 100 : 0

  // Count consecutive days in same direction
  let daysInTrend = 1
  const lastDir = prices[n - 1] >= prices[n - 2] ? 1 : -1
  for (let i = n - 2; i > 0; i--) {
    const dir = prices[i] >= prices[i - 1] ? 1 : -1
    if (dir === lastDir) daysInTrend++
    else break
  }

  // Support / Resistance (simple: min/max of last 14 days)
  const recent = prices.slice(-14)
  const supportLevel = Math.min(...recent)
  const resistanceLevel = Math.max(...recent)

  // Direction classification
  const vol = calcVolatility(data)
  let direction: TrendDirection = 'neutral'
  if (vol.coefficientOfVariation > 0.15) direction = 'volatile'
  else if (normSlope > 1) direction = 'bullish'
  else if (normSlope < -1) direction = 'bearish'

  // Strength 0–100
  const strength = Math.min(100, Math.abs(normSlope) * 10)

  return { direction, strength, slope, daysInTrend, momentum, supportLevel, resistanceLevel }
}

/** Detect anomalies using z-score */
export function detectAnomaly(data: PriceSnapshot[]): AnomalyResult {
  const noAnomaly: AnomalyResult = { isAnomaly: false, type: null, severity: null, zScore: 0, description: '' }
  if (data.length < 7) return noAnomaly

  const prices = data.map((d) => d.price)
  const volumes = data.map((d) => d.quantity)
  const current = prices[prices.length - 1]
  const currentVol = volumes[volumes.length - 1]

  const priceMean = prices.slice(0, -1).reduce((s, v) => s + v, 0) / (prices.length - 1)
  const priceSD = stdDev(prices.slice(0, -1))
  const volMean = volumes.slice(0, -1).reduce((s, v) => s + v, 0) / (volumes.length - 1)
  const volSD = stdDev(volumes.slice(0, -1))

  const priceZ = priceSD > 0 ? (current - priceMean) / priceSD : 0
  const volZ = volSD > 0 ? (currentVol - volMean) / volSD : 0

  // Price anomaly (|z| > 2)
  if (Math.abs(priceZ) > 2) {
    const type = priceZ > 0 ? 'price_spike' as const : 'price_crash' as const
    const severity = Math.abs(priceZ) > 3 ? 'high' as const : Math.abs(priceZ) > 2.5 ? 'medium' as const : 'low' as const
    const pct = ((current - priceMean) / priceMean * 100).toFixed(1)
    return {
      isAnomaly: true,
      type,
      severity,
      zScore: priceZ,
      description: type === 'price_spike'
        ? `Prix anormalement élevé (+${pct}% vs moyenne). Possible manipulation ou pénurie.`
        : `Prix anormalement bas (${pct}% vs moyenne). Possible liquidation ou crash.`,
    }
  }

  // Volume anomaly
  if (Math.abs(volZ) > 2) {
    const type = volZ > 0 ? 'volume_spike' as const : 'volume_drought' as const
    return {
      isAnomaly: true,
      type,
      severity: Math.abs(volZ) > 3 ? 'high' : 'medium',
      zScore: volZ,
      description: type === 'volume_spike'
        ? `Volume anormalement élevé. Afflux massif de vendeurs — pression baissière attendue.`
        : `Volume anormalement bas. Pénurie de stock — potentiel de hausse.`,
    }
  }

  return noAnomaly
}

/** Generate composite market signal */
export function generateSignal(
  ma: MovingAverages,
  trend: TrendMetrics,
  vol: VolatilityMetrics,
  anomaly: AnomalyResult
): SignalType {
  let score = 50 // neutral

  // Price below MA = buy signal, above = sell
  score -= ma.deviationFromMa7 * 2     // below MA7 → + buy
  score -= ma.deviationFromMa30 * 1.5  // below MA30 → + buy

  // Trend
  if (trend.direction === 'bullish') score -= 10  // momentum up = price rising = less buy
  if (trend.direction === 'bearish') score += 15  // price falling = buy opportunity

  // High volatility = caution
  if (vol.coefficientOfVariation > 0.2) score = score * 0.8 + 50 * 0.2 // pull toward neutral

  // Anomaly
  if (anomaly.type === 'price_crash') score += 20
  if (anomaly.type === 'price_spike') score -= 20
  if (anomaly.type === 'volume_drought') score += 10

  if (score >= 75) return 'strong_buy'
  if (score >= 60) return 'buy'
  if (score <= 25) return 'strong_sell'
  if (score <= 40) return 'sell'
  return 'hold'
}

/** Compute all market scores for an item */
export function computeMarketScores(data: PriceSnapshot[]): MarketScores {
  if (data.length < 3) {
    return {
      healthScore: 50, volatilityScore: 0, opportunityScore: 0,
      trendDirection: 'neutral', signal: 'hold', confidence: 0,
    }
  }

  const ma = calcAllMovingAverages(data)
  const vol = calcVolatility(data)
  const trend = calcTrend(data)
  const anomaly = detectAnomaly(data)
  const signal = generateSignal(ma, trend, vol, anomaly)

  // Health score: low volatility + consistent volume + clear trend = healthy
  const volPenalty = Math.min(50, vol.coefficientOfVariation * 200)
  const trendBonus = trend.strength * 0.3
  const volumeConsistency = data.length >= 7
    ? 100 - Math.min(100, (stdDev(data.slice(-7).map((d) => d.quantity)) / (data.slice(-7).reduce((s, d) => s + d.quantity, 0) / 7)) * 100)
    : 50
  const healthScore = Math.max(0, Math.min(100, 70 - volPenalty + trendBonus + volumeConsistency * 0.2))

  // Volatility score (0 = stable, 100 = extremely volatile)
  const volatilityScore = Math.min(100, vol.coefficientOfVariation * 400 + vol.dailyVolatility * 10)

  // Opportunity score: deviation from MA + volume + trend alignment
  const maDeviation = Math.abs(ma.deviationFromMa30)
  const isBelowMA = ma.deviationFromMa30 < 0
  const oppBase = isBelowMA ? maDeviation * 3 : maDeviation * 1.5
  const trendAlign = (isBelowMA && trend.direction === 'bearish') ? 15 : 0 // bottoming = opportunity
  const opportunityScore = Math.max(0, Math.min(100, oppBase + trendAlign + (anomaly.isAnomaly ? 20 : 0)))

  // Confidence: based on data points available
  const confidence = Math.min(100, data.length * 3 + (trend.daysInTrend > 3 ? 15 : 0))

  return {
    healthScore: Math.round(healthScore),
    volatilityScore: Math.round(volatilityScore),
    opportunityScore: Math.round(opportunityScore),
    trendDirection: trend.direction,
    signal,
    confidence: Math.round(confidence),
  }
}
