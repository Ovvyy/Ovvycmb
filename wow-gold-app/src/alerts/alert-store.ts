/**
 * Alert System + Watchlist
 * Zustand store for tracked items, alerts, and Discord webhook notifications
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AlertCondition = 'price_below' | 'price_above' | 'roi_above' | 'signal_buy' | 'signal_sell' | 'volatility_high' | 'pattern_detected'

export interface WatchlistItem {
  itemId: number
  itemName: string
  addedAt: string
  targetBuyPrice?: number
  targetSellPrice?: number
  notes?: string
}

export interface AlertRule {
  id: string
  itemId: number
  itemName: string
  condition: AlertCondition
  threshold: number
  enabled: boolean
  createdAt: string
  lastTriggered?: string
  triggerCount: number
}

export interface AlertNotification {
  id: string
  ruleId: string
  itemId: number
  itemName: string
  message: string
  type: 'opportunity' | 'warning' | 'info'
  priority: 'high' | 'medium' | 'low'
  timestamp: string
  read: boolean
  dismissed: boolean
}

export interface DiscordWebhookConfig {
  url: string
  enabled: boolean
  minPriority: 'high' | 'medium' | 'low'
  mentionRole?: string
}

interface AlertStore {
  // Watchlist
  watchlist: WatchlistItem[]
  addToWatchlist: (item: WatchlistItem) => void
  removeFromWatchlist: (itemId: number) => void
  updateWatchlistItem: (itemId: number, updates: Partial<WatchlistItem>) => void
  isWatched: (itemId: number) => boolean

  // Alert rules
  rules: AlertRule[]
  addRule: (rule: Omit<AlertRule, 'id' | 'createdAt' | 'triggerCount'>) => void
  removeRule: (ruleId: string) => void
  toggleRule: (ruleId: string) => void
  updateRule: (ruleId: string, updates: Partial<AlertRule>) => void

  // Notifications
  notifications: AlertNotification[]
  addNotification: (notif: Omit<AlertNotification, 'id' | 'timestamp' | 'read' | 'dismissed'>) => void
  markRead: (notifId: string) => void
  markAllRead: () => void
  dismissNotification: (notifId: string) => void
  clearNotifications: () => void
  unreadCount: () => number

  // Discord
  discord: DiscordWebhookConfig
  updateDiscord: (config: Partial<DiscordWebhookConfig>) => void
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const useAlertStore = create<AlertStore>()(
  persist(
    (set, get) => ({
      // ── Watchlist ──────────────────────────────────────────────────────
      watchlist: [],

      addToWatchlist: (item) =>
        set((s) => {
          if (s.watchlist.some((w) => w.itemId === item.itemId)) return s
          return { watchlist: [...s.watchlist, { ...item, addedAt: new Date().toISOString() }] }
        }),

      removeFromWatchlist: (itemId) =>
        set((s) => ({ watchlist: s.watchlist.filter((w) => w.itemId !== itemId) })),

      updateWatchlistItem: (itemId, updates) =>
        set((s) => ({
          watchlist: s.watchlist.map((w) =>
            w.itemId === itemId ? { ...w, ...updates } : w
          ),
        })),

      isWatched: (itemId) => get().watchlist.some((w) => w.itemId === itemId),

      // ── Alert Rules ────────────────────────────────────────────────────
      rules: [],

      addRule: (rule) =>
        set((s) => ({
          rules: [...s.rules, {
            ...rule,
            id: generateId(),
            createdAt: new Date().toISOString(),
            triggerCount: 0,
          }],
        })),

      removeRule: (ruleId) =>
        set((s) => ({ rules: s.rules.filter((r) => r.id !== ruleId) })),

      toggleRule: (ruleId) =>
        set((s) => ({
          rules: s.rules.map((r) =>
            r.id === ruleId ? { ...r, enabled: !r.enabled } : r
          ),
        })),

      updateRule: (ruleId, updates) =>
        set((s) => ({
          rules: s.rules.map((r) =>
            r.id === ruleId ? { ...r, ...updates } : r
          ),
        })),

      // ── Notifications ──────────────────────────────────────────────────
      notifications: [],

      addNotification: (notif) =>
        set((s) => ({
          notifications: [
            {
              ...notif,
              id: generateId(),
              timestamp: new Date().toISOString(),
              read: false,
              dismissed: false,
            },
            ...s.notifications,
          ].slice(0, 100), // keep max 100
        })),

      markRead: (notifId) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === notifId ? { ...n, read: true } : n
          ),
        })),

      markAllRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),

      dismissNotification: (notifId) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === notifId ? { ...n, dismissed: true } : n
          ),
        })),

      clearNotifications: () => set({ notifications: [] }),

      unreadCount: () => get().notifications.filter((n) => !n.read && !n.dismissed).length,

      // ── Discord ────────────────────────────────────────────────────────
      discord: {
        url: '',
        enabled: false,
        minPriority: 'high',
      },

      updateDiscord: (config) =>
        set((s) => ({ discord: { ...s.discord, ...config } })),
    }),
    { name: 'goldmaster-alerts' }
  )
)

// ── Discord Webhook Sender ───────────────────────────────────────────────────

export async function sendDiscordAlert(
  config: DiscordWebhookConfig,
  notification: AlertNotification
): Promise<boolean> {
  if (!config.enabled || !config.url) return false

  const priorityOrder = { high: 0, medium: 1, low: 2 }
  if (priorityOrder[notification.priority] > priorityOrder[config.minPriority]) return false

  const colorMap = { opportunity: 0x00e676, warning: 0xff4757, info: 0x00aaff }

  try {
    const response = await fetch(config.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: `🪙 GoldMaster: ${notification.itemName}`,
          description: notification.message,
          color: colorMap[notification.type] ?? 0xf0b429,
          timestamp: notification.timestamp,
          footer: { text: `Priorité: ${notification.priority.toUpperCase()} · GoldMaster` },
          ...(config.mentionRole ? {} : {}),
        }],
        ...(config.mentionRole ? { content: `<@&${config.mentionRole}>` } : {}),
      }),
    })
    return response.ok
  } catch {
    return false
  }
}

// ── Alert Evaluation ─────────────────────────────────────────────────────────

export function conditionLabel(condition: AlertCondition): string {
  const labels: Record<AlertCondition, string> = {
    price_below: 'Prix descend sous',
    price_above: 'Prix monte au-dessus de',
    roi_above: 'ROI dépasse',
    signal_buy: 'Signal d\'achat détecté',
    signal_sell: 'Signal de vente détecté',
    volatility_high: 'Volatilité élevée',
    pattern_detected: 'Pattern détecté',
  }
  return labels[condition]
}
