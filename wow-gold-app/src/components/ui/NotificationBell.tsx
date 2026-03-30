/**
 * Notification Bell — Shows unread count from alert store
 */
import { useState, useRef, useEffect } from 'react'
import { useAlertStore } from '@/alerts/alert-store'
import { cn } from '@/utils/cn'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { notifications, unreadCount, markRead, markAllRead, dismissNotification } = useAlertStore()
  const count = unreadCount()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const visible = notifications.filter(n => !n.dismissed).slice(0, 20)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
      >
        <span className="text-lg">🔔</span>
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 animate-pulse">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 rounded-xl bg-wow-card border border-wow-border shadow-2xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-wow-border">
            <span className="text-sm font-semibold text-white">Notifications</span>
            {count > 0 && (
              <button
                onClick={() => markAllRead()}
                className="text-[10px] text-wow-gold hover:underline"
              >
                Tout marquer lu
              </button>
            )}
          </div>

          <div className="overflow-y-auto max-h-72">
            {visible.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">Aucune notification</p>
            ) : (
              visible.map(n => (
                <div
                  key={n.id}
                  className={cn(
                    'flex items-start gap-3 px-4 py-3 border-b border-wow-border/30 last:border-b-0 transition-colors',
                    !n.read && 'bg-wow-gold/5'
                  )}
                >
                  <span className="text-base mt-0.5 flex-shrink-0">
                    {n.type === 'opportunity' ? '💰' : n.type === 'warning' ? '⚠️' : 'ℹ️'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-300 leading-snug">{n.message}</p>
                    <p className="text-[10px] text-slate-600 mt-1">
                      {n.itemName} · {new Date(n.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {!n.read && (
                      <button onClick={() => markRead(n.id)} className="text-[10px] text-slate-500 hover:text-wow-gold">
                        ✓
                      </button>
                    )}
                    <button onClick={() => dismissNotification(n.id)} className="text-[10px] text-slate-500 hover:text-red-400">
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
