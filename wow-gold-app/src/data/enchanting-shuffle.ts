/**
 * Enchanting Shuffle — WoW Midnight v12.0.1
 * Source: Sheet communautaire — données collectées en jeu
 *
 * Principe: Craft Evercore → Désenchanter → Radiant Shards + matériaux bonus
 *
 * Note: Resourcefulness NON pris en compte dans ces taux.
 * Les taux ci-dessous sont par craft/DE individuel sur 1000 items.
 *
 * Deux modes de craft:
 * - Mode A (93 = 75+18): 75 crafts de base + 18 procs resourcefulness
 * - Mode B (140 = 100+40): 100 crafts de base + 40 procs resourcefulness
 */

export interface DEMaterial {
  name: string
  rank: 'R1' | 'R2'
  /** Taux de drop par 1000 désenchantements (ex: 511 = 51.11%) */
  ratePerThousand: number
  defaultPrice: number // en or
}

export interface ShuffleBatch {
  label: string
  /** Nombre d'items craftés (base + procs resourcefulness) */
  craftsBase: number
  craftsFromProcs: number
  totalCrafts: number
}

export const SHUFFLE_BATCHES: ShuffleBatch[] = [
  { label: 'Mode A (75+18)', craftsBase: 75,  craftsFromProcs: 18, totalCrafts: 93  },
  { label: 'Mode B (100+40)', craftsBase: 100, craftsFromProcs: 40, totalCrafts: 140 },
]

/** Matériaux issus du désenchantement d'Evercore — taux sur 1000 DE */
export const DE_MATERIALS_PER_1000: DEMaterial[] = [
  { name: 'Radiant Shard',    rank: 'R1', ratePerThousand: 511, defaultPrice: 8.26  },
  { name: 'Radiant Shard',    rank: 'R2', ratePerThousand: 776, defaultPrice: 10.5  },
  { name: 'Tranquility',      rank: 'R1', ratePerThousand: 72,  defaultPrice: 8     },
  { name: 'Scales',           rank: 'R1', ratePerThousand: 65,  defaultPrice: 21    },
  { name: 'Leather',          rank: 'R1', ratePerThousand: 58,  defaultPrice: 12    },
  { name: 'Linen',            rank: 'R1', ratePerThousand: 61,  defaultPrice: 17    },
  { name: 'Copper',           rank: 'R1', ratePerThousand: 48,  defaultPrice: 42    },
]

/** Vitesse de craft avec bonus 7% crafting speed (depuis sheet) */
export const CRAFTING_SPEED_BONUS_PCT = 7
export const TIME_PER_ITEM_SECONDS = 1.86
export const CRAFTING_TIME_1000_MINUTES = 31   // 0:31:00
export const DISENCHANT_TIME_1000_MINUTES = 33.33  // 0:33:20

export interface ShuffleCalcResult {
  numEvercores: number
  craftCost: number
  materials: Array<{
    name: string
    rank: string
    expected: number
    priceEach: number
    totalValue: number
  }>
  totalValue: number
  profit: number
  profitPercent: number
  craftTimeMinutes: number
  disenchantTimeMinutes: number
  goldPerHour: number
}

export function calcEnchantingShuffle(
  numEvercores: number,
  evercorePrice: number,            // en or
  materialPriceOverrides: Partial<Record<string, number>> = {},
): ShuffleCalcResult {
  const craftCost = numEvercores * evercorePrice

  const materials = DE_MATERIALS_PER_1000.map(mat => {
    const key = `${mat.name}_${mat.rank}`
    const priceEach = materialPriceOverrides[key] ?? mat.defaultPrice
    const expected = Math.floor((mat.ratePerThousand / 1000) * numEvercores)
    const totalValue = expected * priceEach
    return {
      name: mat.name,
      rank: mat.rank,
      expected,
      priceEach,
      totalValue,
    }
  })

  const totalValue = materials.reduce((s, m) => s + m.totalValue, 0)
  const profit = totalValue - craftCost
  const profitPercent = craftCost > 0 ? (profit / craftCost) * 100 : 0

  const craftTimeMinutes = (numEvercores / 1000) * CRAFTING_TIME_1000_MINUTES
  const disenchantTimeMinutes = (numEvercores / 1000) * DISENCHANT_TIME_1000_MINUTES
  const totalHours = (craftTimeMinutes + disenchantTimeMinutes) / 60
  const goldPerHour = totalHours > 0 ? profit / totalHours : 0

  return {
    numEvercores,
    craftCost,
    materials,
    totalValue,
    profit,
    profitPercent,
    craftTimeMinutes,
    disenchantTimeMinutes,
    goldPerHour,
  }
}
