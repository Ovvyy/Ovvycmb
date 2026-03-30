import { useSettingsStore } from '@/store/settingsStore'
import { useState } from 'react'

interface HeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  icon?: string
}

export function Header({ title, subtitle, actions, icon }: HeaderProps) {
  const { settings } = useSettingsStore()
  const [lastUpdated] = useState(new Date())

  return (
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-center gap-3">
        {icon && <span className="text-3xl">{icon}</span>}
        <div>
          <h2 className="text-2xl font-wow font-bold text-white">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {actions}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-wow-surface border border-wow-border text-xs text-slate-500">
          <span className={settings.faction === 'alliance' ? 'text-blue-400' : 'text-red-400'}>●</span>
          <span>{settings.realm}</span>
          <span>·</span>
          <span className="text-slate-600">
            {lastUpdated.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  )
}

export function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="ml-60 min-h-screen bg-wow-bg">
      <div className="max-w-7xl mx-auto p-6">
        {children}
      </div>
    </div>
  )
}
