import { useAppStore } from '@/stores/appStore'
import { AccountCard } from './AccountCard'
import { StatsBar } from './StatsBar'
import { EventFeed } from './EventFeed'
import { motion } from 'framer-motion'

export function Dashboard() {
  const { accounts } = useAppStore()

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden p-4 gap-4">
        <StatsBar />
        <div className="flex-1 overflow-y-auto">
          {accounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-white/30">
              <div className="text-5xl mb-4">⚔</div>
              <p className="text-lg font-medium">No accounts detected</p>
              <p className="text-sm mt-1">Launch DOFUS clients and they'll appear here automatically</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
              {accounts.map((account, i) => (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <AccountCard account={account} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="w-72 border-l border-white/5 overflow-hidden">
        <EventFeed />
      </div>
    </div>
  )
}
