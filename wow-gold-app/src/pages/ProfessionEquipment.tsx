import { useState } from 'react'
import { PageWrapper, Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/utils/cn'
import { PROFESSION_BIS, type ProfessionBiS } from '@/data/profession-equipment'

const CRAFTER_COLOR: Record<string, string> = {
  Enchanting:     'text-sky-300 bg-sky-300/10 border-sky-300/20',
  Tailoring:      'text-purple-300 bg-purple-300/10 border-purple-300/20',
  Jewelcrafting:  'text-yellow-300 bg-yellow-300/10 border-yellow-300/20',
  Blacksmithing:  'text-slate-300 bg-slate-300/10 border-slate-300/20',
  Engineering:    'text-orange-300 bg-orange-300/10 border-orange-300/20',
  Inscription:    'text-teal-300 bg-teal-300/10 border-teal-300/20',
  Leatherworking: 'text-amber-300 bg-amber-300/10 border-amber-300/20',
  Alchemy:        'text-green-300 bg-green-300/10 border-green-300/20',
}

function ItemSlot({ label, name, craftedBy, slot }: { label: string; name: string; craftedBy?: string; slot: 'tool' | 'accessory' }) {
  const crafterClass = craftedBy ? (CRAFTER_COLOR[craftedBy] ?? 'text-slate-300 bg-slate-300/10 border-slate-300/20') : ''
  const slotIcon = slot === 'tool' ? '🔧' : '💠'

  return (
    <div className="p-3 rounded-xl bg-wow-bg border border-wow-border hover:border-wow-gold/20 transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm">{slotIcon}</span>
        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{label}</span>
      </div>
      <p className={cn('text-sm font-medium', name === '-' ? 'text-slate-600 italic' : 'text-white')}>
        {name === '-' ? 'Non disponible' : name}
      </p>
      {craftedBy && name !== '-' && (
        <div className="mt-2">
          <span className={cn('text-[10px] px-2 py-0.5 rounded border font-medium', crafterClass)}>
            Crafté par: {craftedBy}
          </span>
        </div>
      )}
    </div>
  )
}

function ProfBiSCard({ data, isSelected, onClick }: { data: ProfessionBiS; isSelected: boolean; onClick: () => void }) {
  const crafters = [data.tool.craftedBy, data.accessory1.craftedBy, data.accessory2.craftedBy]
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i)

  return (
    <button
      className={cn(
        'text-left w-full p-4 rounded-xl border-2 transition-all duration-200',
        isSelected
          ? 'border-wow-gold bg-wow-gold/8 shadow-[0_0_16px_rgba(212,175,55,0.15)]'
          : 'border-wow-border bg-wow-surface hover:border-wow-gold/30'
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{data.professionIcon}</span>
        <div className="flex-1">
          <p className={cn('font-bold', isSelected ? 'text-wow-gold' : 'text-white')}>
            {data.profession}
          </p>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {crafters.map(c => c && (
              <span key={c} className={cn('text-[9px] px-1.5 py-0.5 rounded border', CRAFTER_COLOR[c] ?? 'text-slate-400 border-slate-400/20 bg-slate-400/10')}>
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  )
}

export function ProfessionEquipment() {
  const [selected, setSelected] = useState<ProfessionBiS | null>(null)
  const [craftFilter, setCraftFilter] = useState<string>('ALL')

  // Count how many BiS items each profession crafts for others
  const crafterStats: Record<string, number> = {}
  PROFESSION_BIS.forEach(prof => {
    ;[prof.tool, prof.accessory1, prof.accessory2].forEach(item => {
      if (item.craftedBy) {
        crafterStats[item.craftedBy] = (crafterStats[item.craftedBy] ?? 0) + 1
      }
    })
  })

  const sortedCrafters = Object.entries(crafterStats).sort((a, b) => b[1] - a[1])

  const filtered = craftFilter === 'ALL'
    ? PROFESSION_BIS
    : PROFESSION_BIS.filter(p =>
        p.tool.craftedBy === craftFilter ||
        p.accessory1.craftedBy === craftFilter ||
        p.accessory2.craftedBy === craftFilter
      )

  return (
    <PageWrapper>
      <Header
        title="Équipement BiS"
        subtitle="Meilleur équipement de profession — Midnight v12.0.1"
        icon="⚒️"
        actions={
          <Badge variant="blue">Sheet confirmée · 13 professions</Badge>
        }
      />

      {/* Market opportunity: who crafts for everyone */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle icon="💹">Opportunités de marché — Qui craft pour qui ?</CardTitle>
          <p className="text-xs text-slate-500 mt-1">
            Les professions qui craftent le plus d'items BiS pour les autres ont la meilleure opportunité de vente
          </p>
        </CardHeader>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {sortedCrafters.map(([prof, count]) => (
            <button
              key={prof}
              onClick={() => setCraftFilter(craftFilter === prof ? 'ALL' : prof)}
              className={cn(
                'p-3 rounded-xl border text-center transition-all duration-150',
                craftFilter === prof
                  ? (CRAFTER_COLOR[prof] ?? 'text-slate-300 bg-slate-300/10 border-slate-300/20')
                  : 'bg-wow-bg border-wow-border hover:border-wow-gold/20'
              )}
            >
              <p className="text-2xl font-bold text-wow-gold">{count}</p>
              <p className={cn('text-xs font-medium mt-1', craftFilter === prof ? '' : 'text-white')}>{prof}</p>
              <p className="text-[10px] text-slate-500">items craftés</p>
            </button>
          ))}
        </div>
        {craftFilter !== 'ALL' && (
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="blue">Filtre: {craftFilter}</Badge>
            <button onClick={() => setCraftFilter('ALL')} className="text-xs text-slate-500 hover:text-slate-300">
              ✕ Réinitialiser
            </button>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profession grid */}
        <div className="lg:col-span-1">
          <h3 className="text-xs uppercase tracking-wider text-slate-600 font-semibold mb-3">
            {filtered.length} profession{filtered.length > 1 ? 's' : ''}
          </h3>
          <div className="space-y-2">
            {filtered.map(p => (
              <ProfBiSCard
                key={p.profession}
                data={p}
                isSelected={selected?.profession === p.profession}
                onClick={() => setSelected(selected?.profession === p.profession ? null : p)}
              />
            ))}
          </div>
        </div>

        {/* Detail */}
        <div className="lg:col-span-2">
          {selected ? (
            <Card className="sticky top-4">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{selected.professionIcon}</span>
                  <div>
                    <CardTitle>{selected.profession} — Équipement BiS</CardTitle>
                    <p className="text-xs text-slate-500 mt-0.5">Source: Sheet communautaire — confirmé en jeu v12.0.1</p>
                  </div>
                </div>
              </CardHeader>
              <div className="mt-5 space-y-3">
                <ItemSlot
                  label="Outil de profession (Tool)"
                  name={selected.tool.name}
                  craftedBy={selected.tool.craftedBy}
                  slot="tool"
                />
                <ItemSlot
                  label="Accessoire 1"
                  name={selected.accessory1.name}
                  craftedBy={selected.accessory1.craftedBy}
                  slot="accessory"
                />
                <ItemSlot
                  label="Accessoire 2"
                  name={selected.accessory2.name}
                  craftedBy={selected.accessory2.craftedBy}
                  slot="accessory"
                />
              </div>

              {/* Cross-profession view */}
              <div className="mt-5 pt-4 border-t border-wow-border">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Professions requises pour le BiS complet</p>
                <div className="flex flex-wrap gap-2">
                  {[selected.tool, selected.accessory1, selected.accessory2]
                    .filter(item => item.craftedBy && item.name !== '-')
                    .map((item, i) => (
                      <div key={i} className={cn('flex items-center gap-1.5 px-3 py-2 rounded-lg border', CRAFTER_COLOR[item.craftedBy!] ?? 'text-slate-300 border-slate-300/20 bg-slate-300/10')}>
                        <span className="text-xs font-medium">{item.craftedBy}</span>
                        <span className="text-[10px] opacity-70">→ {item.name.substring(0, 20)}{item.name.length > 20 ? '…' : ''}</span>
                      </div>
                    ))
                  }
                </div>
              </div>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-5xl mb-3">⚒️</p>
              <p className="text-slate-500 text-sm">Sélectionnez une profession</p>
              <p className="text-slate-600 text-xs mt-1">pour voir son équipement BiS</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
        <p className="text-xs text-emerald-300 font-medium mb-2">💡 Tailoring = profession clé</p>
        <p className="text-xs text-slate-400">
          Le Tailoring craft des pièces d'équipement pour presque toutes les professions (chapeaux, gants, robes...).
          C'est l'une des meilleures professions pour générer de l'or via les Patron Orders dans Midnight.
        </p>
      </div>
    </PageWrapper>
  )
}
