import { NavLink } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { useSettingsStore } from '@/store/settingsStore'
import { useAlertStore } from '@/alerts/alert-store'

const NAV_SECTIONS = [
  {
    title: 'Analyse',
    items: [
      { to: '/',              icon: '🏠', label: 'Tableau de bord' },
      { to: '/market-intel',  icon: '📊', label: 'Market Intel' },
      { to: '/ai-insights',   icon: '🤖', label: 'Insights IA' },
    ],
  },
  {
    title: 'Trading',
    items: [
      { to: '/items',         icon: '🔍', label: 'Marché & Prix' },
      { to: '/flipper',       icon: '📈', label: 'Market Flipper' },
      { to: '/crafting',      icon: '⚒️', label: 'Calculateur' },
    ],
  },
  {
    title: 'Calculateurs',
    items: [
      { to: '/prospecting',   icon: '⛏️', label: 'Prospection' },
      { to: '/enchanting',    icon: '✨', label: 'Enchanting Shuffle' },
    ],
  },
  {
    title: 'Professions',
    items: [
      { to: '/knowledge',     icon: '📚', label: 'KP & Moxie' },
      { to: '/equipment',     icon: '🛡️', label: 'Équipement BiS' },
      { to: '/treasures',     icon: '🗺️', label: 'Carte aux Trésors' },
      { to: '/professions',   icon: '🎓', label: 'Guides Professions' },
    ],
  },
  {
    title: 'Outils',
    items: [
      { to: '/watchlist',     icon: '👁️', label: 'Watchlist & Alertes' },
      { to: '/strategies',    icon: '📋', label: 'Stratégies' },
    ],
  },
  {
    title: 'Système',
    items: [
      { to: '/settings',      icon: '⚙️', label: 'Paramètres' },
    ],
  },
]

export function Sidebar() {
  const { settings } = useSettingsStore()
  const unreadCount = useAlertStore(s => s.unreadCount)

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-wow-surface border-r border-wow-border flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-wow-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-wow-goldDark to-wow-gold flex items-center justify-center text-wow-bg font-bold text-lg shadow-gold-sm">
            G
          </div>
          <div>
            <h1 className="font-wow text-shimmer text-base font-bold leading-none">GoldMaster</h1>
            <p className="text-[10px] text-slate-600 mt-0.5">Bloomberg Terminal · v2.0</p>
          </div>
        </div>
      </div>

      {/* Realm info */}
      <div className="px-4 py-2.5 border-b border-wow-border/50">
        <div className="flex items-center gap-2 text-xs">
          <span className={cn(
            'w-2 h-2 rounded-full',
            settings.faction === 'alliance' ? 'bg-blue-400' : 'bg-red-400'
          )} />
          <span className="text-slate-400 truncate">{settings.realm}</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-500 uppercase text-[10px]">{settings.region}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {NAV_SECTIONS.map(section => (
          <div key={section.title}>
            <p className="px-2 pt-2.5 pb-1 text-[10px] uppercase font-semibold tracking-wider text-slate-600">
              {section.title}
            </p>
            {section.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150',
                    isActive
                      ? 'bg-wow-gold/12 text-wow-gold border border-wow-gold/20 font-medium'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  )
                }
              >
                <span className="text-base leading-none">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.to === '/watchlist' && unreadCount() > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold">
                    {unreadCount()}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-wow-border/50 space-y-1">
        <p className="text-[10px] text-slate-600 text-center">
          Données: Blizzard AH API (Midnight)
        </p>
        <p className="text-[10px] text-slate-700 text-center">
          WoW Midnight v12.0.1 — Quel'Thalas 🌑
        </p>
      </div>
    </aside>
  )
}
