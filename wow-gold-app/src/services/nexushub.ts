/**
 * Nexushub API client
 * Docs: https://nexushub.co/
 * Base: https://api.nexushub.co/wow/
 * No authentication required.
 */

import axios from 'axios'
import type { NexushubItem } from '@/types'

const BASE = 'https://api.nexushub.co/wow'

const client = axios.create({ baseURL: BASE, timeout: 10000 })

export interface NexushubServer {
  slug: string
  name: string
  region: string
  faction?: string
  locale?: string
}

/** List all available servers */
export async function fetchServers(): Promise<NexushubServer[]> {
  const { data } = await client.get<NexushubServer[]>('/servers')
  return data
}

/** Get item prices on a specific server+faction combo */
export async function fetchItemPrice(
  server: string,
  faction: 'alliance' | 'horde',
  itemId: number
): Promise<NexushubItem | null> {
  try {
    const slug = `${server}-${faction}`
    const { data } = await client.get<NexushubItem>(`/items/${slug}/${itemId}`)
    return data
  } catch {
    return null
  }
}

/** Search items by name on Nexushub */
export async function searchItems(
  server: string,
  faction: 'alliance' | 'horde',
  query: string
): Promise<NexushubItem[]> {
  try {
    const slug = `${server}-${faction}`
    const { data } = await client.get<NexushubItem[]>(`/items/${slug}`, {
      params: { search: query, limit: 50 },
    })
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

/** Get top items by value for a server */
export async function fetchTopItems(
  server: string,
  faction: 'alliance' | 'horde',
  limit = 20
): Promise<NexushubItem[]> {
  try {
    const slug = `${server}-${faction}`
    const { data } = await client.get<NexushubItem[]>(`/items/${slug}`, {
      params: { orderBy: 'marketValue', limit },
    })
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

/** Get price history for an item */
export async function fetchPriceHistory(
  server: string,
  faction: 'alliance' | 'horde',
  itemId: number
): Promise<{ scannedAt: string; data: { marketValue: number; minBuyout: number; quantity: number }[] }[]> {
  try {
    const slug = `${server}-${faction}`
    const { data } = await client.get(`/items/${slug}/${itemId}/prices`)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}
