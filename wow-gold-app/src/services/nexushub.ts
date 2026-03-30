/**
 * Nexushub API client — WoW CLASSIC only
 * Docs: https://nexushub.co/developers/api
 * Base: https://api.nexushub.co/wow-classic/v1/
 * No authentication required.
 *
 * NOTE: Nexushub covers WoW Classic realms ONLY (not retail/Midnight).
 * For retail price data, use the Blizzard Battle.net AH API directly.
 */

import axios from 'axios'

const BASE = 'https://api.nexushub.co/wow-classic/v1'

const client = axios.create({ baseURL: BASE, timeout: 10000 })

export interface NexushubServer {
  slug: string   // e.g. "firemaw-alliance"
  name: string
  region: 'EU' | 'US'
  faction: 'alliance' | 'horde'
}

export interface NexushubItemData {
  slug: string
  itemId: number
  name: string
  uniqueName: string
  stats?: {
    current?: {
      marketValue: number
      minBuyout: number
      quantity: number
    }
    previous?: {
      marketValue: number
      minBuyout: number
    }
  }
  icon?: string
  tags?: string[]
  requiredLevel?: number
  itemLevel?: number
  sell_price?: number
}

export interface NexushubPricePoint {
  marketValue: number
  minBuyout: number
  quantity: number
  scannedAt: string
}

/** Get list of available Classic servers grouped by region */
export async function fetchClassicServers(): Promise<{ EU: string[]; US: string[] }> {
  try {
    const { data } = await client.get<{ EU: string[]; US: string[] }>('/servers')
    return data
  } catch {
    return { EU: [], US: [] }
  }
}

/** Get current item price on a Classic server (slug: "firemaw-horde") */
export async function fetchClassicItemPrice(
  server: string,
  itemId: number
): Promise<NexushubItemData | null> {
  try {
    const { data } = await client.get<NexushubItemData>(`/items/${server}/${itemId}`)
    return data
  } catch {
    return null
  }
}

/** Get price history for an item on a Classic server */
export async function fetchClassicPriceHistory(
  server: string,
  itemId: number,
  timerange = 30
): Promise<NexushubPricePoint[]> {
  try {
    const { data } = await client.get<{ data: NexushubPricePoint[] }>(
      `/items/${server}/${itemId}/prices`,
      { params: { timerange } }
    )
    return Array.isArray(data?.data) ? data.data : []
  } catch {
    return []
  }
}

/** Search items by name on a Classic server */
export async function searchClassicItems(
  server: string,
  query: string
): Promise<NexushubItemData[]> {
  try {
    const { data } = await client.get<NexushubItemData[]>(
      `/search/${server}`,
      { params: { query } }
    )
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}
