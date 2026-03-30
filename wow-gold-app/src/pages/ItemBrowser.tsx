import { useState } from 'react'
import { PageWrapper, Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { QualityBadge } from '@/components/ui/Badge'
import { GoldDisplay } from '@/components/ui/GoldDisplay'
import { PriceChart } from '@/components/charts/PriceChart'
import { TRACKED_ITEMS, generateMockPriceHistory, wowheadUrl } from '@/data/items'
import { formatGold, afterAHCut } from '@/utils/gold'
import { useSettingsStore } from '@/store/settingsStore'
import type { WowItem } from '@/types'

interface ItemWithPrice extends WowItem {
  marketValue: number
  minBuyout: number
  historical: number
  quantity: number
  change24h: number
}

function generateMockItemPrices(items: WowItem[]): ItemWithPrice[] {
  const prices: Record<number, { base: number; volatility: number }> = {
    191305: { base: 650,   volatility: 0.2 },
    191307: { base: 890,   volatility: 0.25 },
    191303: { base: 540,   volatility: 0.18 },
    191309: { base: 420,   volatility: 0.15 },
    194755: { base: 1200,  volatility: 0.1 },
    194756: { base: 2800,  volatility: 0.12 },
    192848: { base: 3500,  volatility: 0.3 },
    192850: { base: 48000, volatility: 0.2 },
    192852: { base: 52000, volatility: 0.22 },
    192854: { base: 45000, volatility: 0.2 },
    194127: { base: 8500,  volatility: 0.15 },
    194128: { base: 35000, volatility: 0.18 },
    194129: { base: 2200,  volatility: 0.12 },
    191329: { base: 72000, volatility: 0.08 },
    191333: { base: 65000, volatility: 0.1 },
    193057: { base: 180,   volatility: 0.2 },
    193059: { base: 9800,  volatility: 0.15 },
    193053: { base: 2400,  volatility: 0.15 },
    193055: { base: 6800,  volatility: 0.18 },
  }

  return items.map((item) => {
    const p = prices[item.id] ?? { base: 1000, volatility: 0.2 }
    const base = p.base
    const mv = base * (1 + (Math.random() - 0.5) * p.volatility)
    const min = mv * (0.85 + Math.random() * 0.1)
    const hist = base * (1 + (Math.random() - 0.5) * 0.05)
    const change = (mv - hist) / hist * 100

    return {
      ...item,
      marketValue: Math.round(mv),
      minBuyout: Math.round(min),
      historical: Math.round(hist),
      quantity: Math.floor(Math.random() * 2000) + 100,
      change24h: Math.round(change * 10) / 10,
    }
  })
}

function ItemRow({ item, onClick, selected }: { item: ItemWithPrice; onClick: () => void; selected: boolean }) {
  const isUp = item.change24h > 0
  return (
    <tr
      onClick={onClick}
      className={`cursor-pointer transition-colors ${selected ? 'bg-wow-gold/8' : 'hover:bg-wow-gold/3'}`}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-wow-surface border border-wow-border flex items-center justify-center text-xs text-slate-500">
            📦
          </div>
          <div>
            <a
              href={wowheadUrl(item.id)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-sm font-medium hover:text-wow-gold transition-colors"
              style={{
                color: item.quality === 'rare' ? '#0070dd' :
                       item.quality === 'epic' ? '#a335ee' :
                       item.quality === 'uncommon' ? '#1eff00' :
                       item.quality === 'legendary' ? '#ff8000' : '#ffffff'
              }}
            >
              {item.name}
            </a>
            <p className="text-xs text-slate-600">{item.expansion}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-center">
        <QualityBadge quality={item.quality} />
      </td>
      <td className="px-4 py-3 text-right">
        <span className="font-mono text-sm text-wow-gold">{formatGold(item.marketValue)}</span>
      </td>
      <td className="px-4 py-3 text-right">
        <span className="font-mono text-sm text-slate-300">{formatGold(item.minBuyout)}</span>
      </td>
      <td className="px-4 py-3 text-right">
        <span className={`text-sm font-medium ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
          {isUp ? '▲' : '▼'} {Math.abs(item.change24h)}%
        </span>
      </td>
      <td className="px-4 py-3 text-right text-xs text-slate-500">
        {item.quantity.toLocaleString()}
      </td>
    </tr>
  )
}

export function ItemBrowser() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'change'>('price')
  const [selectedItem, setSelectedItem] = useState<ItemWithPrice | null>(null)
  const [items] = useState<ItemWithPrice[]>(generateMockItemPrices(TRACKED_ITEMS))
  const { settings } = useSettingsStore()

  const CATEGORIES = [
    { id: 'all',         label: 'Tout' },
    { id: 'reagent',     label: 'Réactifs' },
    { id: 'material',    label: 'Matériaux' },
    { id: 'consumable',  label: 'Consommables' },
    { id: 'gem',         label: 'Gemmes' },
    { id: 'enchanting',  label: 'Enchantement' },
  ]

  const filtered = items
    .filter((i) => {
      if (query && !i.name.toLowerCase().includes(query.toLowerCase())) return false
      if (category !== 'all' && i.category !== category) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'price') return b.marketValue - a.marketValue
      if (sortBy === 'change') return b.change24h - a.change24h
      return a.name.localeCompare(b.name)
    })

  const chartData = selectedItem
    ? generateMockPriceHistory(selectedItem.marketValue, 30)
    : []

  return (
    <PageWrapper>
      <Header
        title="Marché & Prix"
        subtitle={`Prix en temps réel sur ${settings.realm} — ${settings.faction}`}
      />

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Left: item list */}
        <div className="flex-1 min-w-0">
          {/* Filters */}
          <Card className="mb-4 p-3">
            <div className="flex flex-wrap items-center gap-3">
              <Input
                placeholder="Rechercher un item..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                icon={<span className="text-xs">🔍</span>}
                className="w-64"
              />
              <div className="flex gap-1 flex-wrap">
                {CATEGORIES.map((c) => (
                  <Button
                    key={c.id}
                    variant={category === c.id ? 'gold' : 'ghost'}
                    size="sm"
                    onClick={() => setCategory(c.id)}
                  >
                    {c.label}
                  </Button>
                ))}
              </div>
              <div className="ml-auto flex gap-1">
                <Button size="sm" variant={sortBy === 'price' ? 'outline' : 'ghost'} onClick={() => setSortBy('price')}>💰 Prix</Button>
                <Button size="sm" variant={sortBy === 'change' ? 'outline' : 'ghost'} onClick={() => setSortBy('change')}>📈 Variation</Button>
                <Button size="sm" variant={sortBy === 'name' ? 'outline' : 'ghost'} onClick={() => setSortBy('name')}>🔤 Nom</Button>
              </div>
            </div>
          </Card>

          {/* Table */}
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="wow-table">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left">Item</th>
                    <th className="px-4 py-3 text-center">Qualité</th>
                    <th className="px-4 py-3 text-right">Valeur marché</th>
                    <th className="px-4 py-3 text-right">Prix min</th>
                    <th className="px-4 py-3 text-right">24h</th>
                    <th className="px-4 py-3 text-right">Qté</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-500">
                        Aucun item trouvé
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item) => (
                      <ItemRow
                        key={item.id}
                        item={item}
                        selected={selectedItem?.id === item.id}
                        onClick={() => setSelectedItem(item)}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right: item detail */}
        <div className="w-full xl:w-80 flex-shrink-0">
          {selectedItem ? (
            <div className="space-y-4 sticky top-6">
              <Card>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <a
                      href={wowheadUrl(selectedItem.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base font-bold hover:underline"
                      style={{
                        color: selectedItem.quality === 'rare' ? '#0070dd' :
                               selectedItem.quality === 'epic' ? '#a335ee' :
                               selectedItem.quality === 'uncommon' ? '#1eff00' :
                               selectedItem.quality === 'legendary' ? '#ff8000' : '#ffffff'
                      }}
                    >
                      {selectedItem.name}
                    </a>
                    <div className="flex items-center gap-2 mt-1">
                      <QualityBadge quality={selectedItem.quality} />
                      <span className="text-xs text-slate-500">{selectedItem.expansion}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-slate-600 hover:text-slate-300 text-sm"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-2 py-3 border-y border-wow-border/50">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Prix marché</span>
                    <GoldDisplay copper={selectedItem.marketValue} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Prix minimum</span>
                    <GoldDisplay copper={selectedItem.minBuyout} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Historique</span>
                    <GoldDisplay copper={selectedItem.historical} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Après coupe AH (5%)</span>
                    <GoldDisplay copper={afterAHCut(selectedItem.marketValue)} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Quantité dispo</span>
                    <span className="text-white">{selectedItem.quantity.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Variation 24h</span>
                    <span className={selectedItem.change24h > 0 ? 'text-emerald-400' : 'text-red-400'}>
                      {selectedItem.change24h > 0 ? '▲' : '▼'} {Math.abs(selectedItem.change24h)}%
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <a
                    href={wowheadUrl(selectedItem.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      📖 Wowhead
                    </Button>
                  </a>
                  <a
                    href={`https://www.wowaudit.com/items/${selectedItem.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      📊 WoWAudit
                    </Button>
                  </a>
                </div>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Historique 30 jours</CardTitle>
                </CardHeader>
                <PriceChart data={chartData} height={180} />
              </Card>

              {/* Crafting tip */}
              {(selectedItem.category === 'reagent' || selectedItem.category === 'material') && (
                <Card className="border-wow-gold/20 bg-wow-gold/5">
                  <p className="text-xs font-semibold text-wow-gold mb-2">💡 Conseil d'arbitrage</p>
                  <p className="text-xs text-slate-400">
                    Comparez le prix d'achat ({formatGold(selectedItem.minBuyout)}) avec le coût de craft des items utilisant cet ingrédient pour identifier les opportunités de profit.
                  </p>
                </Card>
              )}
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center py-16 text-center">
              <span className="text-4xl mb-3">🔍</span>
              <p className="text-sm text-slate-500">Sélectionnez un item pour voir les détails et l'historique des prix</p>
            </Card>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
