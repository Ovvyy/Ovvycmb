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
    224254: 900,    // Sableleaf
    224255: 6500,   // Twilight Bloom
    // Midnight Ore
    224270: 600,    // Ironclaw Ore
    224271: 4800,   // Null Stone
    224272: 12000,  // Voidforged Ore
    224273: 1800,   // Dawnsteel Bar
    224274: 8500,   // Voidforged Ingot
    // Midnight Cloth/Leather
    224280: 400,    // Duskweave Cloth
    224281: 700,    // Voidscale Leather
    224282: 3200,   // Duskweave Bolt
    224283: 5800,   // Tempered Voidscale
    // Midnight Gems
    224290: 8000,   // Shadowgem
    224291: 32000,  // Voidcrystal
    224292: 25000,  // Dawn Amethyst
    224293: 22000,  // Sable Diamond
    224294: 75000,  // Eternal Void Opal
    // Midnight Crafting
    224300: 85000,  // Spark of Radiance
    224301: 15000,  // Dawncrest
    224302: 12000,  // Mote of Pure Void
    224303: 4500,   // Concentration Shard
    224304: 120000, // Primal Void Essence
    // Midnight Enchanting
    224310: 3500,   // Void Shard
    224311: 18000,  // Resonant Void
    224312: 28000,  // Greater Void Shard
    224313: 800,    // Prismatic Void Dust
    // Midnight Alchemy
    224320: 22000,  // Flask of the Void
    224321: 20000,  // Flask of Radiant Power
    224322: 4500,   // Potion of Void Clarity
    224323: 85000,  // Cauldron of the Void
    224324: 45000,  // Transmutation: Null Stone
    // Midnight Inscription
    224330: 600,    // Vellum of Shadows
    224331: 95000,  // Darkmoon Card: Void
    // Midnight Crafted Gear (BoE)
    224340: 320000, // Void-Etched Helmet
    224341: 280000, // Ironclaw Pauldrons
    224342: 260000, // Dawnsteel Gauntlets
    224343: 240000, // Voidscale Boots
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
