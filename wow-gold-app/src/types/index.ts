// ─── Item & Market ───────────────────────────────────────────────────────────

export type ItemQuality = 'poor' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'artifact'
export type ItemCategory = 'consumable' | 'material' | 'weapon' | 'armor' | 'reagent' | 'gem' | 'enchanting' | 'inscription' | 'recipe' | 'other'

export interface WowItem {
  id: number
  name: string
  quality: ItemQuality
  category: ItemCategory
  icon?: string
  vendorPrice?: number
  craftingCost?: number
  wowheadUrl?: string
  ilvl?: number
  expansion?: string
}

export interface ItemPrice {
  itemId: number
  realm: string
  faction: 'alliance' | 'horde' | 'neutral'
  marketValue: number
  minBuyout: number
  historical: number
  quantity: number
  numAuctions: number
  lastUpdated: Date
  priceHistory?: PricePoint[]
}

export interface PricePoint {
  date: Date
  price: number
  minPrice: number
  quantity: number
}

// ─── Professions ─────────────────────────────────────────────────────────────

export type ProfessionName =
  | 'Alchemy' | 'Blacksmithing' | 'Enchanting' | 'Engineering' | 'Herbalism'
  | 'Inscription' | 'Jewelcrafting' | 'Leatherworking' | 'Mining' | 'Skinning'
  | 'Tailoring' | 'Cooking' | 'Fishing' | 'Archaeology'

export interface Profession {
  name: ProfessionName
  icon: string
  type: 'crafting' | 'gathering' | 'secondary'
  description: string
  goldRating: 1 | 2 | 3 | 4 | 5
  strategies: string[]
}

export interface CraftingRecipe {
  id: number
  name: string
  profession: ProfessionName
  skillRequired: number
  reagents: RecipeReagent[]
  produces: number
  outputItemId: number
  outputItemName: string
  outputItemQuality: ItemQuality
  craftingCost?: number
  marketValue?: number
  profit?: number
  profitMargin?: number
  popularityScore?: number
}

export interface RecipeReagent {
  itemId: number
  name: string
  quantity: number
  unitPrice?: number
  totalPrice?: number
}

// ─── Strategies ──────────────────────────────────────────────────────────────

export type StrategyCategory = 'crafting' | 'farming' | 'flipping' | 'gathering' | 'service' | 'passive'
export type StrategyDifficulty = 'beginner' | 'intermediate' | 'advanced'
export type StrategyTimeRequired = 'minutes' | 'hours' | 'daily' | 'weekly'

export interface GoldStrategy {
  id: string
  title: string
  category: StrategyCategory
  difficulty: StrategyDifficulty
  professions?: ProfessionName[]
  estimatedGoldPerHour: number
  timeRequired: StrategyTimeRequired
  description: string
  steps: string[]
  tips: string[]
  requiredItems?: string[]
  expansion: string
  goldRating: 1 | 2 | 3 | 4 | 5
  tags: string[]
  icon: string
}

// ─── Market Analysis ─────────────────────────────────────────────────────────

export interface MarketOpportunity {
  type: 'flip' | 'craft' | 'farm'
  itemId: number
  itemName: string
  itemQuality: ItemQuality
  buyPrice: number
  sellPrice: number
  profit: number
  roi: number
  riskLevel: 'low' | 'medium' | 'high'
  volume: number
  description: string
}

export interface MarketSummary {
  realm: string
  faction: string
  totalOpportunities: number
  avgProfit: number
  topGainers: { name: string; change: number }[]
  topLosers: { name: string; change: number }[]
  lastUpdated: Date
}

// ─── Settings ────────────────────────────────────────────────────────────────

export interface AppSettings {
  realm: string
  faction: 'alliance' | 'horde'
  region: 'us' | 'eu' | 'kr' | 'tw' | 'cn'
  currency: 'gold' | 'usd'
  blizzardClientId: string
  blizzardClientSecret: string
  minProfit: number
  minRoi: number
  showDeprecated: boolean
  theme: 'dark' | 'light'
  expansion: 'midnight' | 'war-within' | 'dragonflight'
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface NexushubItem {
  slug: string
  name: string
  uniqueName: string
  itemId: number
  stats: {
    current: {
      marketValue: number
      minBuyout: number
      historicalValue: number
      numAuctions: number
      quantity: number
    }
    previous?: {
      marketValue: number
      minBuyout: number
    }
  }
}

export interface BlizzardAuctionItem {
  id: number
  buyout: number
  bid: number
  quantity: number
  item: { id: number }
  timeLeft: string
}

export interface TUJItem {
  item: number
  name: string
  quantity: number
  minbuying: number
  marketprice: number
  historical: number
  lastseen: number
}

// ─── Gold Formatting ─────────────────────────────────────────────────────────
export interface GoldAmount {
  gold: number
  silver: number
  copper: number
  raw: number // total copper
}
