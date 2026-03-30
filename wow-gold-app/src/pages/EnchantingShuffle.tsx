import { useState, useMemo } from 'react'
import { PageWrapper, Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/utils/cn'
import { formatGold } from '@/utils/gold'
import {
  DE_MATERIALS_PER_1000,
  SHUFFLE_BATCHES,
  calcEnchantingShuffle,
  CRAFTING_TIME_1000_MINUTES,
  DISENCHANT_TIME_1000_MINUTES,
  TIME_PER_ITEM_SECONDS,
} from '@/data/enchanting-shuffle'

const MAT_COLOR: Record<string, string> = {
  'Radiant Shard_R1': 'text-sky-300',
  'Radiant Shard_R2': 'text-sky-400',
  'Tranquility_R1':   'text-purple-400',
  'Scales_R1':        'text-emerald-400',
  'Leather_R1':       'text-amber-400',
  'Linen_R1':         'text-yellow-300',
  'Copper_R1':        'text-orange-400',
}

export function EnchantingShuffle() {
  const [numEvercores, setNumEvercores] = useState(1000)
  const [evercorePrice, setEvercorePrice] = useState(5.89)
  const [matPrices, setMatPrices] = useState<Record<string, number>>({})
  const [selectedBatch, setSelectedBatch] = useState(0)

  const result = useMemo(() =>
    calcEnchantingShuffle(numEvercores, evercorePrice, matPrices),
    [numEvercores, evercorePrice, matPrices]
  )

  const handleMatPrice = (key: string, val: number) => {
    setMatPrices(p => ({ ...p, [key]: val }))
  }

  const profitColor = result.profit >= 0 ? 'text-emerald-400' : 'text-red-400'
  const profitIcon  = result.profit >= 0 ? '▲' : '▼'

  const craftTimeTotal = (numEvercores / 1000) * CRAFTING_TIME_1000_MINUTES
  const disenchantTimeTotal = (numEvercores / 1000) * DISENCHANT_TIME_1000_MINUTES
  const totalMinutes = craftTimeTotal + disenchantTimeTotal

  return (
    <PageWrapper>
      <Header
        title="Enchanting Shuffle"
        subtitle="Craft Evercore → Désenchanter → Profit"
        icon="✨"
        actions={
          <Badge variant="blue">v12.0.1 · Données confirmées</Badge>
        }
      />

      {/* Batch presets */}
      <div className="mb-4">
        <p className="text-xs text-slate-500 mb-2">Modes de craft (avec procs Resourcefulness)</p>
        <div className="flex gap-3 flex-wrap">
          {SHUFFLE_BATCHES.map((batch, i) => (
            <button
              key={batch.label}
              onClick={() => { setSelectedBatch(i); setNumEvercores(batch.totalCrafts) }}
              className={cn(
                'px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-150',
                selectedBatch === i
                  ? 'border-wow-gold bg-wow-gold/10 text-wow-gold'
                  : 'border-wow-border text-slate-400 hover:border-wow-gold/30 hover:text-white'
              )}
            >
              {batch.label}
              <span className="ml-2 text-xs opacity-60">({batch.craftsBase} + {batch.craftsFromProcs} = {batch.totalCrafts})</span>
            </button>
          ))}
          <button
            onClick={() => setSelectedBatch(-1)}
            className={cn(
              'px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-150',
              selectedBatch === -1
                ? 'border-wow-gold bg-wow-gold/10 text-wow-gold'
                : 'border-wow-border text-slate-400 hover:border-wow-gold/30 hover:text-white'
            )}
          >
            Personnalisé
          </button>
        </div>
      </div>

      {/* Config + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle icon="⚙️">Configuration</CardTitle>
          </CardHeader>
          <div className="space-y-3 mt-2">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Nombre d'Evercores à crafter</label>
              <input
                type="number"
                value={numEvercores}
                min={1}
                onChange={e => { setNumEvercores(parseInt(e.target.value) || 1); setSelectedBatch(-1) }}
                className="w-full bg-wow-bg border border-wow-border rounded-lg px-3 py-2 text-sm text-white focus:border-wow-gold/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">
                Prix d'un Evercore (g) — défaut: 5.89g
              </label>
              <input
                type="number"
                step="0.01"
                value={evercorePrice}
                onChange={e => setEvercorePrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-wow-bg border border-wow-border rounded-lg px-3 py-2 text-sm text-wow-gold font-mono focus:border-wow-gold/50 focus:outline-none"
              />
            </div>
            <div className="pt-2 border-t border-wow-border/50 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Temps de craft estimé</span>
                <span className="text-white font-mono">
                  {craftTimeTotal.toFixed(1)} min ({TIME_PER_ITEM_SECONDS}s/item)
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Temps de désenchantement</span>
                <span className="text-white font-mono">{disenchantTimeTotal.toFixed(1)} min</span>
              </div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-400">Temps total</span>
                <span className="text-wow-gold font-mono">{totalMinutes.toFixed(1)} min</span>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Coût craft', value: formatGold(result.craftCost), icon: '🔥', color: 'text-red-400' },
            { label: 'Valeur DE', value: formatGold(result.totalValue), icon: '✨', color: 'text-sky-400' },
            { label: 'Profit', value: `${profitIcon} ${formatGold(Math.abs(result.profit))}`, icon: '💰', color: profitColor },
            { label: 'Or/heure', value: `${formatGold(Math.max(0, result.goldPerHour))}/h`, icon: '⏱️', color: 'text-amber-400' },
          ].map(s => (
            <Card key={s.label} className="text-center py-5 flex flex-col items-center justify-center">
              <span className="text-2xl mb-2">{s.icon}</span>
              <p className="text-xs text-slate-500 mb-1">{s.label}</p>
              <p className={cn('text-base font-bold font-mono', s.color)}>{s.value}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Materials breakdown */}
      <Card>
        <CardHeader>
          <CardTitle icon="🔮">Matériaux de désenchantement — {numEvercores} items</CardTitle>
          <p className="text-xs text-slate-500 mt-1">
            Taux par 1000 DE · Resourcefulness NON inclus dans ces taux
          </p>
        </CardHeader>
        <div className="space-y-2 mt-4">
          {result.materials.map((mat, i) => {
            const key = `${mat.name}_${mat.rank}`
            const colorClass = MAT_COLOR[key] ?? 'text-slate-300'
            const rateData = DE_MATERIALS_PER_1000[i]
            const rate = rateData ? (rateData.ratePerThousand / 10).toFixed(2) : '?'

            return (
              <div key={key} className="flex items-center gap-3 p-3 rounded-lg bg-wow-surface border border-wow-border hover:border-wow-gold/20 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn('font-medium text-sm', colorClass)}>{mat.name}</span>
                    <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded bg-wow-bg', colorClass)}>
                      {mat.rank}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {rate}% drop rate · ~{mat.expected} attendus
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500">Prix (g)</p>
                    <input
                      type="number"
                      step="0.01"
                      value={matPrices[key] ?? DE_MATERIALS_PER_1000[i]?.defaultPrice ?? 0}
                      onChange={e => handleMatPrice(key, parseFloat(e.target.value) || 0)}
                      className="w-20 bg-wow-bg border border-wow-border rounded px-2 py-1 text-xs text-wow-gold font-mono text-right focus:border-wow-gold/50 focus:outline-none"
                    />
                  </div>
                  <div className="text-right min-w-[80px]">
                    <p className="text-[10px] text-slate-500">Total</p>
                    <p className="text-sm font-bold text-wow-gold font-mono">{formatGold(mat.totalValue)}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ROI bar */}
        <div className="mt-4 pt-4 border-t border-wow-border">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-500">ROI</span>
            <span className={cn('text-sm font-bold font-mono', profitColor)}>
              {result.profitPercent >= 0 ? '+' : ''}{result.profitPercent.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-wow-bg overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500', result.profit >= 0 ? 'bg-emerald-500' : 'bg-red-500')}
              style={{ width: `${Math.min(100, Math.abs(result.profitPercent))}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Info */}
      <div className="mt-4 p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
        <p className="text-xs text-purple-300 font-medium mb-2">✨ Comment fonctionne l'Enchanting Shuffle</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-400">
          <div className="flex flex-col gap-1">
            <span className="text-white font-medium">1. Craft Evercore</span>
            <span>Artisanat par un Enchanteur — ~{TIME_PER_ITEM_SECONDS}s/item avec +7% vitesse de craft</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-white font-medium">2. Désenchanter</span>
            <span>Chaque item donne des Radiant Shards + bonus matériaux (Linen, Copper, etc.)</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-white font-medium">3. Vendre</span>
            <span>Les Radiant Shards R1/R2 sont demandés pour les enchantements de raid</span>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
