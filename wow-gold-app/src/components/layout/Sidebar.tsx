import { NavLink } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { useSettingsStore } from '@/store/settingsStore'
import { useAlertStore } from '@/alerts/alert-store'

// ── Nav structure ──────────────────────────────────────
const NAV_SECTIONS = [
  {
    title: 'Analyse',
    items: [
      { to: '/',             icon: '◈', label: 'Tableau de bord' },
      { to: '/market-intel', icon: '◉', label: 'Market Intel' },
      { to: '/ai-insights',  icon: '✦', label: 'Insights IA' },
    ],
  },
  {
    title: 'Trading',
    items: [
      { to: '/items',        icon: '◎', label: 'Marché & Prix' },
      { to: '/flipper',      icon: '▲', label: 'Market Flipper' },
      { to: '/crafting',     icon: '⚙', label: 'Calculateur' },
    ],
  },
  {
    title: 'Calculateurs',
    items: [
      { to: '/prospecting',  icon: '⬡', label: 'Prospection' },
      { to: '/enchanting',   icon: '✧', label: 'Enchanting Shuffle' },
    ],
  },
  {
    title: 'Professions',
    items: [
      { to: '/knowledge',    icon: '◆', label: 'KP & Moxie' },
      { to: '/equipment',    icon: '⬧', label: 'Équipement BiS' },
      { to: '/treasures',    icon: '⬡', label: 'Carte aux Trésors' },
      { to: '/professions',  icon: '◈', label: 'Guides Professions' },
    ],
  },
  {
    title: 'Outils',
    items: [
      { to: '/watchlist',    icon: '◎', label: 'Watchlist & Alertes' },
      { to: '/strategies',   icon: '▦', label: 'Stratégies' },
    ],
  },
  {
    title: 'Système',
    items: [
      { to: '/settings',     icon: '◌', label: 'Paramètres' },
    ],
  },
]

// ── Logo gem animation ─────────────────────────────────
function LogoGem() {
  return (
    <div className="relative w-8 h-8 flex-shrink-0">
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-wow-goldDark to-wow-gold opacity-90 animate-pulse-gold" />
      <div className="absolute inset-0 rounded-lg flex items-center justify-center">
        <span className="text-wow-bg font-bold text-sm font-wow">G</span>
      </div>
    </div>
  )
}

export function Sidebar() {
  const { settings } = useSettingsStore()
  const unreadCount = useAlertStore(s => s.unreadCount)

  return (
    <aside className="sidebar-glass fixed left-0 top-0 h-full w-56 border-r border-wow-border/60 flex flex-col z-40">

      {/* ── Logo ────────────────────────────────── */}
      <div className="px-4 py-4 border-b border-wow-border/40">
        <div className="flex items-center gap-2.5">
          <LogoGem />
          <div className="min-w-0">
            <h1 className="font-wow text-shimmer text-sm font-bold leading-none tracking-wide">GoldMaster</h1>
            <p className="text-[9px] text-slate-600 mt-0.5 tracking-wider">BLOOMBERG TERMINAL · v2</p>
          </div>
        </div>
      </div>

      {/* ── Realm ───────────────────────────────── */}
      <div className="px-4 py-2.5 border-b border-wow-border/30">
        <div className="flex items-center gap-2 text-[11px]">
          <span className={cn(
            'w-1.5 h-1.5 rounded-full animate-pulse',
            settings.faction === 'alliance' ? 'bg-wow-blue' : 'bg-wow-red'
          )} />
          <span className="text-slate-500 truncate font-medium">{settings.realm}</span>
          <span className="text-wow-border">·</span>
          <span className="text-slate-600 uppercase text-[9px] tracking-widest">{settings.region}</span>
        </div>
      </div>

      {/* ── Navigation ──────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-2">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="mb-1">

            {/* Section header with rune separator */}
            <div className="rune-sep px-3 py-1.5">
              <span className="text-[9px] uppercase tracking-[0.15em] text-wow-textDim font-semibold whitespace-nowrap">
                {section.title}
              </span>
            </div>

            {/* Nav items */}
            {section.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'nav-item flex items-center gap-2.5 px-3 py-1.5 mx-2 rounded-lg text-[13px] font-medium',
                    isActive ? 'nav-item-active' : ''
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={cn(
                      'text-sm w-4 text-center flex-shrink-0 transition-all duration-150',
                      isActive ? 'text-wow-gold drop-shadow-[0_0_4px_rgba(232,184,109,0.6)]' : 'text-slate-600'
                    )}>
                      {item.icon}
                    </span>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.to === '/watchlist' && unreadCount() > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-wow-red text-white text-[9px] font-bold leading-none">
                        {unreadCount()}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* ── Footer ──────────────────────────────── */}
      <div className="px-4 py-3 border-t border-wow-border/30">
        <div className="flex items-center justify-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-wow-gold/40 animate-glow" />
          <p className="text-[9px] text-slate-700 tracking-wider uppercase">
            WoW Midnight · Quel'Thalas
          </p>
          <span className="w-1 h-1 rounded-full bg-wow-gold/40 animate-glow" style={{ animationDelay: '0.5s' }} />
        </div>
      </div>
    </aside>
  )
}
