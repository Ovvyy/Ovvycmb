import type { WowItem } from '@/types'

/**
 * WoW Midnight v12.0.1 — Items confirmés depuis la sheet officielle
 *
 * IMPORTANT: Les itemId marqués 0 sont des placeholders.
 * Pour obtenir les vrais IDs, connectez l'API Blizzard dans Paramètres.
 * Zones Midnight: Eversong, Harandar, Silvermoon, Voidstorm, Zul'Aman
 *
 * Sources: Sheet communautaire WoW Midnight + Blizzard Battle.net AH API
 */

// ── Helper pour marquer les IDs à vérifier ───────────────────────────────────
// Les IDs > 0 sont des IDs Blizzard réels (vérifiés).
// Les IDs = 0 sont des placeholders en attente de l'API Blizzard.

export const TRACKED_ITEMS: WowItem[] = [
  // ── Minerais Midnight (source: données de prospection) ───────────────────
  { id: 0, name: 'Umbral Tin Ore',       quality: 'common',   category: 'material',   expansion: 'Midnight' },
  { id: 0, name: 'Brilliant Silver Ore', quality: 'uncommon', category: 'material',   expansion: 'Midnight' },

  // ── Gems Midnight — Depuis Umbral Tin (prospection confirmée) ────────────
  { id: 0, name: 'Harandar Peridot',     quality: 'uncommon', category: 'gem',        expansion: 'Midnight' },
  { id: 0, name: 'Flawless Peridot',     quality: 'rare',     category: 'gem',        expansion: 'Midnight' },
  { id: 0, name: 'Tenebrous Amethyst',   quality: 'uncommon', category: 'gem',        expansion: 'Midnight' },
  { id: 0, name: 'Flawless Amethyst',    quality: 'rare',     category: 'gem',        expansion: 'Midnight' },

  // ── Gems Midnight — Depuis Brilliant Silver (prospection confirmée) ───────
  { id: 0, name: 'Sanguine Garnet',      quality: 'uncommon', category: 'gem',        expansion: 'Midnight' },
  { id: 0, name: 'Flawless Garnet',      quality: 'rare',     category: 'gem',        expansion: 'Midnight' },
  { id: 0, name: 'Amani Lapis',          quality: 'uncommon', category: 'gem',        expansion: 'Midnight' },
  { id: 0, name: 'Flawless Lapis',       quality: 'rare',     category: 'gem',        expansion: 'Midnight' },

  // ── Gems Midnight — Rares (toutes mines) ─────────────────────────────────
  { id: 0, name: 'Eversong Diamond',     quality: 'epic',     category: 'gem',        expansion: 'Midnight' },
  { id: 0, name: 'Crystalline Glass',    quality: 'uncommon', category: 'gem',        expansion: 'Midnight' },
  { id: 0, name: 'Duskshrouded Stone',   quality: 'common',   category: 'material',   expansion: 'Midnight' },

  // ── Enchantement Midnight (source: données shuffle disenchant) ────────────
  { id: 0, name: 'Radiant Shard',        quality: 'uncommon', category: 'enchanting', expansion: 'Midnight' },
  { id: 0, name: 'Evercore',             quality: 'common',   category: 'material',   expansion: 'Midnight' },

  // ── Outils de Profession BiS (craftables et vendables sur AH) ────────────
  // Enchantement (crafté par Enchantement — vendeur Lyrendal 150 Artisan Moxie)
  { id: 0, name: 'Runed Dazzling Thorium Rod',            quality: 'rare', category: 'other', expansion: 'Midnight' },
  // Couture (crafté Couture — Lyrendal 150 Artisan Moxie)
  { id: 0, name: "Self-Sharpening Sin'dorei Snippers",    quality: 'rare', category: 'other', expansion: 'Midnight' },
  // Alchimie (crafté — Lyrendal 150 Artisan Moxie)
  { id: 0, name: "Super Sin'dorei Alchemist's Mixing Rod",quality: 'rare', category: 'other', expansion: 'Midnight' },
  // Calligraphie (crafté — Lyrendal 150 Artisan Moxie)
  { id: 0, name: "Super Sin'dorei Quill",                 quality: 'rare', category: 'other', expansion: 'Midnight' },
  // Joaillerie (crafté — Giga-Gem Grippers)
  { id: 0, name: 'Giga-Gem Grippers',                    quality: 'rare', category: 'other', expansion: 'Midnight' },
  // Forge (crafté Forge — Sunforged)
  { id: 0, name: "Sunforged Blacksmith's Hammer",         quality: 'rare', category: 'other', expansion: 'Midnight' },
  // Travail du cuir (crafté LW)
  { id: 0, name: "Sunforged Leatherworker's Knife",       quality: 'rare', category: 'other', expansion: 'Midnight' },
  // Ingénierie (crafté)
  { id: 0, name: "Turbo-Junker's Multitool v9",           quality: 'rare', category: 'other', expansion: 'Midnight' },
  // Minage
  { id: 0, name: 'Sunforged Pickaxe',                     quality: 'rare', category: 'other', expansion: 'Midnight' },
  // Dépeçage
  { id: 0, name: 'Sunforged Skinning Knife',              quality: 'rare', category: 'other', expansion: 'Midnight' },
  // Herborisme
  { id: 0, name: 'Sunforged Sickle',                      quality: 'rare', category: 'other', expansion: 'Midnight' },
]

/** Item IDs for quick lookup */
export const ITEM_ID_MAP = new Map(TRACKED_ITEMS.map((i) => [i.id, i]))

/** Wowhead item URL (midnight items — ID=0 signifie placeholder) */
export function wowheadUrl(itemId: number): string {
  if (itemId === 0) return 'https://www.wowhead.com/midnight/items'
  return `https://www.wowhead.com/midnight/item=${itemId}`
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

/** Mock market opportunities (Midnight, items confirmés seulement) */
export function generateMockOpportunities() {
  return [
    { itemId: 0, itemName: 'Prospection Umbral Tin → Flawless Amethyst', itemQuality: 'rare' as const, type: 'flip' as const, buyPrice: 2750000, sellPrice: 25980000, profit: 23230000, roi: 845, riskLevel: 'medium' as const, volume: 200, description: 'Prospection Umbral Tin Ore → Flawless Amethyst (taux: 2.34%)' },
    { itemId: 0, itemName: 'Eversong Diamond (prospection)', itemQuality: 'epic' as const, type: 'flip' as const, buyPrice: 2580000, sellPrice: 17490000, profit: 14910000, roi: 578, riskLevel: 'low' as const, volume: 50, description: 'Rare drop de prospection Brilliant Silver Ore (taux: 1.12%)' },
    { itemId: 0, itemName: 'Shuffle Enchantement (Evercore → Radiant Shard)', itemQuality: 'uncommon' as const, type: 'craft' as const, buyPrice: 58900, sellPrice: 136264, profit: 77364, roi: 131, riskLevel: 'low' as const, volume: 5000, description: 'Shuffle: craft Evercore (58900c) → DE → Radiant Shard (82600c avg)' },
    { itemId: 0, itemName: 'Flawless Garnet (coup)', itemQuality: 'rare' as const, type: 'flip' as const, buyPrice: 2580000, sellPrice: 18500000, profit: 15920000, roi: 617, riskLevel: 'medium' as const, volume: 100, description: 'Prospection Brilliant Silver Ore → Flawless Garnet (taux: 2.47%)' },
    { itemId: 0, itemName: "Sunforged Blacksmith's Hammer (BiS outil)", itemQuality: 'rare' as const, type: 'craft' as const, buyPrice: 5000000, sellPrice: 15000000, profit: 10000000, roi: 200, riskLevel: 'low' as const, volume: 80, description: 'Outil BiS Forge Midnight — forte demande des joueurs qui montent leur métier' },
    { itemId: 0, itemName: 'Runed Dazzling Thorium Rod (outil enchanteur)', itemQuality: 'rare' as const, type: 'craft' as const, buyPrice: 3000000, sellPrice: 12000000, profit: 9000000, roi: 300, riskLevel: 'low' as const, volume: 60, description: 'Outil BiS Enchantement — 150 Artisan Moxie vendor' },
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
