import { useState } from 'react'
import { PageWrapper, Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge, QualityBadge } from '@/components/ui/Badge'
import { GoldDisplay } from '@/components/ui/GoldDisplay'
import { PROFESSIONS } from '@/data/professions'
import { TOP_CRAFTING_RECIPES } from '@/data/professions'
import { formatGold, afterAHCut, calcROI } from '@/utils/gold'
import type { ProfessionName, CraftingRecipe } from '@/types'

// Simulated market prices for reagents
const REAGENT_PRICES: Record<number, number> = {
  191305: 650,    // Hochenblume
  191307: 890,    // Bubble Poppy
  191303: 540,    // Saxifrage
  191309: 420,    // Writhebark
  194755: 1200,   // Serevite Ore
  194756: 2800,   // Draconium Ore
  192848: 3500,   // Sendinite
  194127: 8500,   // Vibrant Shard
  194128: 35000,  // Resonant Crystal
  194866: 1800,   // Burnished Ink
  194867: 3200,   // Blazing Ink
  193057: 180,    // Windswept Thatch
  193059: 9800,   // Vibrant Wildercloth Bolt
}

const OUTPUT_PRICES: Record<number, number> = {
  191333: 65000,  // Flask of Supreme Power
  191329: 72000,  // Phial of Tepid Versatility
  200058: 85000,  // Enchant Weapon - Sophic Devotion
  198462: 420000, // DMF Card: Keefer's Skyreach
  192837: 9800,   // Sendinite: Crushing
  198333: 48000,  // Stonewarden's Pouch
}

function calculateRecipe(recipe: CraftingRecipe): CraftingRecipe {
  const reagentCost = recipe.reagents.reduce((sum, r) => {
    const price = REAGENT_PRICES[r.itemId] ?? 0
    return sum + price * r.quantity
  }, 0)

  const marketValue = OUTPUT_PRICES[recipe.outputItemId] ?? 0
  const sellRevenue = afterAHCut(marketValue * recipe.produces)
  const profit = sellRevenue - reagentCost
  const margin = calcROI(reagentCost, sellRevenue)

  return {
    ...recipe,
    reagents: recipe.reagents.map((r) => ({
      ...r,
      unitPrice: REAGENT_PRICES[r.itemId] ?? 0,
      totalPrice: (REAGENT_PRICES[r.itemId] ?? 0) * r.quantity,
    })),
    craftingCost: reagentCost,
    marketValue,
    profit,
    profitMargin: margin,
  }
}

const CALCULATED_RECIPES = TOP_CRAFTING_RECIPES.map(calculateRecipe)

function RecipeCard({ recipe, onSelect, selected }: { recipe: CraftingRecipe; onSelect: () => void; selected: boolean }) {
  const profit = recipe.profit ?? 0
  const margin = recipe.profitMargin ?? 0
  const isProfit = profit > 0

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 ${
        selected
          ? 'border-wow-gold/50 bg-wow-gold/5'
          : 'border-wow-border bg-wow-card hover:border-wow-gold/30 hover:bg-wow-gold/3'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-white truncate">{recipe.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="blue">{recipe.profession}</Badge>
            <QualityBadge quality={recipe.outputItemQuality} />
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className={`text-base font-bold font-mono ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
            {isProfit ? '+' : ''}{formatGold(profit, true)}
          </div>
          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${isProfit ? 'badge-profit' : 'badge-loss'}`}>
            {margin.toFixed(0)}% ROI
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-slate-500">Coût réactifs</span>
          <p className="text-slate-300 font-mono">{formatGold(recipe.craftingCost ?? 0)}</p>
        </div>
        <div>
          <span className="text-slate-500">Prix marché</span>
          <p className="text-wow-gold font-mono">{formatGold(recipe.marketValue ?? 0)}</p>
        </div>
      </div>
    </div>
  )
}

export function CraftingCalculator() {
  const [selectedProfession, setSelectedProfession] = useState<ProfessionName | 'all'>('all')
  const [selectedRecipe, setSelectedRecipe] = useState<CraftingRecipe | null>(null)
  const [customPrices, setCustomPrices] = useState<Record<number, number>>({})
  const [craftCount, setCraftCount] = useState(10)

  const professionRecipes = CALCULATED_RECIPES.filter(
    (r) => selectedProfession === 'all' || r.profession === selectedProfession
  ).sort((a, b) => (b.profit ?? 0) - (a.profit ?? 0))

  const effectivePrices = { ...REAGENT_PRICES, ...customPrices }

  const recalcWithCustom = (recipe: CraftingRecipe): CraftingRecipe => {
    const reagentCost = recipe.reagents.reduce((sum, r) => {
      const price = effectivePrices[r.itemId] ?? 0
      return sum + price * r.quantity
    }, 0)
    const marketValue = OUTPUT_PRICES[recipe.outputItemId] ?? 0
    const sellRevenue = afterAHCut(marketValue * recipe.produces)
    const profit = sellRevenue - reagentCost
    const margin = calcROI(reagentCost, sellRevenue)
    return { ...recipe, craftingCost: reagentCost, marketValue, profit, profitMargin: margin }
  }

  const detailRecipe = selectedRecipe ? recalcWithCustom(selectedRecipe) : null

  return (
    <PageWrapper>
      <Header
        title="Calculateur de Craft"
        subtitle="Calculez les marges de profit pour chaque recette de chaque profession"
      />

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Left panel */}
        <div className="flex-1 min-w-0">
          {/* Profession filter */}
          <Card className="mb-4 p-3">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedProfession === 'all' ? 'gold' : 'ghost'}
                size="sm"
                onClick={() => setSelectedProfession('all')}
              >
                🌟 Toutes
              </Button>
              {PROFESSIONS.filter((p) => p.type === 'crafting').map((p) => (
                <Button
                  key={p.name}
                  variant={selectedProfession === p.name ? 'gold' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedProfession(p.name)}
                >
                  {p.icon} {p.name}
                </Button>
              ))}
            </div>
          </Card>

          {/* Recipe cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {professionRecipes.length === 0 ? (
              <div className="col-span-2 text-center py-12 text-slate-500">
                Aucune recette pour cette profession dans la base de données
              </div>
            ) : (
              professionRecipes.map((r) => (
                <RecipeCard
                  key={r.id}
                  recipe={r}
                  selected={selectedRecipe?.id === r.id}
                  onSelect={() => setSelectedRecipe(r)}
                />
              ))
            )}
          </div>
        </div>

        {/* Right panel: recipe detail */}
        <div className="w-full xl:w-96 flex-shrink-0">
          {detailRecipe ? (
            <div className="space-y-4 sticky top-6">
              <Card>
                <CardHeader>
                  <CardTitle>{detailRecipe.name}</CardTitle>
                  <button onClick={() => setSelectedRecipe(null)} className="text-slate-600 hover:text-slate-300 text-sm">✕</button>
                </CardHeader>

                <div className="flex gap-2 mb-4">
                  <Badge variant="blue">{detailRecipe.profession}</Badge>
                  <QualityBadge quality={detailRecipe.outputItemQuality} />
                  <Badge variant="neutral">Niveau {detailRecipe.skillRequired}</Badge>
                </div>

                {/* Craft count */}
                <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-wow-surface border border-wow-border">
                  <span className="text-sm text-slate-400">Quantité à crafter:</span>
                  <div className="flex items-center gap-2 ml-auto">
                    <Button size="sm" variant="ghost" onClick={() => setCraftCount(Math.max(1, craftCount - 1))}>-</Button>
                    <span className="w-8 text-center font-mono text-wow-gold font-bold">{craftCount}</span>
                    <Button size="sm" variant="ghost" onClick={() => setCraftCount(craftCount + 1)}>+</Button>
                  </div>
                </div>

                {/* Reagents */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Réactifs nécessaires ×{craftCount}</p>
                  <div className="space-y-2">
                    {detailRecipe.reagents.map((r) => (
                      <div key={r.itemId} className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded bg-wow-surface border border-wow-border flex items-center justify-center text-xs text-slate-500 flex-shrink-0">
                          📦
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-300 truncate">{r.name}</p>
                          <p className="text-xs text-slate-600">×{r.quantity * craftCount}</p>
                        </div>
                        <div className="text-right">
                          <Input
                            type="number"
                            value={customPrices[r.itemId] ?? r.unitPrice ?? 0}
                            onChange={(e) => setCustomPrices((prev) => ({
                              ...prev,
                              [r.itemId]: Number(e.target.value),
                            }))}
                            className="w-24 text-xs text-right py-1 px-2 h-7"
                            suffix="c"
                          />
                          <p className="text-[10px] text-slate-600 mt-0.5">
                            Total: {formatGold((customPrices[r.itemId] ?? r.unitPrice ?? 0) * r.quantity * craftCount, true)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="rounded-lg bg-wow-surface border border-wow-border p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Coût total réactifs</span>
                    <GoldDisplay copper={(detailRecipe.craftingCost ?? 0) * craftCount} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Prix marché ×{craftCount}</span>
                    <GoldDisplay copper={(detailRecipe.marketValue ?? 0) * craftCount} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Après coupe AH (5%)</span>
                    <GoldDisplay copper={afterAHCut((detailRecipe.marketValue ?? 0) * craftCount)} />
                  </div>
                  <div className="border-t border-wow-border/50 pt-2 flex justify-between">
                    <span className="font-semibold text-white">Profit net ×{craftCount}</span>
                    <span className={`font-bold font-mono text-lg ${
                      (detailRecipe.profit ?? 0) > 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {(detailRecipe.profit ?? 0) > 0 ? '+' : ''}
                      {formatGold((detailRecipe.profit ?? 0) * craftCount, true)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">ROI</span>
                    <Badge variant={(detailRecipe.profitMargin ?? 0) > 0 ? 'profit' : 'loss'}>
                      {(detailRecipe.profitMargin ?? 0).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Recommendation */}
              <Card className={`border-${(detailRecipe.profit ?? 0) > 0 ? 'emerald-500/20 bg-emerald-500/5' : 'red-500/20 bg-red-500/5'}`}>
                <p className="text-xs font-semibold mb-2" style={{ color: (detailRecipe.profit ?? 0) > 0 ? '#00e676' : '#ff4757' }}>
                  {(detailRecipe.profit ?? 0) > 0 ? '✅ Recommandé' : '⚠️ Pas rentable actuellement'}
                </p>
                <p className="text-xs text-slate-400">
                  {(detailRecipe.profit ?? 0) > 0
                    ? `Ce craft génère ${formatGold((detailRecipe.profit ?? 0) * craftCount, true)} de profit pour ${craftCount} crafts. Postez avant les soirs de raid pour maximiser les ventes.`
                    : 'Les prix des réactifs sont trop élevés. Attendez une baisse des herbes/matériaux ou ajustez votre prix de vente cible.'}
                </p>
              </Card>
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center py-16 text-center">
              <span className="text-4xl mb-3">⚒️</span>
              <p className="text-sm text-slate-500">Sélectionnez une recette pour calculer les marges</p>
            </Card>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
