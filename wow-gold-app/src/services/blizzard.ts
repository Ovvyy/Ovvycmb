/**
 * Blizzard Battle.net API client
 * Docs: https://develop.battle.net/documentation/world-of-warcraft
 * Requires OAuth2 Client Credentials flow.
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
  scope: string
}

let _token: string | null = null
let _tokenExpiry: number = 0

/** Get OAuth2 access token */
async function getAccessToken(cfg: BlizzardConfig): Promise<string> {
  if (_token && Date.now() < _tokenExpiry) return _token

  const tokenUrl = `https://${cfg.region}.battle.net/oauth/token`
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
  _tokenExpiry = Date.now() + (data.expires_in - 60) * 1000
  return _token
}

export interface BlizzardItem {
  id: number
  name: { en_US: string; fr_FR?: string }
  quality: { type: string; name: { en_US: string } }
  item_class: { id: number; name: { en_US: string } }
  item_subclass: { id: number; name: { en_US: string } }
  media: { key: { href: string }; id: number }
  purchase_price?: number
  sell_price?: number
  level?: number
}

export interface BlizzardAuction {
  id: number
  item: { id: number; context?: number; bonus_lists?: number[]; modifiers?: { type: number; value: number }[] }
  buyout?: number
  bid?: number
  quantity: number
  time_left: 'SHORT' | 'MEDIUM' | 'LONG' | 'VERY_LONG'
}

/** Fetch item details from Blizzard API */
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

/** Fetch auction house data for a realm */
export async function fetchAuctions(
  cfg: BlizzardConfig,
  realmId: number
): Promise<BlizzardAuction[]> {
  try {
    const token = await getAccessToken(cfg)
    const { data } = await axios.get<{ auctions: BlizzardAuction[] }>(
      `https://${cfg.region}.api.blizzard.com/data/wow/connected-realm/${realmId}/auctions`,
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
          name: name,
          'orderby': 'id',
          '_page': 1,
          access_token: token,
        },
      }
    )
    return data.results?.map((r) => r.data) || []
  } catch {
    return []
  }
}

/** Get item media (icon URL) */
export async function fetchItemMedia(
  cfg: BlizzardConfig,
  itemId: number
): Promise<string | null> {
  try {
    const token = await getAccessToken(cfg)
    const { data } = await axios.get<{ assets: { key: string; value: string }[] }>(
      `https://${cfg.region}.api.blizzard.com/data/wow/media/item/${itemId}`,
      {
        params: {
          namespace: `static-${cfg.region}`,
          access_token: token,
        },
      }
    )
    const icon = data.assets?.find((a) => a.key === 'icon')
    return icon?.value || null
  } catch {
    return null
  }
}
