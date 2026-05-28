import { create } from 'zustand'
import type { Account, AgentReport, DomainEvent, LayoutProfile, PluginManifest } from '@/types'

type View = 'dashboard' | 'layout' | 'agents' | 'plugins' | 'settings'

interface AppState {
  // Navigation
  activeView: View
  setActiveView: (view: View) => void

  // Accounts
  accounts: Account[]
  setAccounts: (accounts: Account[]) => void
  updateAccount: (id: string, data: Partial<Account>) => void
  focusedAccountId: string | null
  setFocusedAccount: (id: string | null) => void

  // Layouts
  layouts: LayoutProfile[]
  setLayouts: (layouts: LayoutProfile[]) => void

  // Events
  events: DomainEvent[]
  addEvent: (event: DomainEvent) => void
  clearEvents: () => void

  // Agents
  agentReports: AgentReport[]
  setAgentReports: (reports: AgentReport[]) => void
  runningAgents: Set<string>
  setAgentRunning: (agentType: string, running: boolean) => void

  // Plugins
  plugins: PluginManifest[]
  setPlugins: (plugins: PluginManifest[]) => void

  // Connection
  isConnected: boolean
  setConnected: (connected: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  activeView: 'dashboard',
  setActiveView: (view) => set({ activeView: view }),

  accounts: [],
  setAccounts: (accounts) => set({ accounts }),
  updateAccount: (id, data) =>
    set((state) => ({
      accounts: state.accounts.map((a) => (a.id === id ? { ...a, ...data } : a)),
    })),
  focusedAccountId: null,
  setFocusedAccount: (id) => set({ focusedAccountId: id }),

  layouts: [],
  setLayouts: (layouts) => set({ layouts }),

  events: [],
  addEvent: (event) =>
    set((state) => ({ events: [event, ...state.events].slice(0, 200) })),
  clearEvents: () => set({ events: [] }),

  agentReports: [],
  setAgentReports: (reports) => set({ agentReports: reports }),
  runningAgents: new Set(),
  setAgentRunning: (agentType, running) =>
    set((state) => {
      const next = new Set(state.runningAgents)
      if (running) next.add(agentType) else next.delete(agentType)
      return { runningAgents: next }
    }),

  plugins: [],
  setPlugins: (plugins) => set({ plugins }),

  isConnected: false,
  setConnected: (isConnected) => set({ isConnected }),
}))
