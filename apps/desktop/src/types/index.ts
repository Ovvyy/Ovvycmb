export type GameType = 'DofusUnity' | 'DofusRetro' | 'Wakfu'
export type AccountStatus = 'Offline' | 'Connected' | 'InCombat' | 'Trading' | 'Idle' | 'Error'
export type ReportSeverity = 'Info' | 'Low' | 'Medium' | 'High' | 'Critical'
export type AgentType = 'Architect' | 'Security' | 'Performance' | 'QA' | 'CodeReviewer' | 'Refactor' | 'OcrVision'
export type PluginStatus = 'Installed' | 'Enabled' | 'Disabled' | 'Error'

export interface Account {
  id: string
  name: string
  characterName: string
  gameType: GameType
  status: AccountStatus
  processId: number | null
  hp: number
  maxHp: number
  initiative: number
  level: number
  class: string
  server: string
  colorTag: string
  groupId: string | null
  sortOrder: number
  isActive: boolean
  isFocused: boolean
  createdAt: string
  updatedAt: string
}

export interface LayoutProfile {
  id: string
  name: string
  description: string | null
  hotkey: string | null
  monitorCount: number
  isDefault: boolean
  layouts: WindowLayout[]
  createdAt: string
}

export interface WindowLayout {
  accountId: string
  monitorIndex: number
  x: number
  y: number
  width: number
  height: number
  zOrder: number
}

export interface AgentReport {
  id: string
  agentType: AgentType
  reportType: string
  summary: string
  details: string
  severity: ReportSeverity
  recommendations: string[]
  createdAt: string
}

export interface PluginManifest {
  id: string
  name: string
  displayName: string
  version: string
  author: string
  description: string | null
  supportedGames: GameType[]
  capabilities: string[]
  status: PluginStatus
  isOfficial: boolean
}

export interface DomainEvent {
  id: string
  type: string
  accountId: string | null
  message: string | null
  payload: string | null
  timestamp: string
}

export interface MonitorInfo {
  index: number
  name: string
  bounds: { x: number; y: number; width: number; height: number }
  workArea: { x: number; y: number; width: number; height: number }
  isPrimary: boolean
  scaleFactor: number
}
