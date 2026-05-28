import { useAppStore } from '@/stores/appStore'
import { formatRelativeTime } from '@/lib/utils'
import { Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const EVENT_COLORS: Record<string, string> = {
  AccountDetected: '#22C55E',
  AccountLost: '#EF4444',
  CombatStarted: '#EF4444',
  CombatEnded: '#22C55E',
  TradeReceived: '#FFD700',
  ClientCrashed: '#F97316',
  ClientCaptcha: '#F97316',
  LayoutApplied: '#4F8EF7',
  AgentReportReady: '#A78BFA',
}

export function EventFeed() {
  const { events, clearEvents } = useAppStore()

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <span className="text-xs font-medium text-white/60 uppercase tracking-wider">Event Feed</span>
        <button onClick={clearEvents} className="p-1 rounded hover:bg-white/5 text-white/30 hover:text-white/60">
          <Trash2 size={12} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <AnimatePresence initial={false}>
          {events.length === 0 ? (
            <p className="text-xs text-white/20 text-center py-8">No events yet</p>
          ) : (
            events.map((evt) => (
              <motion.div
                key={evt.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-2 py-1.5 px-2 rounded hover:bg-white/3 group"
              >
                <div
                  className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                  style={{ background: EVENT_COLORS[evt.type] ?? 'rgba(255,255,255,0.3)' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white/70 truncate">{evt.type}</p>
                  {evt.message && <p className="text-xs text-white/40 truncate">{evt.message}</p>}
                  <p className="text-xs text-white/20 mt-0.5">{formatRelativeTime(evt.timestamp)}</p>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
