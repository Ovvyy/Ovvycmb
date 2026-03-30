/**
 * Knowledge Points & Moxie — WoW Midnight v12.0.1
 * Source: Sheet communautaire — données vérifiées en jeu
 *
 * Moxie = monnaie de profession Midnight (équivalent Artisan Moxie dans TWW)
 * KP = Knowledge Points (points de connaissance)
 *
 * Note: Abandonner une profession = perte de tout progrès et recettes
 * (sauf les spécialisations DF/TWW/Midnight)
 *
 * Factions Midnight:
 * - Silvermoon Court (Renown)
 * - The Singularity (Renown, faction void)
 * - Amani Tribe (Renown, Zul'Aman)
 * - Hara'ti (Renown, Harandar)
 */

export type ProfessionKP =
  | 'Alchemy' | 'Blacksmithing' | 'Enchanting' | 'Engineering'
  | 'Inscription' | 'Jewelcrafting' | 'Leatherworking' | 'Tailoring'
  | 'Herbalism' | 'Mining' | 'Skinning'

export interface WeeklyKPSource {
  source: string
  kpAmount: number | [number, number]  // fixe ou [min, max]
  notes?: string
}

export interface ProfessionKPData {
  profession: ProfessionKP
  type: 'crafting' | 'gathering'
  /** KP hebdomadaires hors patron orders */
  weeklyKPBase: number
  /** Total avec patron orders */
  weeklyKPWithPatrons: [number, number] | number
  sources: WeeklyKPSource[]
  /** First-craft KP: +5 Moxie */
  firstCraftPlus5: number
  /** First-craft KP: +10 Moxie */
  firstCraftPlus10: number
  /** First-craft KP: +15 Moxie */
  firstCraftPlus15: number
  totalFirstCraftKP: number
  totalMoxieFromFirstCraft: number
  notes?: string
  guideUrl: string
}

export const PROFESSION_KP: ProfessionKPData[] = [
  {
    profession: 'Alchemy',
    type: 'crafting',
    weeklyKPBase: 7,
    weeklyKPWithPatrons: [22, 27],
    sources: [
      { source: 'Patron Crafting Orders',        kpAmount: [15, 20], notes: 'Certains donnent ×1 KP, d\'autres ×2 KP' },
      { source: 'Crafting Order ou Trainer Quest',kpAmount: 2 },
      { source: 'Treasure Drops',                kpAmount: 4 },
      { source: 'Treatise',                      kpAmount: 1 },
    ],
    firstCraftPlus5: 0,
    firstCraftPlus10: 11,
    firstCraftPlus15: 0,
    totalFirstCraftKP: 11,
    totalMoxieFromFirstCraft: 110,
    guideUrl: 'https://www.wowhead.com/guide/midnight/professions/alchemy-leveling-1-100',
  },
  {
    profession: 'Blacksmithing',
    type: 'crafting',
    weeklyKPBase: 7,
    weeklyKPWithPatrons: [22, 27],
    sources: [
      { source: 'Patron Crafting Orders',        kpAmount: [15, 20] },
      { source: 'Crafting Order ou Trainer Quest',kpAmount: 2 },
      { source: 'Treasure Drops',                kpAmount: 4 },
      { source: 'Treatise',                      kpAmount: 1 },
    ],
    firstCraftPlus5: 0,
    firstCraftPlus10: 31,
    firstCraftPlus15: 0,
    totalFirstCraftKP: 31,
    totalMoxieFromFirstCraft: 310,
    guideUrl: 'https://www.wowhead.com/guide/midnight/professions/blacksmithing-leveling-1-100',
  },
  {
    profession: 'Enchanting',
    type: 'crafting',
    weeklyKPBase: 17,
    weeklyKPWithPatrons: 17,  // Pas de patron orders pour Enchanting
    sources: [
      { source: 'Trainer Quests',     kpAmount: 3, notes: 'Certains nécessitent niveau 25, d\'autres niveau 1' },
      { source: 'Treasure Drops',     kpAmount: 4 },
      { source: 'Treatise',           kpAmount: 1 },
      { source: 'Disenchanting KP',   kpAmount: 9, notes: 'Source principale de KP pour Enchanting' },
    ],
    firstCraftPlus5: 38,
    firstCraftPlus10: 3,
    firstCraftPlus15: 1,
    totalFirstCraftKP: 42,
    totalMoxieFromFirstCraft: 235,
    notes: 'Pas de Patron Orders. Le Disenchanting est la source de catchup KP.',
    guideUrl: 'https://www.wowhead.com/guide/midnight/professions/enchanting-leveling-1-100',
  },
  {
    profession: 'Engineering',
    type: 'crafting',
    weeklyKPBase: 7,
    weeklyKPWithPatrons: [21, 26],
    sources: [
      { source: 'Patron Crafting Orders',        kpAmount: [15, 20] },
      { source: 'Crafting Order ou Trainer Quest',kpAmount: 2 },
      { source: 'Treasure Drops',                kpAmount: 4 },
      { source: 'Treatise',                      kpAmount: 1 },
    ],
    firstCraftPlus5: 0,
    firstCraftPlus10: 26,
    firstCraftPlus15: 0,
    totalFirstCraftKP: 26,
    totalMoxieFromFirstCraft: 260,
    guideUrl: 'https://www.wowhead.com/guide/midnight/professions/inscription-leveling-1-100',
  },
  {
    profession: 'Inscription',
    type: 'crafting',
    weeklyKPBase: 8,
    weeklyKPWithPatrons: [23, 28],
    sources: [
      { source: 'Patron Crafting Orders',        kpAmount: [15, 20] },
      { source: 'Crafting Order ou Trainer Quest',kpAmount: 2 },
      { source: 'Treasure Drops',                kpAmount: 4 },
      { source: 'Treatise',                      kpAmount: 2, notes: '2 KP si spécialisé "Calm Hands"' },
    ],
    firstCraftPlus5: 0,
    firstCraftPlus10: 18,
    firstCraftPlus15: 0,
    totalFirstCraftKP: 18,
    totalMoxieFromFirstCraft: 180,
    notes: 'Treatise donne 2 KP (au lieu de 1) si spécialisé dans "Calm Hands".',
    guideUrl: 'https://www.wowhead.com/guide/midnight/professions/inscription-leveling-1-100',
  },
  {
    profession: 'Jewelcrafting',
    type: 'crafting',
    weeklyKPBase: 7,
    weeklyKPWithPatrons: [22, 27],
    sources: [
      { source: 'Patron Crafting Orders',        kpAmount: [15, 20] },
      { source: 'Crafting Order ou Trainer Quest',kpAmount: 2 },
      { source: 'Treasure Drops',                kpAmount: 4 },
      { source: 'Treatise',                      kpAmount: 1 },
    ],
    firstCraftPlus5: 0,
    firstCraftPlus10: 30,
    firstCraftPlus15: 0,
    totalFirstCraftKP: 30,
    totalMoxieFromFirstCraft: 300,
    guideUrl: 'https://www.wowhead.com/guide/midnight/professions/jewelcrafting-leveling-1-100',
  },
  {
    profession: 'Leatherworking',
    type: 'crafting',
    weeklyKPBase: 7,
    weeklyKPWithPatrons: [22, 27],
    sources: [
      { source: 'Patron Crafting Orders',        kpAmount: [15, 20] },
      { source: 'Crafting Order ou Trainer Quest',kpAmount: 2 },
      { source: 'Treasure Drops',                kpAmount: 4 },
      { source: 'Treatise',                      kpAmount: 1 },
    ],
    firstCraftPlus5: 14,
    firstCraftPlus10: 16,
    firstCraftPlus15: 0,
    totalFirstCraftKP: 30,
    totalMoxieFromFirstCraft: 230,
    guideUrl: 'https://www.wowhead.com/guide/midnight/professions/leatherworking-leveling-1-100',
  },
  {
    profession: 'Tailoring',
    type: 'crafting',
    weeklyKPBase: 7,
    weeklyKPWithPatrons: [22, 27],
    sources: [
      { source: 'Patron Crafting Orders',        kpAmount: [15, 20] },
      { source: 'Crafting Order ou Trainer Quest',kpAmount: 2 },
      { source: 'Treasure Drops',                kpAmount: 4 },
      { source: 'Treatise',                      kpAmount: 1 },
    ],
    firstCraftPlus5: 0,
    firstCraftPlus10: 29,
    firstCraftPlus15: 0,
    totalFirstCraftKP: 29,
    totalMoxieFromFirstCraft: 290,
    guideUrl: 'https://www.wowhead.com/guide/midnight/professions/tailoring-leveling-1-100',
  },
  // ── Collecteurs ─────────────────────────────────────────────────────────────
  {
    profession: 'Herbalism',
    type: 'gathering',
    weeklyKPBase: 12,
    weeklyKPWithPatrons: 12,
    sources: [
      { source: 'Trainer Quest', kpAmount: 3 },
      { source: 'Treatise',      kpAmount: 1 },
      { source: 'Gathered KP',   kpAmount: 8, notes: 'KP de rattrapage via cueillette' },
    ],
    firstCraftPlus5: 0, firstCraftPlus10: 0, firstCraftPlus15: 0,
    totalFirstCraftKP: 0, totalMoxieFromFirstCraft: 0,
    guideUrl: 'https://www.wowhead.com/guide/midnight/professions/alchemy-leveling-1-100',
  },
  {
    profession: 'Mining',
    type: 'gathering',
    weeklyKPBase: 12,
    weeklyKPWithPatrons: 12,
    sources: [
      { source: 'Trainer Quest', kpAmount: 3 },
      { source: 'Treatise',      kpAmount: 1 },
      { source: 'Gathered KP',   kpAmount: 8, notes: 'KP de rattrapage via minage' },
    ],
    firstCraftPlus5: 0, firstCraftPlus10: 0, firstCraftPlus15: 0,
    totalFirstCraftKP: 0, totalMoxieFromFirstCraft: 0,
    guideUrl: 'https://www.wowhead.com/guide/midnight/professions/alchemy-leveling-1-100',
  },
  {
    profession: 'Skinning',
    type: 'gathering',
    weeklyKPBase: 12,
    weeklyKPWithPatrons: 12,
    sources: [
      { source: 'Trainer Quest', kpAmount: 3 },
      { source: 'Treatise',      kpAmount: 1 },
      { source: 'Gathered KP',   kpAmount: 8, notes: 'KP de rattrapage via dépeçage' },
    ],
    firstCraftPlus5: 0, firstCraftPlus10: 0, firstCraftPlus15: 0,
    totalFirstCraftKP: 0, totalMoxieFromFirstCraft: 0,
    guideUrl: 'https://www.wowhead.com/guide/midnight/professions/alchemy-leveling-1-100',
  },
]

/** Bonus raciaux confirmés depuis la sheet */
export const RACIAL_BONUSES = [
  { race: 'Blood Elf',          bonus: 'Enchanting +5',                   idealProfession: 'Enchanting',    note: '' },
  { race: 'Goblin',             bonus: 'Alchemy +5 + Réductions vendeurs (Exalté)', idealProfession: 'Alchemy', note: '' },
  { race: 'Highmountain Tauren',bonus: 'Mining +5 + Deftness +25%',       idealProfession: 'Mining',        note: '' },
  { race: 'Nightborne',         bonus: 'Inscription +5',                  idealProfession: 'Inscription',   note: '' },
  { race: 'Tauren',             bonus: 'Herbalism +5 + Deftness +25%',    idealProfession: 'Herbalism',     note: '' },
  { race: 'Earthen',            bonus: 'Finesse +2%',                     idealProfession: 'Collecte',      note: '' },
  { race: 'Pandaren',           bonus: 'Cooking +5',                      idealProfession: 'Cooking',       note: '' },
  { race: 'Dark Iron Dwarf',    bonus: 'Blacksmithing +5 + Forge (+10% vitesse)', idealProfession: 'Blacksmithing', note: '' },
  { race: 'Draenei',            bonus: 'Jewelcrafting +5',                idealProfession: 'Jewelcrafting', note: '' },
  { race: 'Kul Tiran',          bonus: 'Toutes professions +2',           idealProfession: 'Toutes',        note: '' },
  { race: 'Gnome',              bonus: 'Engineering +5',                  idealProfession: 'Engineering',   note: '' },
  { race: 'Lightforged Draenei',bonus: 'Blacksmithing +5 + Forge',        idealProfession: 'Blacksmithing', note: '' },
  { race: 'Worgen',             bonus: 'Skinning +5 + Deftness +25%',     idealProfession: 'Skinning',      note: '' },
  { race: 'Dracthyr',           bonus: 'Perception +2%',                  idealProfession: 'Collecte',      note: '' },
  { race: 'Haranir',            bonus: 'Herbalism +5 + Finesse +10',      idealProfession: 'Herbalism',     note: '★ Nouveau dans Midnight' },
]
