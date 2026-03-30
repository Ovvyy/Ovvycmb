/**
 * Mock data generators that produce engine-compatible data
 * Used until live Blizzard API is connected
 */

import type { PriceSnapshot } from '@/engine/market-intelligence'
import type { ItemData } from '@/engine/opportunity-ranker'
import { TRACKED_ITEMS } from '@/data/items'

/** Generate PriceSnapshot[] for an item (30 days) */
export function generatePriceSnapshots(basePrice: number, days = 30, volatility = 0.08): PriceSnapshot[] {
  const snaps: PriceSnapshot[] = []
  let price = basePrice
  for (let i = days; i >= 0; i--) {
    const dayOfWeek = new Date(Date.now() - i * 86400000).getDay()
    // Weekend dip for mats, midweek spike for consumables
    const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? -0.03 : (dayOfWeek === 2 || dayOfWeek === 3) ? 0.02 : 0
    const variance = (Math.random() - 0.48) * volatility + weekendFactor
    price = Math.max(100, price * (1 + variance))
    const date = new Date(Date.now() - i * 86400000)
    snaps.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(price),
      minPrice: Math.round(price * (0.82 + Math.random() * 0.08)),
      quantity: Math.floor(Math.random() * 500) + 50 + (dayOfWeek === 0 || dayOfWeek === 6 ? 200 : 0),
    })
  }
  return snaps
}

/** Generate full ItemData for tracked items */
export function generateMockItemData(): ItemData[] {
  const basePrices: Record<number, number> = {
    // Midnight Herbs
    224249: 1200,   // Sinbloom
    224250: 3500,   // Dusk Lotus
    224251: 800,    // Emberveil Fern
    224252: 5200,   // Voidbloom
    224253: 1800,   // Dawnpetal
    // Midnight Ore
    224270: 600,    // Ironclaw Ore
    224271: 4800,   // Null Stone
    224272: 12000,  // Voidforged Ore
    // Midnight Cloth/Leather
    224280: 400,    // Duskweave Cloth
    224281: 700,    // Voidscale Leather
    // Midnight Gems
    224290: 8000,   // Shadowgem
    224291: 32000,  // Voidcrystal
    224292: 25000,  // Dawn Amethyst
    // Midnight Crafting
    224300: 85000,  // Spark of Radiance
    224301: 15000,  // Dawncrest
    224302: 12000,  // Mote of Pure Void
    // Midnight Enchanting
    224310: 3500,   // Void Shard
    224311: 18000,  // Resonant Void
    // TWW
    210787: 500,
    210786: 450,
    210785: 380,
    210782: 600,
    210777: 300,
    210778: 2800,
    // DF
    193057: 200,
    193059: 350,
    194127: 4500,
    194128: 12000,
  }

  return TRACKED_ITEMS.map(item => {
    const base = basePrices[item.id] ?? 1000
    const history = generatePriceSnapshots(base, 30)
    const current = history[history.length - 1]
    return {
      itemId: item.id,
      name: item.name,
      currentPrice: current.price,
      minBuyout: current.minPrice,
      volume: current.quantity,
      priceHistory: history,
      craftingCost: item.category === 'gem' || item.category === 'enchanting'
        ? Math.round(current.price * (0.5 + Math.random() * 0.3))
        : undefined,
    }
  })
}

/** Generate flip inputs from mock data */
export function generateMockFlipInputs() {
  const items = generateMockItemData()
  return items.map(item => ({
    itemId: item.itemId,
    itemName: item.name,
    currentBuyPrice: item.minBuyout,
    currentSellPrice: item.currentPrice,
    dailyVolume: item.volume,
    activeListings: Math.floor(Math.random() * 30) + 5,
    vendorPrice: Math.round(item.currentPrice * 0.01),
    priceHistory: item.priceHistory,
  }))
}
