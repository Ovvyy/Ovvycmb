import { useState, useMemo } from 'react'
import { PageWrapper, Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/utils/cn'
import { TREASURES, getTreasuresByProfession, getTreasuresByZone, type Treasure } from '@/data/treasures'

const ZONE_COLOR: Record<string, string> = {
  Eversong:    'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  Harandar:    'text-teal-400 bg-teal-400/10 border-teal-400/20',
  Silvermoon:  'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  Voidstorm:   'text-purple-400 bg-purple-400/10 border-purple-400/20',
  "Zul'Aman":  'text-red-400 bg-red-400/10 border-red-400/20',
  Unknown:     'text-slate-400 bg-slate-400/10 border-slate-400/20',
}

const ZONE_ICON: Record<string, string> = {
  Eversong:    '🌲',
  Harandar:    '🏔️',
  Silvermoon:  '🌆',
  Voidstorm:   '🌀',
  "Zul'Aman":  '🗡️',
  Unknown:     '❓',
}

function TreasureCard({ treasure, checked, onToggle }: {
  treasure: Treasure
  checked: boolean
  onToggle: () => void
}) {
  const zoneClass = ZONE_COLOR[treasure.zone] ?? ZONE_COLOR.Unknown

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer group',
        checked
          ? 'bg-emerald-500/5 border-emerald-500/20 opacity-60'
          : 'bg-wow-surface border-wow-border hover:border-wow-gold/30'
      )}
      onClick={onToggle}
    >
      <button
        className={cn(
          'w-5 h-5 rounded flex-shrink-0 mt-0.5 border-2 flex items-center justify-center transition-all',
          checked ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500 group-hover:border-wow-gold'
        )}
      >
        {checked && <span className="text-[10px] text-white font-bold">✓</span>}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-sm font-medium', checked ? 'line-through text-slate-500' : 'text-white')}>
            {treasure.name}
          </p>
          <span className={cn('text-[10px] px-1.5 py-0.5 rounded border flex-shrink-0', zoneClass)}>
            {ZONE_ICON[treasure.zone]} {treasure.zone}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-[10px] text-slate-500 font-mono">
            📍 {treasure.x.toFixed(2)}, {treasure.y.toFixed(2)}
          </span>
          {treasure.notes && (
            <span className="text-[10px] text-slate-600 italic truncate">{treasure.notes}</span>
          )}
        </div>
        {treasure.wayCommand && (
          <div className="mt-1.5">
            <code className="text-[10px] text-amber-300/70 bg-amber-300/5 px-1.5 py-0.5 rounded font-mono">
              {treasure.wayCommand}
            </code>
          </div>
        )}
      </div>
    </div>
  )
}

const ALL_PROFESSIONS = [...new Set(TREASURES.map(t => t.profession))].sort()
const ALL_ZONES = [...new Set(TREASURES.map(t => t.zone))].sort()

export function TreasureMap() {
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [filterProf, setFilterProf] = useState<string>('ALL')
  const [filterZone, setFilterZone] = useState<string>('ALL')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    let list = TREASURES
    if (filterProf !== 'ALL') list = list.filter(t => t.profession === filterProf)
    if (filterZone !== 'ALL') list = list.filter(t => t.zone === filterZone)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(t => t.name.toLowerCase().includes(q) || t.zone.toLowerCase().includes(q))
    }
    return list
  }, [filterProf, filterZone, search])

  const checkedInFiltered = filtered.filter(t => checked.has(t.id)).length
  const progress = filtered.length > 0 ? (checkedInFiltered / filtered.length) * 100 : 0

  const toggle = (id: string) => {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    const allIds = filtered.map(t => t.id)
    const allChecked = allIds.every(id => checked.has(id))
    setChecked(prev => {
      const next = new Set(prev)
      if (allChecked) allIds.forEach(id => next.delete(id))
      else allIds.forEach(id => next.add(id))
      return next
    })
  }

  const resetAll = () => setChecked(new Set())

  return (
    <PageWrapper>
      <Header
        title="Carte aux Trésors"
        subtitle="Trésors de profession — KP hebdomadaires · WoW Midnight"
        icon="🗺️"
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="blue">{checked.size}/{TREASURES.length} collectés</Badge>
            <button
              onClick={resetAll}
              className="text-xs text-slate-500 hover:text-red-400 transition-colors px-2 py-1 rounded border border-slate-700 hover:border-red-400/30"
            >
              Reset
            </button>
          </div>
        }
      />

      {/* Progression globale */}
      <div className="mb-5 p-4 rounded-xl bg-wow-surface border border-wow-border">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-white">Progression (filtrée)</span>
          <span className="text-sm font-bold text-wow-gold">{checkedInFiltered} / {filtered.length}</span>
        </div>
        <div className="h-2.5 rounded-full bg-wow-bg overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-wow-goldDark to-wow-gold transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-slate-600">{TREASURES.length} trésors au total</span>
          <span className="text-[10px] text-slate-600">{progress.toFixed(0)}%</span>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Rechercher..."
          className="bg-wow-surface border border-wow-border rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-wow-gold/50 focus:outline-none w-48"
        />
        <select
          value={filterProf}
          onChange={e => setFilterProf(e.target.value)}
          className="bg-wow-surface border border-wow-border rounded-lg px-3 py-2 text-sm text-white focus:border-wow-gold/50 focus:outline-none"
        >
          <option value="ALL">Toutes professions</option>
          {ALL_PROFESSIONS.map(p => (
            <option key={p} value={p}>{p} ({getTreasuresByProfession(p).length})</option>
          ))}
        </select>
        <select
          value={filterZone}
          onChange={e => setFilterZone(e.target.value)}
          className="bg-wow-surface border border-wow-border rounded-lg px-3 py-2 text-sm text-white focus:border-wow-gold/50 focus:outline-none"
        >
          <option value="ALL">Toutes zones</option>
          {ALL_ZONES.map(z => (
            <option key={z} value={z}>{ZONE_ICON[z]} {z} ({getTreasuresByZone(z).length})</option>
          ))}
        </select>
        <button
          onClick={toggleAll}
          className="px-3 py-2 rounded-lg border border-wow-border text-xs text-slate-400 hover:text-wow-gold hover:border-wow-gold/30 transition-colors"
        >
          Tout cocher/décocher
        </button>
      </div>

      {/* Résumé par zone */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mb-5">
        {ALL_ZONES.filter(z => z !== 'Unknown').map(zone => {
          const zoneTreasures = getTreasuresByZone(zone)
          const zoneChecked = zoneTreasures.filter(t => checked.has(t.id)).length
          const zClass = ZONE_COLOR[zone] ?? ''
          return (
            <button
              key={zone}
              onClick={() => setFilterZone(filterZone === zone ? 'ALL' : zone)}
              className={cn(
                'p-3 rounded-xl border text-center transition-all duration-150',
                filterZone === zone
                  ? zClass
                  : 'bg-wow-surface border-wow-border hover:border-wow-gold/20 text-slate-400'
              )}
            >
              <p className="text-lg">{ZONE_ICON[zone]}</p>
              <p className="text-xs font-medium mt-1">{zone}</p>
              <p className="text-[10px] mt-0.5 opacity-70">{zoneChecked}/{zoneTreasures.length}</p>
            </button>
          )
        })}
      </div>

      {/* Liste */}
      <Card>
        <CardHeader>
          <CardTitle icon="📦">
            {filtered.length} trésor{filtered.length > 1 ? 's' : ''}
            {filterProf !== 'ALL' && ` · ${filterProf}`}
            {filterZone !== 'ALL' && ` · ${filterZone}`}
          </CardTitle>
        </CardHeader>
        {filtered.length === 0 ? (
          <p className="text-center text-slate-500 text-sm py-8">Aucun trésor trouvé</p>
        ) : (
          <div className="space-y-2 mt-3">
            {filtered.map(t => (
              <TreasureCard
                key={t.id}
                treasure={t}
                checked={checked.has(t.id)}
                onToggle={() => toggle(t.id)}
              />
            ))}
          </div>
        )}
      </Card>

      <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
        <p className="text-xs text-amber-300 font-medium mb-1">💎 À propos des trésors de profession</p>
        <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
          <li>Chaque trésor donne des KP (Knowledge Points) pour votre profession</li>
          <li>Les trésors se reset chaque semaine — à collecter régulièrement</li>
          <li>Utilisez les commandes /way pour les pointer sur votre carte en jeu</li>
          <li>Coordonnées confirmées depuis la sheet communautaire v12.0.1</li>
        </ul>
      </div>
    </PageWrapper>
  )
}
