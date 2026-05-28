import { useAppStore } from '@/stores/appStore'
import { Users, Sword, ArrowLeftRight, Activity } from 'lucide-react'

export function StatsBar() {
  const { accounts, isConnected } = useAppStore()

  const stats = {
    total: accounts.length,
    online: accounts.filter(a => a.status !== 'Offline').length,
    combat: accounts.filter(a => a.status === 'InCombat').length,
    trading: accounts.filter(a => a.status === 'Trading').length,
  }

  return (
    <div className="flex items-center gap-3">
      <StatChip icon={<Users size={13} />} label="Total" value={stats.total} />
      <StatChip icon={<Activity size={13} />} label="Online" value={stats.online} color="#22C55E" />
      {stats.combat > 0 && <StatChip icon={<Sword size={13} />} label="Combat" value={stats.combat} color="#EF4444" />}
      {stats.trading > 0 && <StatChip icon={<ArrowLeftRight size={13} />} label="Trading" value={stats.trading} color="#FFD700" />}
      <div className="flex-1" />
      <div className={`flex items-center gap-1.5 text-xs ${isConnected ? 'text-accent-success' : 'text-white/30'}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-accent-success' : 'bg-white/20'}`} />
        {isConnected ? 'Live' : 'Offline'}
      </div>
    </div>
  )
}

function StatChip({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color?: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 glass rounded-lg text-xs">
      <span style={{ color: color ?? 'rgba(255,255,255,0.4)' }}>{icon}</span>
      <span className="text-white/40">{label}</span>
      <span className="font-semibold" style={{ color: color ?? 'white' }}>{value}</span>
    </div>
  )
}
