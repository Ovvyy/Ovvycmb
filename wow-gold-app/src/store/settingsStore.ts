import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppSettings } from '@/types'

interface SettingsStore {
  settings: AppSettings
  updateSettings: (partial: Partial<AppSettings>) => void
  resetSettings: () => void
}

const defaultSettings: AppSettings = {
  realm: 'Ravencrest',
  faction: 'alliance',
  region: 'eu',
  currency: 'gold',
  blizzardClientId: '',
  blizzardClientSecret: '',
  minProfit: 100,    // 1g in silver
  minRoi: 10,
  showDeprecated: false,
  theme: 'dark',
  expansion: 'war-within',
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: (partial) =>
        set((state) => ({ settings: { ...state.settings, ...partial } })),
      resetSettings: () => set({ settings: defaultSettings }),
    }),
    { name: 'wow-gold-settings' }
  )
)
