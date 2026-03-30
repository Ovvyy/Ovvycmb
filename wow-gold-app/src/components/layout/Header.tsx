import { useSettingsStore } from '@/store/settingsStore'
import { useState } from 'react'
import { cn } from '@/utils/cn'

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
    <div className="flex items-start justify-between mb-6 pb-5 border-b border-wow-border/40">
      {/* Title */}
      <div className="flex items-start gap-3">
        {icon && (
          <div className="w-9 h-9 rounded-xl bg-wow-gold/8 border border-wow-gold/15 flex items-center justify-center text-xl flex-shrink-0 mt-0.5">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-xl font-wow font-bold text-slate-100 tracking-wide leading-tight">{title}</h2>
          {subtitle && (
            <p className="text-xs text-slate-600 mt-0.5 tracking-wide">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {actions}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-wow-surface border border-wow-border/60 text-[10px] text-slate-600">
          <span className={cn(
            'w-1.5 h-1.5 rounded-full',
            settings.faction === 'alliance' ? 'bg-wow-blue' : 'bg-wow-red'
          )} />
          <span className="text-slate-500 hidden sm:inline">{settings.realm}</span>
          <span className="text-wow-border">·</span>
          <span className="text-slate-600 font-mono">
            {lastUpdated.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  )
}

export function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="ml-56 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-6 animate-page-enter">
        {children}
      </div>
    </div>
  )
}
