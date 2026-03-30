/**
 * The Undermine Journal (TUJ) — PERMANENTLY OFFLINE since 2023
 *
 * TUJ operated from 2010 to 2023 and is no longer available.
 * The open-source backend (Newsstand) is available at:
 * https://github.com/erorus/newsstand
 *
 * For retail WoW price data, use the Blizzard Battle.net AH API:
 * - Per-realm items:    GET /data/wow/connected-realm/{id}/auctions?namespace=dynamic-us
 * - Commodities (herbs, ore, cloth): GET /data/wow/auctions/commodities?namespace=dynamic-us
 *
 * This file is kept as a stub for historical reference only.
 * All functions return empty/null results.
 */

export interface TUJPriceData {
  item: number
  name: string
  quantity: number
  minbuying: number
  marketprice: number
  historical: number
  lastseen: number
}

/** @deprecated TUJ is permanently offline. Use Blizzard API instead. */
export async function fetchTUJItemPrice(
  _realm: string,
  _region: string,
  _itemId: number
): Promise<TUJPriceData | null> {
  console.warn('TUJ API is permanently offline. Use Blizzard Battle.net API for retail price data.')
  return null
}

/** @deprecated TUJ is permanently offline. */
export async function searchTUJItems(
  _realm: string,
  _region: string,
  _query: string
): Promise<TUJPriceData[]> {
  console.warn('TUJ API is permanently offline.')
  return []
}
