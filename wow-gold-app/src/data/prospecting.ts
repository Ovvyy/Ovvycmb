/**
 * Données de Prospection WoW Midnight v12.0.1
 * Source: Sheet communautaire — données collectées en jeu
 * Toutes les valeurs sont confirmées par prospection réelle.
 *
 * Note: ~25% Resourcefulness pris en compte dans les taux.
 * Prospecter par grands lots (400+ prospects) pour fiabiliser les moyennes.
 */

export interface ProspectingGem {
  name: string
  quality: 'common' | 'uncommon' | 'rare' | 'epic'
  dropRate: number    // % par prospect (ex: 2.39 = 2.39%)
  defaultPrice: number // prix en or (selon sheet)
}

export interface OreType {
  name: string
  quality: 'common' | 'uncommon'
  /** Quantité d'ore requis par prospect (toujours 5 en WoW) */
  orePerProspect: number
  defaultPrice: number // prix en or
  gems: ProspectingGem[]
}

/** Données Umbral Tin Ore — source: 2000 prospections réelles */
const UMBRAL_TIN_GEMS: ProspectingGem[] = [
  { name: 'Harandar Peridot',   quality: 'uncommon', dropRate: 2.39,  defaultPrice: 1550  },
  { name: 'Flawless Peridot',   quality: 'rare',     dropRate: 2.16,  defaultPrice: 1645  },
  { name: 'Tenebrous Amethyst', quality: 'uncommon', dropRate: 2.60,  defaultPrice: 1619  },
  { name: 'Flawless Amethyst',  quality: 'rare',     dropRate: 2.34,  defaultPrice: 2598  },
  { name: 'Crystalline Glass',  quality: 'uncommon', dropRate: 17.83, defaultPrice: 475   },
  { name: 'Duskshrouded Stone', quality: 'common',   dropRate: 22.21, defaultPrice: 2     },
  { name: 'Eversong Diamond',   quality: 'epic',     dropRate: 1.16,  defaultPrice: 1749  },
]

/** Données Brilliant Silver Ore — source: 2000 prospections réelles */
const BRILLIANT_SILVER_GEMS: ProspectingGem[] = [
  { name: 'Sanguine Garnet',    quality: 'uncommon', dropRate: 2.37,  defaultPrice: 1602  },
  { name: 'Flawless Garnet',    quality: 'rare',     dropRate: 2.47,  defaultPrice: 1850  },
  { name: 'Amani Lapis',        quality: 'uncommon', dropRate: 2.60,  defaultPrice: 1582  },
  { name: 'Flawless Lapis',     quality: 'rare',     dropRate: 2.72,  defaultPrice: 1648  },
  { name: 'Crystalline Glass',  quality: 'uncommon', dropRate: 16.14, defaultPrice: 475   },
  { name: 'Duskshrouded Stone', quality: 'common',   dropRate: 24.72, defaultPrice: 2     },
  { name: 'Eversong Diamond',   quality: 'epic',     dropRate: 1.12,  defaultPrice: 1749  },
]

export const ORE_TYPES: OreType[] = [
  {
    name: 'Umbral Tin Ore',
    quality: 'common',
    orePerProspect: 5,
    defaultPrice: 275,
    gems: UMBRAL_TIN_GEMS,
  },
  {
    name: 'Brilliant Silver Ore',
    quality: 'uncommon',
    orePerProspect: 5,
    defaultPrice: 258,
    gems: BRILLIANT_SILVER_GEMS,
  },
]

/**
 * Calcule la valeur attendue de X prospects d'un type d'ore
 * @param oreType Type d'ore
 * @param prospects Nombre de prospects
 * @param gemPrices Prix custom des gems (en or)
 * @param orePriceOverride Prix de l'ore custom (en or)
 */
export interface ProspectResult {
  gemName: string
  quality: string
  dropRate: number
  expectedCount: number
  priceEach: number
  totalValue: number
}

export interface ProspectingCalcResult {
  oreUsed: number
  oreCost: number
  results: ProspectResult[]
  totalValue: number
  profit: number
  profitPercent: number
}

export function calcProspecting(
  oreType: OreType,
  numProspects: number,
  gemPriceOverrides: Partial<Record<string, number>> = {},
  orePriceOverride?: number,
): ProspectingCalcResult {
  const oreUsed = numProspects * oreType.orePerProspect
  const orePrice = orePriceOverride ?? oreType.defaultPrice
  const oreCost = oreUsed * orePrice

  const results: ProspectResult[] = oreType.gems.map(gem => {
    const priceEach = gemPriceOverrides[gem.name] ?? gem.defaultPrice
    const expectedCount = Math.floor((gem.dropRate / 100) * numProspects)
    const totalValue = expectedCount * priceEach
    return {
      gemName: gem.name,
      quality: gem.quality,
      dropRate: gem.dropRate,
      expectedCount,
      priceEach,
      totalValue,
    }
  })

  const totalValue = results.reduce((s, r) => s + r.totalValue, 0)
  const profit = totalValue - oreCost
  const profitPercent = oreCost > 0 ? (profit / oreCost) * 100 : 0

  return { oreUsed, oreCost, results, totalValue, profit, profitPercent }
}
