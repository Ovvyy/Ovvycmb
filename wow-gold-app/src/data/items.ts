import type { WowItem } from '@/types'

/** Popular items tracked by gold farmers - Nexushub item IDs for TWW/Dragonflight */
export const TRACKED_ITEMS: WowItem[] = [
  // Alchemy materials / Herbs
  { id: 191305, name: 'Hochenblume',          quality: 'common', category: 'reagent',    icon: 'https://wow.zamimg.com/images/wow/icons/medium/inv_10_herb_hochenblume_color1.jpg', expansion: 'Dragonflight' },
  { id: 191307, name: 'Bubble Poppy',         quality: 'common', category: 'reagent',    icon: 'https://wow.zamimg.com/images/wow/icons/medium/inv_10_herb_bubblepoppy_color1.jpg', expansion: 'Dragonflight' },
  { id: 191303, name: 'Saxifrage',            quality: 'common', category: 'reagent',    icon: 'https://wow.zamimg.com/images/wow/icons/medium/inv_10_herb_saxifrage_color1.jpg', expansion: 'Dragonflight' },
  { id: 191309, name: 'Writhebark',           quality: 'common', category: 'reagent',    icon: 'https://wow.zamimg.com/images/wow/icons/medium/inv_10_herb_writhebark_color1.jpg', expansion: 'Dragonflight' },
  { id: 210787, name: 'Ironcap Mushroom',     quality: 'common', category: 'reagent',    expansion: 'The War Within' },
  { id: 210786, name: 'Luredrop',             quality: 'common', category: 'reagent',    expansion: 'The War Within' },
  { id: 210785, name: 'Mycobloom',            quality: 'common', category: 'reagent',    expansion: 'The War Within' },
  { id: 210782, name: 'Arathi Cordifolia',    quality: 'common', category: 'reagent',    expansion: 'The War Within' },
  // Mining
  { id: 194755, name: 'Serevite Ore',         quality: 'common', category: 'material',   expansion: 'Dragonflight' },
  { id: 194756, name: 'Draconium Ore',        quality: 'common', category: 'material',   expansion: 'Dragonflight' },
  { id: 210777, name: 'Bismuth',              quality: 'common', category: 'material',   expansion: 'The War Within' },
  { id: 210778, name: 'Aqirite',             quality: 'common', category: 'material',   expansion: 'The War Within' },
  // Gems
  { id: 192848, name: 'Sendinite',            quality: 'uncommon', category: 'gem',      expansion: 'Dragonflight' },
  { id: 192850, name: 'Malygite',             quality: 'rare',     category: 'gem',      expansion: 'Dragonflight' },
  { id: 192852, name: 'Alexstraszite',        quality: 'rare',     category: 'gem',      expansion: 'Dragonflight' },
  { id: 192854, name: 'Neltharite',           quality: 'rare',     category: 'gem',      expansion: 'Dragonflight' },
  // Enchanting
  { id: 194127, name: 'Vibrant Shard',        quality: 'uncommon', category: 'enchanting', expansion: 'Dragonflight' },
  { id: 194128, name: 'Resonant Crystal',     quality: 'rare',     category: 'enchanting', expansion: 'Dragonflight' },
  { id: 194129, name: 'Chromatic Dust',       quality: 'common',   category: 'enchanting', expansion: 'Dragonflight' },
  // Consumables
  { id: 191329, name: 'Phial of Tepid Versatility', quality: 'rare', category: 'consumable', expansion: 'Dragonflight' },
  { id: 191333, name: 'Flask of Supreme Power',      quality: 'rare', category: 'consumable', expansion: 'Dragonflight' },
  // Cloth
  { id: 193057, name: 'Windswept Thatch',     quality: 'common', category: 'material',   expansion: 'Dragonflight' },
  { id: 193059, name: 'Vibrant Wildercloth',  quality: 'common', category: 'material',   expansion: 'Dragonflight' },
  // Leather
  { id: 193053, name: 'Resilient Leather',    quality: 'common', category: 'material',   expansion: 'Dragonflight' },
  { id: 193055, name: 'Adamant Scales',       quality: 'common', category: 'material',   expansion: 'Dragonflight' },
]

/** Item IDs for quick lookup */
export const ITEM_ID_MAP = new Map(TRACKED_ITEMS.map((i) => [i.id, i]))

/** Wowhead item URL generator */
export function wowheadUrl(itemId: number): string {
  return `https://www.wowhead.com/item=${itemId}`
}

/** Wowhead icon URL helper */
export function wowheadIconUrl(iconName: string, size: 'small' | 'medium' | 'large' = 'medium'): string {
  return `https://wow.zamimg.com/images/wow/icons/${size}/${iconName}.jpg`
}

/** Quality badge class helper */
export function qualityClass(quality: string): string {
  const map: Record<string, string> = {
    poor:      'quality-poor',
    common:    'quality-common',
    uncommon:  'quality-uncommon',
    rare:      'quality-rare',
    epic:      'quality-epic',
    legendary: 'quality-legendary',
    artifact:  'quality-artifact',
  }
  return map[quality] ?? 'quality-common'
}

/** Quality label */
export function qualityLabel(quality: string): string {
  const labels: Record<string, string> = {
    poor: 'Médiocre', common: 'Commun', uncommon: 'Peu commun',
    rare: 'Rare', epic: 'Épique', legendary: 'Légendaire', artifact: 'Artefact',
  }
  return labels[quality] ?? quality
}

/** Mock price data generator for demo purposes */
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

/** Mock market opportunities */
export function generateMockOpportunities() {
  return [
    { itemId: 191329, itemName: 'Phial of Tepid Versatility', itemQuality: 'rare' as const, type: 'craft' as const, buyPrice: 45000, sellPrice: 72000, profit: 27000, roi: 60, riskLevel: 'low' as const, volume: 340, description: 'Craft below market — herb prices are low' },
    { itemId: 192852, itemName: 'Alexstraszite: Haste',        itemQuality: 'rare' as const, type: 'craft' as const, buyPrice: 28000, sellPrice: 52000, profit: 24000, roi: 85, riskLevel: 'low' as const, volume: 120, description: 'Gem cutting profit strong this week' },
    { itemId: 194127, itemName: 'Vibrant Shard',               itemQuality: 'uncommon' as const, type: 'flip' as const, buyPrice: 8000,  sellPrice: 13000, profit: 5000,  roi: 62, riskLevel: 'medium' as const, volume: 620, description: 'Market dip — stock up now' },
    { itemId: 193059, itemName: 'Vibrant Wildercloth Bolt',    itemQuality: 'common' as const, type: 'craft' as const, buyPrice: 6500,  sellPrice: 9800,  profit: 3300,  roi: 50, riskLevel: 'low' as const, volume: 800, description: 'Bolt conversion profitable today' },
    { itemId: 191305, itemName: 'Hochenblume',                 itemQuality: 'common' as const, type: 'flip' as const, buyPrice: 450,   sellPrice: 780,   profit: 330,   roi: 73, riskLevel: 'medium' as const, volume: 5000, description: 'Herb prices below 7d average' },
    { itemId: 194128, itemName: 'Resonant Crystal',            itemQuality: 'rare' as const, type: 'craft' as const, buyPrice: 35000, sellPrice: 48000, profit: 13000, roi: 37, riskLevel: 'low' as const, volume: 200, description: 'Enchant demand stable before raid week' },
  ]
}

/** Realms for selector */
export const POPULAR_REALMS = [
  { slug: 'ravencrest-alliance', name: 'Ravencrest', faction: 'alliance', region: 'eu' },
  { slug: 'kazzak-horde',        name: 'Kazzak',      faction: 'horde',    region: 'eu' },
  { slug: 'stormscale-horde',    name: 'Stormscale',  faction: 'horde',    region: 'eu' },
  { slug: 'twisting-nether-horde', name: 'Twisting Nether', faction: 'horde', region: 'eu' },
  { slug: 'silvermoon-alliance', name: 'Silvermoon',  faction: 'alliance', region: 'eu' },
  { slug: 'illidan-horde',       name: 'Illidan',     faction: 'horde',    region: 'us' },
  { slug: 'area-52-horde',       name: 'Area 52',     faction: 'horde',    region: 'us' },
  { slug: 'stormrage-alliance',  name: 'Stormrage',   faction: 'alliance', region: 'us' },
  { slug: 'mal\'ganis-horde',    name: "Mal'Ganis",   faction: 'horde',    region: 'us' },
  { slug: 'bleeding-hollow-horde', name: 'Bleeding Hollow', faction: 'horde', region: 'us' },
]
