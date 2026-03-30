import { useState } from 'react'
import { PageWrapper, Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/utils/cn'
import { PROFESSION_KP, RACIAL_BONUSES, type ProfessionKPData } from '@/data/knowledge-points'

const TYPE_COLOR: Record<string, string> = {
  crafting:  'text-blue-400 bg-blue-400/10 border-blue-400/20',
  gathering: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
}

function KPBar({ value, max, label }: { value: number; max: number; label?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div>
      {label && <div className="flex justify-between mb-1"><span className="text-[10px] text-slate-500">{label}</span><span className="text-[10px] text-wow-gold">{value}</span></div>}
      <div className="h-1.5 rounded-full bg-wow-bg overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-wow-goldDark to-wow-gold" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function ProfessionCard({ data, isSelected, onClick }: { data: ProfessionKPData; isSelected: boolean; onClick: () => void }) {
  const weeklyMax = Array.isArray(data.weeklyKPWithPatrons) ? data.weeklyKPWithPatrons[1] : data.weeklyKPWithPatrons
  const weeklyMin = Array.isArray(data.weeklyKPWithPatrons) ? data.weeklyKPWithPatrons[0] : data.weeklyKPWithPatrons
  const typeClass = TYPE_COLOR[data.type]

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
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className={cn('font-bold text-base', isSelected ? 'text-wow-gold' : 'text-white')}>
            {data.profession}
          </p>
          <span className={cn('text-[10px] px-1.5 py-0.5 rounded border mt-1 inline-block', typeClass)}>
            {data.type}
          </span>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-500">KP/semaine</p>
          <p className="text-lg font-bold text-wow-gold font-mono">
            {weeklyMin === weeklyMax ? weeklyMin : `${weeklyMin}–${weeklyMax}`}
          </p>
        </div>
      </div>
      <KPBar value={data.weeklyKPBase} max={weeklyMax} label={`Base: ${data.weeklyKPBase}`} />
      {data.totalFirstCraftKP > 0 && (
        <p className="text-[10px] text-slate-500 mt-2">
          First crafts: <span className="text-amber-400">{data.totalFirstCraftKP} KP</span>
          {' · '}<span className="text-yellow-400">{data.totalMoxieFromFirstCraft} Moxie</span>
        </p>
      )}
    </button>
  )
}

export function KnowledgePoints() {
  const [selected, setSelected] = useState<ProfessionKPData | null>(null)
  const [tab, setTab] = useState<'kp' | 'racial'>('kp')

  const crafting = PROFESSION_KP.filter(p => p.type === 'crafting')
  const gathering = PROFESSION_KP.filter(p => p.type === 'gathering')

  return (
    <PageWrapper>
      <Header
        title="Knowledge Points"
        subtitle="Tracker KP & Moxie — Midnight v12.0.1"
        icon="📚"
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => setTab('kp')}
              className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-all', tab === 'kp' ? 'bg-wow-gold/10 text-wow-gold border border-wow-gold/20' : 'text-slate-400 hover:text-white')}
            >
              KP & Moxie
            </button>
            <button
              onClick={() => setTab('racial')}
              className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-all', tab === 'racial' ? 'bg-wow-gold/10 text-wow-gold border border-wow-gold/20' : 'text-slate-400 hover:text-white')}
            >
              Bonus raciaux
            </button>
          </div>
        }
      />

      {tab === 'kp' && (
        <div className="space-y-6">
          {/* Info moxie */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { icon: '🔮', label: 'Moxie', desc: 'Monnaie de profession Midnight', note: '150 = seuil vendeur artisan' },
              { icon: '📖', label: 'Patron Orders', desc: 'Commandes de patrons hebdo', note: '+15 à +20 KP/sem par profession' },
              { icon: '💎', label: 'First Crafts', desc: 'Bonus unique au premier craft', note: '+5/+10/+15 Moxie selon recette' },
            ].map(s => (
              <div key={s.label} className="p-4 rounded-xl bg-wow-surface border border-wow-border">
                <p className="text-2xl mb-2">{s.icon}</p>
                <p className="text-sm font-bold text-white">{s.label}</p>
                <p className="text-xs text-slate-400 mt-1">{s.desc}</p>
                <p className="text-xs text-wow-gold mt-1">{s.note}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profession list */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xs uppercase tracking-wider text-slate-600 font-semibold mb-3">Professions de métier</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {crafting.map(p => (
                    <ProfessionCard
                      key={p.profession}
                      data={p}
                      isSelected={selected?.profession === p.profession}
                      onClick={() => setSelected(selected?.profession === p.profession ? null : p)}
                    />
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-wider text-slate-600 font-semibold mb-3">Collecteurs</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {gathering.map(p => (
                    <ProfessionCard
                      key={p.profession}
                      data={p}
                      isSelected={selected?.profession === p.profession}
                      onClick={() => setSelected(selected?.profession === p.profession ? null : p)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Detail panel */}
            <div>
              {selected ? (
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle icon="🔍">{selected.profession} — Détail KP</CardTitle>
                    {selected.notes && (
                      <p className="text-xs text-amber-400/80 mt-1 italic">{selected.notes}</p>
                    )}
                  </CardHeader>
                  <div className="mt-4 space-y-4">
                    {/* Sources */}
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Sources hebdomadaires</p>
                      <div className="space-y-2">
                        {selected.sources.map(src => (
                          <div key={src.source} className="flex items-center justify-between p-2.5 rounded-lg bg-wow-bg border border-wow-border/50">
                            <div>
                              <p className="text-xs text-white font-medium">{src.source}</p>
                              {src.notes && <p className="text-[10px] text-slate-500 mt-0.5">{src.notes}</p>}
                            </div>
                            <span className="text-sm font-bold text-wow-gold font-mono">
                              {Array.isArray(src.kpAmount)
                                ? `${src.kpAmount[0]}–${src.kpAmount[1]}`
                                : src.kpAmount} KP
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Weekly total */}
                    <div className="p-3 rounded-lg bg-wow-gold/5 border border-wow-gold/20">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-300">KP base/semaine</span>
                        <span className="text-lg font-bold text-wow-gold">{selected.weeklyKPBase}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-slate-300">Avec Patron Orders</span>
                        <span className="text-lg font-bold text-wow-gold">
                          {Array.isArray(selected.weeklyKPWithPatrons)
                            ? `${selected.weeklyKPWithPatrons[0]}–${selected.weeklyKPWithPatrons[1]}`
                            : selected.weeklyKPWithPatrons}
                        </span>
                      </div>
                    </div>

                    {/* First crafts */}
                    {selected.totalFirstCraftKP > 0 && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">First Crafts (one-time)</p>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: '+5 Moxie', count: selected.firstCraftPlus5, color: 'text-slate-300' },
                            { label: '+10 Moxie', count: selected.firstCraftPlus10, color: 'text-amber-300' },
                            { label: '+15 Moxie', count: selected.firstCraftPlus15, color: 'text-yellow-300' },
                          ].map(fc => fc.count > 0 && (
                            <div key={fc.label} className="text-center p-2 rounded-lg bg-wow-bg border border-wow-border">
                              <p className="text-lg font-bold text-wow-gold">{fc.count}</p>
                              <p className={cn('text-[10px]', fc.color)}>{fc.label}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 flex justify-between items-center p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20">
                          <span className="text-xs text-amber-300">Total First Crafts</span>
                          <div className="text-right">
                            <span className="text-sm font-bold text-wow-gold">{selected.totalFirstCraftKP} KP</span>
                            <span className="text-xs text-amber-400 ml-2">+ {selected.totalMoxieFromFirstCraft} Moxie</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <p className="text-4xl mb-3">📚</p>
                  <p className="text-slate-500 text-sm">Sélectionnez une profession</p>
                  <p className="text-slate-600 text-xs mt-1">pour voir le détail des sources de KP</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'racial' && (
        <div>
          <div className="mb-4 p-3 rounded-xl bg-blue-500/5 border border-blue-500/20">
            <p className="text-xs text-blue-300">
              Bonus raciaux confirmés — Source: sheet communautaire v12.0.1 · {RACIAL_BONUSES.length} races
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {RACIAL_BONUSES.map(rb => (
              <div
                key={rb.race}
                className={cn(
                  'p-4 rounded-xl border transition-all hover:border-wow-gold/30',
                  rb.note ? 'bg-amber-500/5 border-amber-500/20' : 'bg-wow-surface border-wow-border'
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-bold text-white">{rb.race}</p>
                  {rb.note && (
                    <Badge variant="orange">{rb.note}</Badge>
                  )}
                </div>
                <p className="text-sm text-wow-gold font-medium">{rb.bonus}</p>
                <p className="text-xs text-slate-500 mt-1">Idéal: {rb.idealProfession}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageWrapper>
  )
}
