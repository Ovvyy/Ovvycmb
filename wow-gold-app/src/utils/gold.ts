import type { GoldAmount } from '@/types'

/** Convert raw copper value to GoldAmount breakdown */
export function toGoldAmount(copper: number): GoldAmount {
  const raw = Math.round(copper)
  const gold = Math.floor(raw / 10000)
  const silver = Math.floor((raw % 10000) / 100)
  const cop = raw % 100
  return { gold, silver, copper: cop, raw }
}

/** Format a copper value as a readable gold string: "1,234g 56s 78c" */
export function formatGold(copper: number, compact = false): string {
  if (!copper || copper <= 0) return '0g'
  const { gold, silver, copper: cop } = toGoldAmount(copper)

  if (compact) {
    if (gold >= 1_000_000) return `${(gold / 1_000_000).toFixed(1)}Mg`
    if (gold >= 1_000)    return `${(gold / 1_000).toFixed(1)}kg`
    if (gold > 0)         return `${gold.toLocaleString()}g`
    if (silver > 0)       return `${silver}s`
    return `${cop}c`
  }

  const parts: string[] = []
  if (gold > 0)   parts.push(`${gold.toLocaleString()}g`)
  if (silver > 0) parts.push(`${silver}s`)
  if (cop > 0)    parts.push(`${cop}c`)
  return parts.join(' ') || '0g'
}

/** Convert "Xg Ys Zc" or number to copper */
export function toCopperValue(value: number | string): number {
  if (typeof value === 'number') return value
  let total = 0
  const goldMatch = value.match(/(\d+(?:[,\d]*)?)g/)
  const silverMatch = value.match(/(\d+)s/)
  const copperMatch = value.match(/(\d+)c/)
  if (goldMatch)  total += parseInt(goldMatch[1].replace(/,/g, '')) * 10000
  if (silverMatch) total += parseInt(silverMatch[1]) * 100
  if (copperMatch) total += parseInt(copperMatch[1])
  return total
}

/** Calculate profit after AH cut (5%) */
export function afterAHCut(sellPrice: number): number {
  return Math.floor(sellPrice * 0.95)
}

/** Calculate ROI percentage */
export function calcROI(cost: number, revenue: number): number {
  if (cost <= 0) return 0
  return ((revenue - cost) / cost) * 100
}

/** Get profit color class */
export function profitColorClass(profit: number): string {
  if (profit > 0) return 'text-emerald-400'
  if (profit < 0) return 'text-red-400'
  return 'text-gray-400'
}

/** Get ROI badge class */
export function roiBadgeClass(roi: number): string {
  if (roi >= 50) return 'badge-profit'
  if (roi < 0)   return 'badge-loss'
  return 'badge-neutral'
}
