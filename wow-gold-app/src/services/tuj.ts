/**
 * The Undermine Journal (TUJ) API client
 * Docs: https://theunderminejournal.com/#api
 * Base: https://theunderminejournal.com/api/
 * No authentication required for public data.
 */

import axios from 'axios'
import type { TUJItem } from '@/types'

const BASE = 'https://theunderminejournal.com/api'

const client = axios.create({ baseURL: BASE, timeout: 10000 })

export interface TUJRealm {
  name: string
  slug: string
  locale: string
  timezone: string
}

export interface TUJPriceData {
  item: number
  name: string
  slug: string
  quantity: number
  minbuying: number
  marketprice: number
  historical: number
  globalMedian: number
  globalMean: number
  globalStdDev: number
  lastseen: number
}

export interface TUJCraftingResult {
  item: number
  name: string
  cost: number
  market: number
  profit: number
}

/** Fetch item price from The Undermine Journal */
export async function fetchTUJItemPrice(
  realm: string,
  region: string,
  itemId: number
): Promise<TUJPriceData | null> {
  try {
    const { data } = await client.get<TUJPriceData>(`/item.php`, {
      params: { region, realm, item: itemId },
    })
    return data
  } catch {
    return null
  }
}

/** Search items on TUJ */
export async function searchTUJItems(
  realm: string,
  region: string,
  query: string
): Promise<TUJItem[]> {
  try {
    const { data } = await client.get<TUJItem[]>(`/search.php`, {
      params: { region, realm, q: query },
    })
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

/** Get list of realms */
export async function fetchTUJRealms(region: string): Promise<TUJRealm[]> {
  try {
    const { data } = await client.get<TUJRealm[]>(`/realms.php`, {
      params: { region },
    })
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

/** Get market movers (biggest price changes) */
export async function fetchMarketMovers(
  realm: string,
  region: string
): Promise<TUJPriceData[]> {
  try {
    const { data } = await client.get<TUJPriceData[]>(`/movers.php`, {
      params: { region, realm, limit: 20 },
    })
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}
