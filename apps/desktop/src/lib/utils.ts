import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { AccountStatus, GameType, ReportSeverity } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStatusColor(status: AccountStatus): string {
  const map: Record<AccountStatus, string> = {
    Connected: '#22C55E',
    InCombat: '#EF4444',
    Trading: '#FFD700',
    Idle: '#94A3B8',
    Offline: '#374151',
    Error: '#F97316',
  }
  return map[status] ?? '#374151'
}

export function getStatusLabel(status: AccountStatus): string {
  const map: Record<AccountStatus, string> = {
    Connected: 'Connected',
    InCombat: 'In Combat',
    Trading: 'Trading',
    Idle: 'Idle',
    Offline: 'Offline',
    Error: 'Error',
  }
  return map[status] ?? status
}

export function getGameTypeColor(type: GameType): string {
  const map: Record<GameType, string> = {
    DofusUnity: '#4F8EF7',
    DofusRetro: '#C4872F',
    Wakfu: '#00C8C8',
  }
  return map[type] ?? '#4F8EF7'
}

export function getGameTypeLabel(type: GameType): string {
  const map: Record<GameType, string> = {
    DofusUnity: 'DOFUS',
    DofusRetro: 'Retro',
    Wakfu: 'WAKFU',
  }
  return map[type] ?? type
}

export function getSeverityColor(severity: ReportSeverity): string {
  const map: Record<ReportSeverity, string> = {
    Info: '#60A5FA',
    Low: '#22C55E',
    Medium: '#F59E0B',
    High: '#F97316',
    Critical: '#EF4444',
  }
  return map[severity] ?? '#60A5FA'
}

export function formatRelativeTime(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return new Date(date).toLocaleDateString()
}

export function hpPercent(hp: number, maxHp: number): number {
  if (maxHp === 0) return 100
  return Math.max(0, Math.min(100, (hp / maxHp) * 100))
}
