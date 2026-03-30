import type { WowItem } from '@/types'

/**
 * Popular tracked items — WoW Midnight (current expansion, released March 2, 2026)
 * + The War Within + Dragonflight items still in demand
 *
 * Commodities (herbs, ore, cloth) are region-wide via the Blizzard commodity AH endpoint.
 * Non-commodity items (BoEs, recipes, etc.) are per-realm.
 *
 * API source: Blizzard Battle.net AH API
 * Item icons: wow.zamimg.com
 */
export const TRACKED_ITEMS: WowItem[] = [
  // ── Midnight Herbs (commodity, region-wide) ───────────────────────────────
  { id: 224249, name: 'Sinbloom',          quality: 'common', category: 'reagent',  expansion: 'Midnight' },
  { id: 224250, name: 'Dusk Lotus',        quality: 'common', category: 'reagent',  expansion: 'Midnight' },
  { id: 224251, name: 'Emberveil Fern',    quality: 'common', category: 'reagent',  expansion: 'Midnight' },
  { id: 224252, name: 'Voidbloom',         quality: 'common', category: 'reagent',  expansion: 'Midnight' },
  { id: 224253, name: 'Dawnpetal',         quality: 'common', category: 'reagent',  expansion: 'Midnight' },
  // ── Midnight Ore (commodity, region-wide) ────────────────────────────────
  { id: 224270, name: 'Ironclaw Ore',      quality: 'common', category: 'material', expansion: 'Midnight' },
  { id: 224271, name: 'Null Stone',        quality: 'uncommon', category: 'material', expansion: 'Midnight' },
  { id: 224272, name: 'Voidforged Ore',    quality: 'rare',   category: 'material', expansion: 'Midnight' },
  // ── Midnight Leather/Cloth (commodity) ───────────────────────────────────
  { id: 224280, name: 'Duskweave Cloth',   quality: 'common', category: 'material', expansion: 'Midnight' },
  { id: 224281, name: 'Voidscale Leather', quality: 'common', category: 'material', expansion: 'Midnight' },
  // ── Midnight Gems ─────────────────────────────────────────────────────────
  { id: 224290, name: 'Shadowgem',         quality: 'uncommon', category: 'gem',    expansion: 'Midnight' },
  { id: 224291, name: 'Voidcrystal',       quality: 'rare',   category: 'gem',      expansion: 'Midnight' },
  { id: 224292, name: 'Dawn Amethyst',     quality: 'rare',   category: 'gem',      expansion: 'Midnight' },
  // ── Midnight Crafting Materials ───────────────────────────────────────────
  { id: 224300, name: 'Spark of Radiance', quality: 'epic',   category: 'material', expansion: 'Midnight' },
  { id: 224301, name: 'Dawncrest',         quality: 'rare',   category: 'material', expansion: 'Midnight' },
  { id: 224302, name: 'Mote of Pure Void', quality: 'rare',   category: 'reagent',  expansion: 'Midnight' },
  // ── Midnight Enchanting ───────────────────────────────────────────────────
  { id: 224310, name: 'Void Shard',        quality: 'uncommon', category: 'enchanting', expansion: 'Midnight' },
  { id: 224311, name: 'Resonant Void',     quality: 'rare',   category: 'enchanting', expansion: 'Midnight' },
  // ── TWW Herbs (still farmable and sold) ──────────────────────────────────
  { id: 210787, name: 'Ironcap Mushroom',  quality: 'common', category: 'reagent',  expansion: 'The War Within' },
  { id: 210786, name: 'Luredrop',          quality: 'common', category: 'reagent',  expansion: 'The War Within' },
  { id: 210785, name: 'Mycobloom',         quality: 'common', category: 'reagent',  expansion: 'The War Within' },
  { id: 210782, name: 'Arathi Cordifolia', quality: 'common', category: 'reagent',  expansion: 'The War Within' },
  // ── TWW Ore ──────────────────────────────────────────────────────────────
  { id: 210777, name: 'Bismuth',           quality: 'common', category: 'material', expansion: 'The War Within' },
  { id: 210778, name: 'Aqirite',           quality: 'common', category: 'material', expansion: 'The War Within' },
  // ── DF Materials (bags, enchants, still relevant) ────────────────────────
  { id: 193057, name: 'Windswept Thatch',  quality: 'common', category: 'material', expansion: 'Dragonflight' },
  { id: 193059, name: 'Vibrant Wildercloth', quality: 'common', category: 'material', expansion: 'Dragonflight' },
  { id: 194127, name: 'Vibrant Shard',     quality: 'uncommon', category: 'enchanting', expansion: 'Dragonflight' },
  { id: 194128, name: 'Resonant Crystal',  quality: 'rare',   category: 'enchanting', expansion: 'Dragonflight' },
]

/** Item IDs for quick lookup */
export const ITEM_ID_MAP = new Map(TRACKED_ITEMS.map((i) => [i.id, i]))

/** Wowhead item URL */
export function wowheadUrl(itemId: number): string {
  return `https://www.wowhead.com/item=${itemId}`
}

/** Wowhead icon URL */
export function wowheadIconUrl(iconName: string, size: 'small' | 'medium' | 'large' = 'medium'): string {
  return `https://wow.zamimg.com/images/wow/icons/${size}/${iconName}.jpg`
}

/** Quality class name for CSS */
export function qualityClass(quality: string): string {
  const map: Record<string, string> = {
    poor: 'quality-poor', common: 'quality-common', uncommon: 'quality-uncommon',
    rare: 'quality-rare', epic: 'quality-epic', legendary: 'quality-legendary', artifact: 'quality-artifact',
  }
  return map[quality] ?? 'quality-common'
}

/** Generate mock price history */
export function generateMockPriceHistory(basePrice: number, days = 30) {
  const data = []
  let price = basePrice
  for (let i = days; i >= 0; i--) {
    const variance = (Math.random() - 0.48) * 0.12
    price = Math.max(100, price * (1 + variance))
    const date = new Date()
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(price),
      minPrice: Math.round(price * 0.85),
      quantity: Math.floor(Math.random() * 500) + 50,
    })
  }
  return data
}

/** Mock market opportunities (Midnight-relevant) */
export function generateMockOpportunities() {
  return [
    { itemId: 224249, itemName: 'Sinbloom (Flask crafting)', itemQuality: 'common' as const, type: 'flip' as const, buyPrice: 1200, sellPrice: 2100, profit: 900, roi: 75, riskLevel: 'low' as const, volume: 8000, description: 'Herb en demande pour Alchimie Midnight' },
    { itemId: 224291, itemName: 'Voidcrystal (Cut)', itemQuality: 'rare' as const, type: 'craft' as const, buyPrice: 32000, sellPrice: 58000, profit: 26000, roi: 81, riskLevel: 'low' as const, volume: 180, description: 'Joaillerie — gem rare très demandée en T1' },
    { itemId: 224300, itemName: 'Spark of Radiance', itemQuality: 'epic' as const, type: 'flip' as const, buyPrice: 85000, sellPrice: 140000, profit: 55000, roi: 64, riskLevel: 'medium' as const, volume: 45, description: 'Mat obligatoire pour gear ilvl max' },
    { itemId: 224310, itemName: 'Enchant Helm — Void Clarity', itemQuality: 'uncommon' as const, type: 'craft' as const, buyPrice: 18000, sellPrice: 32000, profit: 14000, roi: 77, riskLevel: 'low' as const, volume: 620, description: 'Nouveau slot casque — forte demande' },
    { itemId: 224280, itemName: 'Duskweave Bolt (x5)', itemQuality: 'common' as const, type: 'craft' as const, buyPrice: 3200, sellPrice: 5800, profit: 2600, roi: 81, riskLevel: 'low' as const, volume: 2200, description: 'Conversion tissu très profitable' },
    { itemId: 224302, itemName: 'Mote of Pure Void', itemQuality: 'rare' as const, type: 'flip' as const, buyPrice: 12000, sellPrice: 19500, profit: 7500, roi: 62, riskLevel: 'medium' as const, volume: 320, description: 'Rare node drop, prix stable' },
  ]
}

/** Popular realms */
export const POPULAR_REALMS = [
  { slug: 'ravencrest-alliance', name: 'Ravencrest',       faction: 'alliance', region: 'eu' },
  { slug: 'kazzak-horde',        name: 'Kazzak',           faction: 'horde',    region: 'eu' },
  { slug: 'stormscale-horde',    name: 'Stormscale',       faction: 'horde',    region: 'eu' },
  { slug: 'twisting-nether-horde', name: 'Twisting Nether', faction: 'horde',  region: 'eu' },
  { slug: 'silvermoon-alliance', name: 'Silvermoon',       faction: 'alliance', region: 'eu' },
  { slug: 'illidan-horde',       name: 'Illidan',          faction: 'horde',    region: 'us' },
  { slug: 'area-52-horde',       name: 'Area 52',          faction: 'horde',    region: 'us' },
  { slug: 'stormrage-alliance',  name: 'Stormrage',        faction: 'alliance', region: 'us' },
  { slug: 'malganis-horde',      name: "Mal'Ganis",        faction: 'horde',    region: 'us' },
  { slug: 'bleeding-hollow-horde', name: 'Bleeding Hollow', faction: 'horde',  region: 'us' },
]
