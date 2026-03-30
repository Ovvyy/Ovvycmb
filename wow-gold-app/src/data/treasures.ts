/**
 * Trésors de Profession — WoW Midnight v12.0.1
 * Source: Sheet communautaire — coordonnées vérifiées en jeu
 *
 * Zones Midnight: Eversong, Harandar, Silvermoon, Voidstorm, Zul'Aman
 * Chaque trésor donne des Knowledge Points (KP) pour la profession associée.
 *
 * Commande: /way <Zone> <X> <Y> <Nom>
 */

export type TreasureZone = 'Eversong' | 'Harandar' | 'Silvermoon' | 'Voidstorm' | "Zul'Aman" | 'Unknown'
export type TreasureProfession =
  | 'Alchemy' | 'Blacksmithing' | 'Enchanting' | 'Engineering' | 'Herbalism'
  | 'Inscription' | 'Jewelcrafting' | 'Leatherworking' | 'Mining' | 'Skinning' | 'Tailoring'

export interface Treasure {
  id: string
  profession: TreasureProfession
  name: string
  zone: TreasureZone
  x: number
  y: number
  wayCommand: string  // commande /way directe
  notes?: string
}

let _id = 1
const mkId = () => String(_id++)

export const TREASURES: Treasure[] = [
  // ── Alchemy ────────────────────────────────────────────────────────────────
  { id: mkId(), profession: 'Alchemy', name: 'Vial of Rootlands Oddities',  zone: 'Harandar',  x: 34.75, y: 24.75, wayCommand: '/way Harandar 34.75 24.75 Vial of Rootlands Oddities' },
  { id: mkId(), profession: 'Alchemy', name: 'Freshly Plucked Peacebloom',  zone: 'Silvermoon', x: 49.05, y: 75.65, wayCommand: '/way Silvermoon 49.05 75.65 Freshly Plucked Peacebloom' },
  { id: mkId(), profession: 'Alchemy', name: 'Pristine Potion',             zone: 'Silvermoon', x: 47.79, y: 51.60, wayCommand: '/way Silvermoon 47.79 51.60 Pristine Potion' },
  { id: mkId(), profession: 'Alchemy', name: 'Vial of Eversong Oddities',   zone: 'Unknown',    x: 0,     y: 0,     wayCommand: '/way Inconnu', notes: 'Coordonnées non confirmées' },
  { id: mkId(), profession: 'Alchemy', name: 'Vial of Voidstorm Oddities',  zone: 'Voidstorm',  x: 41.79, y: 40.49, wayCommand: '/way Voidstorm 41.79 40.49 Vial of Voidstorm Oddities' },
  { id: mkId(), profession: 'Alchemy', name: 'Failed Experiment',           zone: 'Voidstorm',  x: 32.82, y: 43.26, wayCommand: "/way Voidstorm 32.82 43.26 Failed Experiment" },
  { id: mkId(), profession: 'Alchemy', name: "Vial of Zul'Aman Oddities",   zone: "Zul'Aman",   x: 41.79, y: 40.49, wayCommand: "/way Zul'Aman 41.79 40.49 Vial of Zul'Aman Oddities" },
  { id: mkId(), profession: 'Alchemy', name: 'Measured Ladle',              zone: "Zul'Aman",   x: 49.14, y: 23.10, wayCommand: "/way Zul'Aman 49.14 23.10 Measured Ladle" },

  // ── Blacksmithing ──────────────────────────────────────────────────────────
  { id: mkId(), profession: 'Blacksmithing', name: 'Metalworking Cheat Sheet',     zone: 'Eversong',   x: 56.81, y: 40.74, wayCommand: '/way Eversong 56.81 40.74 Metalworking Cheat Sheet' },
  { id: mkId(), profession: 'Blacksmithing', name: 'Silvermoon Smithing Kit',      zone: 'Eversong',   x: 48.34, y: 75.74, wayCommand: '/way Eversong 48.34 75.74 Silvermoon Smithing Kit' },
  { id: mkId(), profession: 'Blacksmithing', name: "Rutaani Floratender's Sword",  zone: 'Harandar',   x: 66.29, y: 50.84, wayCommand: '/way Harandar 66.29 50.84 Rutaani Floratender\'s Sword' },
  { id: mkId(), profession: 'Blacksmithing', name: "Sin'dorei Master's Forgemace", zone: 'Silvermoon', x: 49.25, y: 61.34, wayCommand: "/way Silvermoon 49.25 61.34 Sin'dorei Master's Forgemace" },
  { id: mkId(), profession: 'Blacksmithing', name: "Silvermoon Blacksmith's Hammer",zone:'Silvermoon', x: 48.53, y: 74.82, wayCommand: "/way Silvermoon 48.53 74.82 Silvermoon Blacksmith's Hammer" },
  { id: mkId(), profession: 'Blacksmithing', name: 'Deconstructed Forge Techniques',zone:'Silvermoon', x: 26.90, y: 60.34, wayCommand: '/way Silvermoon 26.90 60.34 Deconstructed Forge Techniques' },
  { id: mkId(), profession: 'Blacksmithing', name: 'Voidstorm Defense Spear',      zone: 'Voidstorm',  x: 30.63, y: 68.93, wayCommand: '/way Voidstorm 30.63 68.93 Voidstorm Defense Spear' },
  { id: mkId(), profession: 'Blacksmithing', name: 'Carefully Racked Spear',       zone: "Zul'Aman",   x: 33.19, y: 65.79, wayCommand: "/way Zul'Aman 33.19 65.79 Carefully Racked Spear", notes: 'Western Zul\'Aman' },

  // ── Enchanting ─────────────────────────────────────────────────────────────
  { id: mkId(), profession: 'Enchanting', name: 'Enchanted Amani Mask',    zone: "Zul'Aman",   x: 49.05, y: 22.65, wayCommand: "/way Zul'Aman 49.05 22.65 Enchanted Amani Mask", notes: 'Western Zul\'Aman' },
  { id: mkId(), profession: 'Enchanting', name: "Sin'dorei Enchanting Rod",zone: 'Eversong',   x: 63.43, y: 32.60, wayCommand: "/way Eversong 63.43 32.60 Sin'dorei Enchanting Rod" },
  { id: mkId(), profession: 'Enchanting', name: 'Everblazing Sunmote',    zone: 'Eversong',   x: 60.78, y: 53.10, wayCommand: '/way Eversong 60.78 53.10 Everblazing Sunmote' },
  { id: mkId(), profession: 'Enchanting', name: 'Entropic Shard',         zone: 'Harandar',   x: 37.69, y: 65.32, wayCommand: '/way Harandar 37.69 65.32 Entropic Shard' },
  { id: mkId(), profession: 'Enchanting', name: 'Primal Essence Orb',     zone: 'Harandar',   x: 65.77, y: 50.18, wayCommand: '/way Harandar 65.77 50.18 Primal Essence Orb' },
  { id: mkId(), profession: 'Enchanting', name: 'Enchanted Sunfire Silk', zone: 'Unknown',    x: 0,     y: 0,     wayCommand: '/way Inconnu', notes: 'Coordonnées non confirmées' },
  { id: mkId(), profession: 'Enchanting', name: 'Pure Void Crystal',      zone: 'Voidstorm',  x: 35.49, y: 58.82, wayCommand: '/way Voidstorm 35.49 58.82 Pure Void Crystal' },
  { id: mkId(), profession: 'Enchanting', name: 'Loa-Blessed Dust',       zone: "Zul'Aman",   x: 40.35, y: 51.16, wayCommand: "/way Zul'Aman 40.35 51.16 Loa-Blessed Dust" },

  // ── Engineering ────────────────────────────────────────────────────────────
  { id: mkId(), profession: 'Engineering', name: 'Manual of Mistakes and Mishaps', zone: 'Eversong',  x: 39.52, y: 45.81, wayCommand: '/way Eversong 39.52 45.81 Manual of Mistakes and Mishaps' },
  { id: mkId(), profession: 'Engineering', name: 'Expeditious Pylon',              zone: 'Harandar',  x: 67.92, y: 49.83, wayCommand: '/way Harandar 67.92 49.83 Expeditious Pylon' },
  { id: mkId(), profession: 'Engineering', name: 'What To Do When Nothing Works',  zone: 'Silvermoon',x: 51.17, y: 57.13, wayCommand: '/way Silvermoon 51.17 57.13 What To Do When Nothing Works' },
  { id: mkId(), profession: 'Engineering', name: "One Engineer's Junk",            zone: 'Silvermoon',x: 51.36, y: 74.63, wayCommand: "/way Silvermoon 51.36 74.63 One Engineer's Junk" },
  { id: mkId(), profession: 'Engineering', name: 'Ethereal Stormwrench',           zone: 'Voidstorm', x: 54.03, y: 51.03, wayCommand: '/way Voidstorm 54.03 51.03 Ethereal Stormwrench' },
  { id: mkId(), profession: 'Engineering', name: 'Miniaturized Transport Skiff',   zone: 'Voidstorm', x: 28.95, y: 39.23, wayCommand: '/way Voidstorm 28.95 39.23 Miniaturized Transport Skiff' },
  { id: mkId(), profession: 'Engineering', name: 'Offline Helper Bot',             zone: "Zul'Aman",  x: 65.14, y: 34.51, wayCommand: "/way Zul'Aman 65.14 34.51 Offline Helper Bot" },
  { id: mkId(), profession: 'Engineering', name: 'Handy Wrench',                   zone: "Zul'Aman",  x: 34.18, y: 87.86, wayCommand: "/way Zul'Aman 34.18 87.86 Handy Wrench" },

  // ── Herbalism ──────────────────────────────────────────────────────────────
  { id: mkId(), profession: 'Herbalism', name: 'A Spade',              zone: 'Eversong',  x: 64.19, y: 30.41, wayCommand: '/way Eversong 64.19 30.41 A Spade' },
  { id: mkId(), profession: 'Herbalism', name: 'Bloomed Bud',          zone: 'Harandar',  x: 38.17, y: 66.97, wayCommand: '/way Harandar 38.17 66.97 Bloomed Bud' },
  { id: mkId(), profession: 'Herbalism', name: "Harvester's Sickle",   zone: 'Harandar',  x: 76.06, y: 51.10, wayCommand: "/way Harandar 76.06 51.10 Harvester's Sickle", notes: '2 emplacements possibles, ne peut être looté qu\'une fois' },
  { id: mkId(), profession: 'Herbalism', name: 'Lightbloom Root',      zone: 'Harandar',  x: 36.60, y: 25.08, wayCommand: '/way Harandar 36.60 25.08 Lightbloom Root' },
  { id: mkId(), profession: 'Herbalism', name: 'Planting Shovel',      zone: 'Harandar',  x: 51.23, y: 55.65, wayCommand: '/way Harandar 51.23 55.65 Planting Shovel' },
  { id: mkId(), profession: 'Herbalism', name: 'Simple Leaf Pruners',  zone: 'Silvermoon',x: 48.86, y: 75.93, wayCommand: '/way Silvermoon 48.86 75.93 Simple Leaf Pruners' },
  { id: mkId(), profession: 'Herbalism', name: 'Peculiar Lotus',       zone: 'Voidstorm', x: 34.65, y: 57.00, wayCommand: '/way Voidstorm 34.65 57.00 Peculiar Lotus' },
  { id: mkId(), profession: 'Herbalism', name: "Harvester's Sickle",   zone: "Zul'Aman",  x: 41.90, y: 46.03, wayCommand: "/way Zul'Aman 41.90 46.03 Harvester's Sickle", notes: '2 emplacements possibles, ne peut être looté qu\'une fois' },

  // ── Inscription ────────────────────────────────────────────────────────────
  { id: mkId(), profession: 'Inscription', name: "Songwriter's Quill",        zone: 'Eversong',  x: 40.35, y: 61.27, wayCommand: "/way Eversong 40.35 61.27 Songwriter's Quill" },
  { id: mkId(), profession: 'Inscription', name: 'Spare Ink',                 zone: 'Eversong',  x: 48.31, y: 75.61, wayCommand: '/way Eversong 48.31 75.61 Spare Ink' },
  { id: mkId(), profession: 'Inscription', name: "Songwriter's Pen",          zone: 'Silvermoon',x: 47.70, y: 50.30, wayCommand: "/way Silvermoon 47.70 50.30 Songwriter's Pen" },
  { id: mkId(), profession: 'Inscription', name: 'Half-Baked Techniques',     zone: 'Unknown',   x: 0,     y: 0,     wayCommand: '/way Inconnu', notes: 'Coordonnées non confirmées' },
  { id: mkId(), profession: 'Inscription', name: 'Void-Touched Quill',        zone: 'Voidstorm', x: 60.71, y: 84.14, wayCommand: '/way Voidstorm 60.71 84.14 Void-Touched Quill' },
  { id: mkId(), profession: 'Inscription', name: 'Leather-Bound Techniques',  zone: "Zul'Aman",  x: 40.51, y: 49.42, wayCommand: "/way Zul'Aman 40.51 49.42 Leather-Bound Techniques" },
  { id: mkId(), profession: 'Inscription', name: 'Leftover Sanguithorn Pigment',zone:"Zul'Aman",  x: 52.71, y: 50.02, wayCommand: "/way Zul'Aman 52.71 50.02 Leftover Sanguithorn Pigment" },
  { id: mkId(), profession: 'Inscription', name: "Intrepid Explorer's Marker",zone: "Zul'Aman",  x: 52.42, y: 52.55, wayCommand: "/way Zul'Aman 52.42 52.55 Intrepid Explorer's Marker" },

  // ── Jewelcrafting ──────────────────────────────────────────────────────────
  { id: mkId(), profession: 'Jewelcrafting', name: 'Poorly Rounded Vial',         zone: 'Eversong',  x: 56.65, y: 40.86, wayCommand: '/way Eversong 56.65 40.86 Poorly Rounded Vial' },
  { id: mkId(), profession: 'Jewelcrafting', name: "Sin'dorei Gem Faceters",       zone: 'Eversong',  x: 39.67, y: 38.82, wayCommand: "/way Eversong 39.67 38.82 Sin'dorei Gem Faceters" },
  { id: mkId(), profession: 'Jewelcrafting', name: "Sin'dorei Masterwork Chisel",  zone: 'Silvermoon',x: 50.60, y: 56.50, wayCommand: "/way Silvermoon 50.60 56.50 Sin'dorei Masterwork Chisel" },
  { id: mkId(), profession: 'Jewelcrafting', name: 'Vintage Soul Gem',             zone: 'Silvermoon',x: 55.52, y: 47.98, wayCommand: '/way Silvermoon 55.52 47.98 Vintage Soul Gem' },
  { id: mkId(), profession: 'Jewelcrafting', name: 'Dual-Function Magnifiers',     zone: 'Silvermoon',x: 28.61, y: 46.47, wayCommand: '/way Silvermoon 28.61 46.47 Dual-Function Magnifiers' },
  { id: mkId(), profession: 'Jewelcrafting', name: 'Speculative Voidstorm Crystal',zone: 'Voidstorm', x: 30.58, y: 69.03, wayCommand: '/way Voidstorm 30.58 69.03 Speculative Voidstorm Crystal' },
  { id: mkId(), profession: 'Jewelcrafting', name: 'Ethereal Gem Pliers',          zone: 'Voidstorm', x: 54.15, y: 51.18, wayCommand: '/way Voidstorm 54.15 51.18 Ethereal Gem Pliers' },
  { id: mkId(), profession: 'Jewelcrafting', name: 'Shattered Glass',              zone: 'Voidstorm', x: 62.91, y: 53.53, wayCommand: '/way Voidstorm 62.91 53.53 Shattered Glass' },

  // ── Leatherworking ─────────────────────────────────────────────────────────
  { id: mkId(), profession: 'Leatherworking', name: 'Haranir Leatherworking Knife',  zone: 'Harandar',  x: 36.09, y: 25.24, wayCommand: '/way Harandar 36.09 25.24 Haranir Leatherworking Knife' },
  { id: mkId(), profession: 'Leatherworking', name: 'Haranir Leatherworking Mallet', zone: 'Harandar',  x: 51.75, y: 51.28, wayCommand: '/way Harandar 51.75 51.28 Haranir Leatherworking Mallet' },
  { id: mkId(), profession: 'Leatherworking', name: "Artisan's Considered Order",    zone: 'Silvermoon',x: 44.80, y: 56.20, wayCommand: "/way Silvermoon 44.80 56.20 Artisan's Considered Order" },
  { id: mkId(), profession: 'Leatherworking', name: 'Ethereal Leatherworking Knife', zone: 'Voidstorm', x: 34.75, y: 56.91, wayCommand: '/way Voidstorm 34.75 56.91 Ethereal Leatherworking Knife' },
  { id: mkId(), profession: 'Leatherworking', name: 'Pattern: Beyond The Void',      zone: 'Voidstorm', x: 53.84, y: 51.55, wayCommand: '/way Voidstorm 53.84 51.55 Pattern: Beyond The Void' },
  { id: mkId(), profession: 'Leatherworking', name: "Bundle of Tanner's Trinkets",   zone: "Zul'Aman",  x: 45.21, y: 45.28, wayCommand: "/way Zul'Aman 45.21 45.28 Bundle of Tanner's Trinkets" },
  { id: mkId(), profession: 'Leatherworking', name: "Amani Leatherworker's Tool",    zone: "Zul'Aman",  x: 33.12, y: 78.91, wayCommand: "/way Zul'Aman 33.12 78.91 Amani Leatherworker's Tool" },
  { id: mkId(), profession: 'Leatherworking', name: 'Prestigiously Racked Hide',     zone: "Zul'Aman",  x: 30.76, y: 84.06, wayCommand: "/way Zul'Aman 30.76 84.06 Prestigiously Racked Hide" },

  // ── Mining ─────────────────────────────────────────────────────────────────
  { id: mkId(), profession: 'Mining', name: 'Solid Ore Punchers',       zone: 'Eversong',  x: 37.96, y: 45.35, wayCommand: '/way Eversong 37.96 45.35 Solid Ore Punchers' },
  { id: mkId(), profession: 'Mining', name: 'Spare Expedition Torch',   zone: 'Harandar',  x: 38.79, y: 65.89, wayCommand: '/way Harandar 38.79 65.89 Spare Expedition Torch' },
  { id: mkId(), profession: 'Mining', name: 'Glimmering Void Pearl',    zone: 'Voidstorm', x: 28.73, y: 38.56, wayCommand: '/way Voidstorm 28.73 38.56 Glimmering Void Pearl', notes: 'Slayer\'s Rise, Voidstorm' },
  { id: mkId(), profession: 'Mining', name: 'Lost Voidstorm Satchel',   zone: 'Voidstorm', x: 54.24, y: 51.59, wayCommand: '/way Voidstorm 54.24 51.59 Lost Voidstorm Satchel', notes: 'Slayer\'s Rise, Voidstorm' },
  { id: mkId(), profession: 'Mining', name: 'Miner\'s Guide to Voidstorm',zone:'Voidstorm', x: 30.00, y: 69.00, wayCommand: '/way Voidstorm 30.00 69.00 Miner\'s Guide to Voidstorm', notes: 'Slayer\'s Rise, Voidstorm' },
  { id: mkId(), profession: 'Mining', name: 'Star Metal Deposit',       zone: 'Voidstorm', x: 41.80, y: 38.25, wayCommand: '/way Voidstorm 41.80 38.25 Star Metal Deposit' },
  { id: mkId(), profession: 'Mining', name: "Amani Expert's Chisel",    zone: "Zul'Aman",  x: 33.62, y: 65.74, wayCommand: "/way Zul'Aman 33.62 65.74 Amani Expert's Chisel" },
  { id: mkId(), profession: 'Mining', name: "Spelunker's Lucky Charm",  zone: "Zul'Aman",  x: 41.99, y: 46.51, wayCommand: "/way Zul'Aman 41.99 46.51 Spelunker's Lucky Charm" },

  // ── Skinning ───────────────────────────────────────────────────────────────
  { id: mkId(), profession: 'Skinning', name: 'Thalassian Skinning Knife',    zone: 'Eversong',  x: 48.44, y: 76.31, wayCommand: '/way Eversong 48.44 76.31 Thalassian Skinning Knife' },
  { id: mkId(), profession: 'Skinning', name: 'Primal Hide',                  zone: 'Harandar',  x: 69.53, y: 49.24, wayCommand: '/way Harandar 69.53 49.24 Primal Hide' },
  { id: mkId(), profession: 'Skinning', name: 'Lightbloom Afflicted Hide',    zone: 'Harandar',  x: 76.03, y: 51.11, wayCommand: '/way Harandar 76.03 51.11 Lightbloom Afflicted Hide' },
  { id: mkId(), profession: 'Skinning', name: "Sind'dorei Tanning Oil",       zone: 'Silvermoon',x: 43.23, y: 55.68, wayCommand: "/way Silvermoon 43.23 55.68 Sind'dorei Tanning Oil" },
  { id: mkId(), profession: 'Skinning', name: 'Voidstorm Leather Sample',     zone: 'Voidstorm', x: 45.65, y: 42.17, wayCommand: '/way Voidstorm 45.65 42.17 Voidstorm Leather Sample' },
  { id: mkId(), profession: 'Skinning', name: 'Cadre Skinning Knife',         zone: "Zul'Aman",  x: 45.13, y: 45.10, wayCommand: "/way Zul'Aman 45.13 45.10 Cadre Skinning Knife", notes: 'N\'apparaît qu\'après avoir complété la campagne Amani' },
  { id: mkId(), profession: 'Skinning', name: 'Amani Skinning Knife',         zone: "Zul'Aman",  x: 33.10, y: 79.01, wayCommand: "/way Zul'Aman 33.10 79.01 Amani Skinning Knife" },
  { id: mkId(), profession: 'Skinning', name: 'Amani Tanning Oil',            zone: "Zul'Aman",  x: 40.41, y: 36.03, wayCommand: "/way Zul'Aman 40.41 36.03 Amani Tanning Oil" },

  // ── Tailoring ──────────────────────────────────────────────────────────────
  { id: mkId(), profession: 'Tailoring', name: "Sin'dorei Outfiter's Ruler",      zone: 'Eversong',  x: 46.30, y: 34.80, wayCommand: "/way Eversong 46.30 34.80 Sin'dorei Outfiter's Ruler" },
  { id: mkId(), profession: 'Tailoring', name: "A Child's Stuffy",               zone: 'Harandar',  x: 70.53, y: 50.84, wayCommand: "/way Harandar 70.53 50.84 A Child's Stuffy" },
  { id: mkId(), profession: 'Tailoring', name: 'Wooden Weaving Sword',           zone: 'Harandar',  x: 69.79, y: 50.98, wayCommand: '/way Harandar 69.79 50.98 Wooden Weaving Sword' },
  { id: mkId(), profession: 'Tailoring', name: 'A Really Nice Curtain',          zone: 'Silvermoon',x: 35.80, y: 61.23, wayCommand: '/way Silvermoon 35.80 61.23 A Really Nice Curtain' },
  { id: mkId(), profession: 'Tailoring', name: 'Particularly Enchanted Tablecloth',zone:'Silvermoon',x: 31.69, y: 68.18, wayCommand: '/way Silvermoon 31.69 68.18 Particularly Enchanted Tablecloth' },
  { id: mkId(), profession: 'Tailoring', name: 'Book of Sin\'dorei Stitches',    zone: 'Voidstorm', x: 61.94, y: 83.67, wayCommand: "/way Voidstorm 61.94 83.67 Book of Sin'dorei Stitches" },
  { id: mkId(), profession: 'Tailoring', name: 'Satin Throw Pillow',             zone: 'Voidstorm', x: 61.42, y: 85.00, wayCommand: '/way Voidstorm 61.42 85.00 Satin Throw Pillow' },
  { id: mkId(), profession: 'Tailoring', name: "Artisan's Cover Comb",           zone: "Zul'Aman",  x: 40.40, y: 49.40, wayCommand: "/way Zul'Aman 40.40 49.40 Artisan's Cover Comb" },
]

export const TREASURE_PROFESSIONS = [
  'Alchemy', 'Blacksmithing', 'Enchanting', 'Engineering', 'Herbalism',
  'Inscription', 'Jewelcrafting', 'Leatherworking', 'Mining', 'Skinning', 'Tailoring',
] as const

export const TREASURE_ZONES: TreasureZone[] = ['Eversong', 'Harandar', 'Silvermoon', 'Voidstorm', "Zul'Aman", 'Unknown']

export function getTreasuresByProfession(profession: TreasureProfession) {
  return TREASURES.filter(t => t.profession === profession)
}

export function getTreasuresByZone(zone: TreasureZone) {
  return TREASURES.filter(t => t.zone === zone)
}
