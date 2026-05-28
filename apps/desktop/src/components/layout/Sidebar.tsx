import { motion } from 'framer-motion'
import { LayoutGrid, Layers, Bot, Puzzle, Settings } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { id: 'dashboard', icon: LayoutGrid, label: 'Dashboard' },
  { id: 'layout', icon: Layers, label: 'Layouts' },
  { id: 'agents', icon: Bot, label: 'AI Agents' },
  { id: 'plugins', icon: Puzzle, label: 'Plugins' },
  { id: 'settings', icon: Settings, label: 'Settings' },
] as const

export function Sidebar() {
  const { activeView, setActiveView, accounts } = useAppStore()
  const onlineCount = accounts.filter(a => a.status !== 'Offline').length
  const combatCount = accounts.filter(a => a.status === 'InCombat').length

  return (
    <nav className="w-14 flex flex-col items-center py-3 gap-1 bg-surface-950 border-r border-white/5">
      {NAV_ITEMS.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => setActiveView(id as any)}
          title={label}
          className={cn(
            'relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 group',
            activeView === id
              ? 'bg-brand-500/20 text-brand-400'
              : 'text-white/30 hover:text-white/70 hover:bg-white/5'
          )}
        >
          <Icon size={18} />
          {activeView === id && (
            <motion.div
              layoutId="sidebar-indicator"
              className="absolute left-0 w-0.5 h-5 bg-brand-500 rounded-r-full"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
        </button>
      ))}

      <div className="flex-1" />

      <div className="flex flex-col items-center gap-1 text-xs">
        <div className="w-8 h-8 rounded-lg bg-surface-800 flex flex-col items-center justify-center gap-0.5">
          <span className="text-accent-success font-bold leading-none">{onlineCount}</span>
          <span className="text-white/20 leading-none" style={{ fontSize: 8 }}>online</span>
        </div>
        {combatCount > 0 && (
          <div className="w-8 h-8 rounded-lg bg-accent-danger/20 flex flex-col items-center justify-center gap-0.5 animate-pulse">
            <span className="text-accent-danger font-bold leading-none">{combatCount}</span>
            <span className="text-accent-danger/70 leading-none" style={{ fontSize: 8 }}>combat</span>
          </div>
        )}
      </div>
    </nav>
  )
}
