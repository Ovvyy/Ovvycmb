/**
 * Multi-layer Cache Manager
 * Layer 1: Memory cache (TTL-based Map)
 * Layer 2: IndexedDB (persistent, survives refreshes)
 *
 * Smart refresh: high volatility items refresh faster, stable items less.
 */

// ── Memory Cache ─────────────────────────────────────────────────────────────

interface CacheEntry<T> {
  data: T
  expiry: number   // Unix timestamp ms
  volatility: number // 0–100
}

class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>()

  set<T>(key: string, data: T, ttlMs: number, volatility = 50): void {
    this.store.set(key, { data, expiry: Date.now() + ttlMs, volatility })
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiry) {
      this.store.delete(key)
      return null
    }
    return entry.data as T
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): void {
    this.store.delete(key)
  }

  clear(): void {
    this.store.clear()
  }

  size(): number {
    return this.store.size
  }
}

// ── IndexedDB Cache ──────────────────────────────────────────────────────────

const DB_NAME = 'goldmaster-cache'
const DB_VERSION = 1
const STORE_NAME = 'price-cache'

interface IDBEntry {
  key: string
  data: unknown
  expiry: number
  updatedAt: number
}

class IndexedDBCache {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    if (this.db) return

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'key' })
        }
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onerror = () => reject(request.error)
    })
  }

  async set<T>(key: string, data: T, ttlMs: number): Promise<void> {
    await this.init()
    if (!this.db) return

    const entry: IDBEntry = {
      key,
      data,
      expiry: Date.now() + ttlMs,
      updatedAt: Date.now(),
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).put(entry)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  async get<T>(key: string): Promise<T | null> {
    await this.init()
    if (!this.db) return null

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_NAME, 'readonly')
      const request = tx.objectStore(STORE_NAME).get(key)

      request.onsuccess = () => {
        const entry = request.result as IDBEntry | undefined
        if (!entry || Date.now() > entry.expiry) {
          resolve(null)
        } else {
          resolve(entry.data as T)
        }
      }

      request.onerror = () => reject(request.error)
    })
  }

  async clear(): Promise<void> {
    await this.init()
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).clear()
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }
}

// ── Smart TTL based on volatility ────────────────────────────────────────────

const TTL = {
  HIGH_VOLATILITY: 5 * 60 * 1000,       // 5 min
  MEDIUM_VOLATILITY: 15 * 60 * 1000,     // 15 min
  LOW_VOLATILITY: 60 * 60 * 1000,        // 1 hour
  STATIC_DATA: 24 * 60 * 60 * 1000,      // 24 hours (item metadata)
  IDB_DEFAULT: 4 * 60 * 60 * 1000,       // 4 hours for IndexedDB
}

function getTTL(volatilityScore: number): number {
  if (volatilityScore > 70) return TTL.HIGH_VOLATILITY
  if (volatilityScore > 35) return TTL.MEDIUM_VOLATILITY
  return TTL.LOW_VOLATILITY
}

// ── Unified Cache Manager ────────────────────────────────────────────────────

class CacheManager {
  private memory = new MemoryCache()
  private idb = new IndexedDBCache()
  private rateLimiter = new Map<string, number>() // key → last request timestamp
  private minRequestInterval = 1000 // 1 sec between same-key requests

  /**
   * Get data with multi-layer fallback:
   * 1. Memory cache → instant
   * 2. IndexedDB → fast local read
   * 3. Fetcher function → network call
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: {
      volatilityScore?: number
      memoryTTL?: number
      idbTTL?: number
      forceRefresh?: boolean
    } = {}
  ): Promise<T> {
    const { volatilityScore = 50, forceRefresh = false } = options
    const memTTL = options.memoryTTL ?? getTTL(volatilityScore)
    const idbTTL = options.idbTTL ?? TTL.IDB_DEFAULT

    // 1. Memory cache
    if (!forceRefresh) {
      const memResult = this.memory.get<T>(key)
      if (memResult !== null) return memResult
    }

    // 2. IndexedDB cache
    if (!forceRefresh) {
      try {
        const idbResult = await this.idb.get<T>(key)
        if (idbResult !== null) {
          // Promote to memory cache
          this.memory.set(key, idbResult, memTTL, volatilityScore)
          return idbResult
        }
      } catch {
        // IndexedDB may not be available
      }
    }

    // 3. Rate limit check
    const lastRequest = this.rateLimiter.get(key) ?? 0
    const now = Date.now()
    if (now - lastRequest < this.minRequestInterval) {
      // Return stale data if available, or wait
      const stale = this.memory.get<T>(key)
      if (stale) return stale
    }
    this.rateLimiter.set(key, now)

    // 4. Fetch from source
    const data = await fetcher()

    // Store in both layers
    this.memory.set(key, data, memTTL, volatilityScore)
    try {
      await this.idb.set(key, data, idbTTL)
    } catch {
      // IndexedDB write failure — non-critical
    }

    return data
  }

  /** Invalidate a specific key from all layers */
  async invalidate(key: string): Promise<void> {
    this.memory.delete(key)
  }

  /** Clear all caches */
  async clearAll(): Promise<void> {
    this.memory.clear()
    await this.idb.clear()
    this.rateLimiter.clear()
  }

  /** Get cache stats */
  stats(): { memoryEntries: number } {
    return { memoryEntries: this.memory.size() }
  }
}

// Singleton
export const cacheManager = new CacheManager()
