import { useState, useMemo } from 'react'
import { PageWrapper, Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/utils/cn'
import { formatGold } from '@/utils/gold'
import { ORE_TYPES, calcProspecting, type OreType } from '@/data/prospecting'

const QUALITY_COLOR: Record<string, string> = {
  common:   'text-slate-400',
  uncommon: 'text-emerald-400',
  rare:     'text-blue-400',
  epic:     'text-purple-400',
}
const QUALITY_BG: Record<string, string> = {
  common:   'bg-slate-500/10 border-slate-500/20',
  uncommon: 'bg-emerald-500/10 border-emerald-500/20',
  rare:     'bg-blue-500/10 border-blue-500/20',
  epic:     'bg-purple-500/10 border-purple-500/20',
}

function GemRow({ gemName, quality, dropRate, expectedCount, priceEach, totalValue, onPriceChange }: {
  gemName: string; quality: string; dropRate: number; expectedCount: number
  priceEach: number; totalValue: number; onPriceChange: (v: number) => void
}) {
  return (
    <div className={cn('flex items-center gap-3 p-3 rounded-lg border', QUALITY_BG[quality])}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn('font-medium text-sm', QUALITY_COLOR[quality])}>{gemName}</span>
          <span className={cn('text-[10px] uppercase font-bold px-1.5 py-0.5 rounded', QUALITY_BG[quality], QUALITY_COLOR[quality])}>
            {quality}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">{dropRate.toFixed(2)}% drop · ~{expectedCount} attendus</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-xs text-slate-500">Prix unitaire</p>
          <input
            type="number"
            value={priceEach}
            onChange={e => onPriceChange(parseFloat(e.target.value) || 0)}
            className="w-24 bg-wow-bg border border-wow-border rounded px-2 py-1 text-xs text-wow-gold font-mono text-right focus:border-wow-gold/50 focus:outline-none"
          />
        </div>
        <div className="text-right min-w-[80px]">
          <p className="text-xs text-slate-500">Total</p>
          <p className="text-sm font-bold text-wow-gold font-mono">{formatGold(totalValue)}</p>
        </div>
      </div>
    </div>
  )
}

export function Prospecting() {
  const [selectedOre, setSelectedOre] = useState<OreType>(ORE_TYPES[0])
  const [numProspects, setNumProspects] = useState(400)
  const [orePrice, setOrePrice] = useState<number | undefined>(undefined)
  const [gemPrices, setGemPrices] = useState<Record<string, number>>({})

  const result = useMemo(() => calcProspecting(
    selectedOre,
    numProspects,
    gemPrices,
    orePrice,
  ), [selectedOre, numProspects, orePrice, gemPrices])

  const handleGemPrice = (name: string, val: number) => {
    setGemPrices(p => ({ ...p, [name]: val }))
  }

  const profitColor = result.profit >= 0 ? 'text-emerald-400' : 'text-red-400'
  const profitIcon = result.profit >= 0 ? '▲' : '▼'

  return (
    <PageWrapper>
      <Header
        title="Prospection"
        subtitle="Calculateur de rentabilité — Umbral Tin & Brilliant Silver"
        icon="⛏️"
        actions={
          <Badge variant="blue">v12.0.1 · Données confirmées</Badge>
        }
      />

      {/* Ore selector + config */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {ORE_TYPES.map(ore => (
          <button
            key={ore.name}
            onClick={() => { setSelectedOre(ore); setGemPrices({}); setOrePrice(undefined) }}
            className={cn(
              'text-left p-4 rounded-xl border-2 transition-all duration-200',
              selectedOre.name === ore.name
                ? 'border-wow-gold bg-wow-gold/8 shadow-[0_0_16px_rgba(212,175,55,0.15)]'
                : 'border-wow-border bg-wow-surface hover:border-wow-gold/30'
            )}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">⛏️</span>
              <div>
                <p className={cn('font-bold', selectedOre.name === ore.name ? 'text-wow-gold' : 'text-white')}>
                  {ore.name}
                </p>
                <p className={cn('text-xs', ore.quality === 'uncommon' ? 'text-emerald-400' : 'text-slate-400')}>
                  Qualité {ore.quality}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Prix défaut: <span className="text-wow-gold font-mono">{ore.defaultPrice}g</span>
              {' · '}{ore.orePerProspect} ore/prospect
            </p>
            <p className="text-xs text-slate-500 mt-1">{ore.gems.length} gemmes possibles</p>
          </button>
        ))}

        <Card className="flex flex-col gap-4">
          <CardHeader>
            <CardTitle icon="⚙️">Configuration</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Nombre de prospects</label>
              <input
                type="number"
                value={numProspects}
                min={1}
                onChange={e => setNumProspects(parseInt(e.target.value) || 1)}
                className="w-full bg-wow-bg border border-wow-border rounded-lg px-3 py-2 text-sm text-white focus:border-wow-gold/50 focus:outline-none"
              />
              <p className="text-[10px] text-slate-600 mt-1">
                = {result.oreUsed} {selectedOre.name} utilisées
              </p>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">
                Prix ore personnalisé (g) — défaut: {selectedOre.defaultPrice}g
              </label>
              <input
                type="number"
                value={orePrice ?? ''}
                placeholder={String(selectedOre.defaultPrice)}
                onChange={e => setOrePrice(parseFloat(e.target.value) || undefined)}
                className="w-full bg-wow-bg border border-wow-border rounded-lg px-3 py-2 text-sm text-wow-gold font-mono focus:border-wow-gold/50 focus:outline-none"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Coût total', value: formatGold(result.oreCost), icon: '💰', color: 'text-red-400' },
          { label: 'Valeur totale', value: formatGold(result.totalValue), icon: '📦', color: 'text-blue-400' },
          { label: 'Profit', value: `${profitIcon} ${formatGold(Math.abs(result.profit))}`, icon: '📈', color: profitColor },
          { label: 'ROI', value: `${result.profitPercent >= 0 ? '+' : ''}${result.profitPercent.toFixed(1)}%`, icon: '🎯', color: result.profitPercent >= 0 ? 'text-emerald-400' : 'text-red-400' },
        ].map(s => (
          <Card key={s.label} className="text-center py-4">
            <p className="text-xl mb-1">{s.icon}</p>
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className={cn('text-lg font-bold font-mono', s.color)}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Gem breakdown */}
      <Card>
        <CardHeader>
          <CardTitle icon="💎">Détail des gemmes — {numProspects} prospects</CardTitle>
          <p className="text-xs text-slate-500 mt-1">
            Taux ~25% Resourcefulness inclus · Source: 2000 prospections réelles
          </p>
        </CardHeader>
        <div className="space-y-2 mt-4">
          {result.results.map((r, i) => (
            <GemRow
              key={r.gemName + i}
              gemName={r.gemName}
              quality={r.quality}
              dropRate={r.dropRate}
              expectedCount={r.expectedCount}
              priceEach={r.priceEach}
              totalValue={r.totalValue}
              onPriceChange={v => handleGemPrice(r.gemName, v)}
            />
          ))}
        </div>

        {/* Total row */}
        <div className="mt-4 pt-4 border-t border-wow-border flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">Bilan final</p>
            <p className="text-xs text-slate-500">
              {result.oreUsed} ores · {(orePrice ?? selectedOre.defaultPrice)}g/ore
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 mb-0.5">
              Coût: <span className="text-red-400 font-mono">{formatGold(result.oreCost)}</span>
              {' → '}
              Valeur: <span className="text-blue-400 font-mono">{formatGold(result.totalValue)}</span>
            </p>
            <p className={cn('text-xl font-bold font-mono', profitColor)}>
              {profitIcon} {formatGold(Math.abs(result.profit))} ({result.profitPercent.toFixed(1)}%)
            </p>
          </div>
        </div>
      </Card>

      {/* Info box */}
      <div className="mt-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
        <p className="text-xs text-blue-300 font-medium mb-1">💡 Conseils de prospection</p>
        <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
          <li>Prospecter par lots de 400+ pour fiabiliser les moyennes statistiques</li>
          <li>L'Eversong Diamond (épique) a un faible taux mais une valeur élevée — il impacte fortement le ROI</li>
          <li>Le Crystalline Glass (17-18% drop) peut constituer une source de revenu secondaire non négligeable</li>
          <li>~25% Resourcefulness est déjà pris en compte dans les taux ci-dessus</li>
        </ul>
      </div>
    </PageWrapper>
  )
}
