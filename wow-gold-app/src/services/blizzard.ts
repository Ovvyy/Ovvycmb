/**
 * Blizzard Battle.net API client
 * Docs: https://develop.battle.net/documentation/world-of-warcraft
 * Requires OAuth2 Client Credentials flow.
 *
 * KEY NOTES (as of WoW Midnight, March 2026):
 * - RETAIL namespace: dynamic-us / dynamic-eu
 * - Commodity items (herbs, ore, cloth) use a SEPARATE region-wide endpoint since 9.2.7
 * - Per-realm items use the connected-realm endpoint
 * - Data refreshes approx. every 60 minutes; poll at most once per hour
 * - Rate limits: 36,000 req/hr, 100 req/sec burst
 * - All monetary values are in COPPER (10,000 copper = 1 gold)
 */

import axios from 'axios'

interface BlizzardConfig {
  clientId: string
  clientSecret: string
  region: 'us' | 'eu' | 'kr' | 'tw'
}

interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

let _token: string | null = null
let _tokenExpiry: number = 0

/** Get OAuth2 access token via Client Credentials flow */
async function getAccessToken(cfg: BlizzardConfig): Promise<string> {
  if (_token && Date.now() < _tokenExpiry) return _token

  const tokenUrl = `https://oauth.battle.net/token`
  const credentials = btoa(`${cfg.clientId}:${cfg.clientSecret}`)

  const { data } = await axios.post<TokenResponse>(
    tokenUrl,
    'grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  )

  _token = data.access_token
  // Subtract 60s buffer from expiry
  _tokenExpiry = Date.now() + (data.expires_in - 60) * 1000
  return _token
}

export interface BlizzardItem {
  id: number
  name: { en_US: string; fr_FR?: string }
  quality: { type: string; name: { en_US: string } }
  item_class: { id: number; name: { en_US: string } }
  item_subclass: { id: number; name: { en_US: string } }
  purchase_price?: number
  sell_price?: number
  level?: number
  required_level?: number
}

/** Standard (non-commodity) auction — per-realm */
export interface BlizzardAuction {
  id: number
  item: {
    id: number
    context?: number
    bonus_lists?: number[]
    modifiers?: { type: number; value: number }[]
  }
  buyout?: number
  bid?: number
  quantity: number
  time_left: 'SHORT' | 'MEDIUM' | 'LONG' | 'VERY_LONG'
}

/** Commodity auction — region-wide (herbs, ore, cloth, etc.) */
export interface BlizzardCommodityAuction {
  id: number
  item: { id: number }
  quantity: number
  unit_price: number
  time_left: 'SHORT' | 'MEDIUM' | 'LONG' | 'VERY_LONG'
}

export interface ConnectedRealm {
  id: number
  name: string
  realms: { id: number; name: { en_US: string }; slug: string }[]
}

/**
 * Fetch per-realm auctions (non-commodity items: BoEs, gear, recipes, etc.)
 * Note: Commodity items (herbs, ore, cloth) are NOT in this endpoint — use fetchCommodityAuctions()
 */
export async function fetchAuctions(
  cfg: BlizzardConfig,
  connectedRealmId: number
): Promise<BlizzardAuction[]> {
  try {
    const token = await getAccessToken(cfg)
    const { data } = await axios.get<{ auctions: BlizzardAuction[] }>(
      `https://${cfg.region}.api.blizzard.com/data/wow/connected-realm/${connectedRealmId}/auctions`,
      {
        params: {
          namespace: `dynamic-${cfg.region}`,
          locale: 'en_US',
          access_token: token,
        },
      }
    )
    return data.auctions || []
  } catch {
    return []
  }
}

/**
 * Fetch region-wide commodity auctions (herbs, ore, cloth, gems, etc.)
 * Since patch 9.2.7, commodities are traded region-wide — one call per region.
 * This is the correct endpoint for herbs like Mycobloom, Luredrop, etc. in Midnight.
 */
export async function fetchCommodityAuctions(
  cfg: BlizzardConfig
): Promise<BlizzardCommodityAuction[]> {
  try {
    const token = await getAccessToken(cfg)
    const { data } = await axios.get<{ auctions: BlizzardCommodityAuction[] }>(
      `https://${cfg.region}.api.blizzard.com/data/wow/auctions/commodities`,
      {
        params: {
          namespace: `dynamic-${cfg.region}`,
          locale: 'en_US',
          access_token: token,
        },
      }
    )
    return data.auctions || []
  } catch {
    return []
  }
}

/** Fetch item details */
export async function fetchBlizzardItem(
  cfg: BlizzardConfig,
  itemId: number
): Promise<BlizzardItem | null> {
  try {
    const token = await getAccessToken(cfg)
    const { data } = await axios.get<BlizzardItem>(
      `https://${cfg.region}.api.blizzard.com/data/wow/item/${itemId}`,
      {
        params: {
          namespace: `static-${cfg.region}`,
          locale: 'en_US',
          access_token: token,
        },
      }
    )
    return data
  } catch {
    return null
  }
}

/** Search items by name */
export async function searchBlizzardItems(
  cfg: BlizzardConfig,
  name: string
): Promise<BlizzardItem[]> {
  try {
    const token = await getAccessToken(cfg)
    const { data } = await axios.get<{ results: { data: BlizzardItem }[] }>(
      `https://${cfg.region}.api.blizzard.com/data/wow/search/item`,
      {
        params: {
          namespace: `static-${cfg.region}`,
          locale: 'en_US',
          'name.en_US': name,
          orderby: 'id',
          _page: 1,
          access_token: token,
        },
      }
    )
    return data.results?.map((r) => r.data) || []
  } catch {
    return []
  }
}

/** Get connected realm list (needed to find connectedRealmId for fetchAuctions) */
export async function fetchConnectedRealms(
  cfg: BlizzardConfig
): Promise<{ href: string }[]> {
  try {
    const token = await getAccessToken(cfg)
    const { data } = await axios.get<{ connected_realms: { href: string }[] }>(
      `https://${cfg.region}.api.blizzard.com/data/wow/connected-realm/index`,
      {
        params: {
          namespace: `dynamic-${cfg.region}`,
          access_token: token,
        },
      }
    )
    return data.connected_realms || []
  } catch {
    return []
  }
}

/**
 * Process commodity auctions to get the market price for a specific item.
 * Returns the minimum buyout and volume for the item.
 */
export function processCommodityItem(
  auctions: BlizzardCommodityAuction[],
  itemId: number
): { minPrice: number; totalQuantity: number; marketValue: number } | null {
  const itemAuctions = auctions.filter((a) => a.item.id === itemId)
  if (itemAuctions.length === 0) return null

  const sorted = itemAuctions.sort((a, b) => a.unit_price - b.unit_price)
  const minPrice = sorted[0].unit_price
  const totalQuantity = itemAuctions.reduce((s, a) => s + a.quantity, 0)

  // Market value = weighted average of bottom 30% of supply
  const thresholdQty = totalQuantity * 0.3
  let filledQty = 0
  let weightedSum = 0
  for (const a of sorted) {
    const take = Math.min(a.quantity, thresholdQty - filledQty)
    if (take <= 0) break
    weightedSum += a.unit_price * take
    filledQty += take
  }
  const marketValue = filledQty > 0 ? Math.round(weightedSum / filledQty) : minPrice

  return { minPrice, totalQuantity, marketValue }
}
