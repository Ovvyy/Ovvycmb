import { motion } from 'framer-motion'
import { Monitor, Sword, ArrowUpRight } from 'lucide-react'
import type { Account } from '@/types'
import { cn, getGameTypeLabel, getStatusColor, getStatusLabel, hpPercent } from '@/lib/utils'
import { api } from '@/api/apiClient'

interface Props {
  account: Account
}

export function AccountCard({ account }: Props) {
  const hp = hpPercent(account.hp, account.maxHp)
  const isOnline = account.status !== 'Offline'
  const isInCombat = account.status === 'InCombat'

  const handleFocus = async () => {
    try {
      await api.accounts.focus(account.id)
    } catch (err) {
      console.error('Focus failed:', err)
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={cn(
        'glass rounded-xl p-4 cursor-pointer group relative overflow-hidden',
        isInCombat && 'border-accent-danger/30',
        !isOnline && 'opacity-60'
      )}
      style={{ borderLeft: `3px solid ${account.colorTag}` }}
    >
      {/* Glow effect for active */}
      {isOnline && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at top left, ${account.colorTag}15, transparent 60%)` }}
        />
      )}

      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-sm">{account.characterName || account.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs text-white/40">{getGameTypeLabel(account.gameType)}</span>
            {account.level > 0 && (
              <>
                <span className="text-white/20">·</span>
                <span className="text-xs text-white/40">Lv.{account.level}</span>
              </>
            )}
            {account.server && (
              <>
                <span className="text-white/20">·</span>
                <span className="text-xs text-white/40">{account.server}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn('status-dot', account.status.toLowerCase())} />
          <button
            onClick={handleFocus}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 transition-all"
            title="Focus window"
          >
            <ArrowUpRight size={12} className="text-white/60" />
          </button>
        </div>
      </div>

      {/* HP Bar */}
      {account.maxHp > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-white/40 mb-1">
            <span>HP</span>
            <span>{account.hp}/{account.maxHp}</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${hp}%`,
                background: hp > 50 ? '#22C55E' : hp > 25 ? '#F59E0B' : '#EF4444',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${hp}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-white/40">
          {account.initiative > 0 && (
            <div className="flex items-center gap-1">
              <Sword size={10} />
              <span>{account.initiative}</span>
            </div>
          )}
          {account.processId && (
            <div className="flex items-center gap-1">
              <Monitor size={10} />
              <span>PID {account.processId}</span>
            </div>
          )}
        </div>
        <div
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{
            color: getStatusColor(account.status),
            background: `${getStatusColor(account.status)}20`,
          }}
        >
          {getStatusLabel(account.status)}
        </div>
      </div>
    </motion.div>
  )
}
