/**
 * Équipement de Profession BiS — WoW Midnight v12.0.1
 * Source: Sheet communautaire — confirmé en jeu
 *
 * Couleur de la colonne = profession qui craft l'item.
 * Ces items améliorent les stats de crafting (Skill, Inspiration, Resourcefulness, etc.)
 */

export interface ProfessionBiS {
  profession: string
  professionIcon: string
  tool: ProfEquipItem
  accessory1: ProfEquipItem
  accessory2: ProfEquipItem
}

export interface ProfEquipItem {
  name: string
  slot: 'tool' | 'accessory'
  craftedBy?: string  // profession qui craft cet item (si différent de la profession)
}

export const PROFESSION_BIS: ProfessionBiS[] = [
  {
    profession: 'Enchanting',
    professionIcon: '✨',
    tool:        { name: 'Runed Dazzling Thorium Rod',            slot: 'tool',      craftedBy: 'Enchanting' },
    accessory1:  { name: "Thalassian Enchanter's Bonnet",         slot: 'accessory', craftedBy: 'Tailoring' },
    accessory2:  { name: 'Attuned Thalassian Rune-Prism',         slot: 'accessory', craftedBy: 'Jewelcrafting' },
  },
  {
    profession: 'Tailoring',
    professionIcon: '🧵',
    tool:        { name: "Self-Sharpening Sin'dorei Snippers",    slot: 'tool',      craftedBy: 'Tailoring' },
    accessory1:  { name: 'Sunforged Needle Set',                  slot: 'accessory', craftedBy: 'Blacksmithing' },
    accessory2:  { name: "Thalassian Tailor's Threads",           slot: 'accessory', craftedBy: 'Tailoring' },
  },
  {
    profession: 'Alchemy',
    professionIcon: '⚗️',
    tool:        { name: "Super Sin'dorei Alchemist's Mixing Rod",slot: 'tool',      craftedBy: 'Alchemy' },
    accessory1:  { name: 'Thalassian Alchemy Coveralls',          slot: 'accessory', craftedBy: 'Tailoring' },
    accessory2:  { name: "Thalassian Alchemist's Mixcap",         slot: 'accessory', craftedBy: 'Tailoring' },
  },
  {
    profession: 'Inscription',
    professionIcon: '📜',
    tool:        { name: "Super Sin'dorei Quill",                 slot: 'tool',      craftedBy: 'Inscription' },
    accessory1:  { name: "Thalassian Scribe's Crystalline Lens",  slot: 'accessory', craftedBy: 'Jewelcrafting' },
    accessory2:  { name: 'Flawless Text Scrutinizers',            slot: 'accessory', craftedBy: 'Engineering' },
  },
  {
    profession: 'Jewelcrafting',
    professionIcon: '💎',
    tool:        { name: 'Giga-Gem Grippers',                     slot: 'tool',      craftedBy: 'Jewelcrafting' },
    accessory1:  { name: 'Mage-Eye Precision Loupes',             slot: 'accessory', craftedBy: 'Engineering' },
    accessory2:  { name: "Thalassian Gemshaper's Grand Cover",    slot: 'accessory', craftedBy: 'Tailoring' },
  },
  {
    profession: 'Blacksmithing',
    professionIcon: '⚒️',
    tool:        { name: "Sunforged Blacksmith's Hammer",         slot: 'tool',      craftedBy: 'Blacksmithing' },
    accessory1:  { name: "Sunforged Blacksmith's Toolbox",        slot: 'accessory', craftedBy: 'Blacksmithing' },
    accessory2:  { name: "Thalassian Ironbender's Regalia",       slot: 'accessory', craftedBy: 'Tailoring' },
  },
  {
    profession: 'Leatherworking',
    professionIcon: '🥩',
    tool:        { name: "Sunforged Leatherworker's Knife",       slot: 'tool',      craftedBy: 'Blacksmithing' },
    accessory1:  { name: "Sunforged Leatherworker's Toolset",     slot: 'accessory', craftedBy: 'Blacksmithing' },
    accessory2:  { name: "Thalassian Hideshaper's Regalia",       slot: 'accessory', craftedBy: 'Tailoring' },
  },
  {
    profession: 'Engineering',
    professionIcon: '⚙️',
    tool:        { name: "Turbo-Junker's Multitool v9",           slot: 'tool',      craftedBy: 'Engineering' },
    accessory1:  { name: 'Head-Mounted Beam Bummer',              slot: 'accessory', craftedBy: 'Engineering' },
    accessory2:  { name: "Thalassian Scrapmaster's Gauntlets",    slot: 'accessory', craftedBy: 'Tailoring' },
  },
  {
    profession: 'Mining',
    professionIcon: '⛏️',
    tool:        { name: 'Sunforged Pickaxe',                     slot: 'tool',      craftedBy: 'Blacksmithing' },
    accessory1:  { name: "Rock Bonkin' Hardhat",                  slot: 'accessory', craftedBy: 'Engineering' },
    accessory2:  { name: 'Heavy-Duty Rock Assister',              slot: 'accessory', craftedBy: 'Engineering' },
  },
  {
    profession: 'Skinning',
    professionIcon: '🔪',
    tool:        { name: 'Sunforged Skinning Knife',              slot: 'tool',      craftedBy: 'Blacksmithing' },
    accessory1:  { name: "Thalassian Wildseeker's Workbag",       slot: 'accessory', craftedBy: 'Leatherworking' },
    accessory2:  { name: "Thalassian Wildseeker's Stridercap",    slot: 'accessory', craftedBy: 'Leatherworking' },
  },
  {
    profession: 'Herbalism',
    professionIcon: '🌿',
    tool:        { name: 'Sunforged Sickle',                      slot: 'tool',      craftedBy: 'Blacksmithing' },
    accessory1:  { name: "Thalassian Herbalist's Cowl",           slot: 'accessory', craftedBy: 'Tailoring' },
    accessory2:  { name: "Thalassian Herbtender's Cradle",        slot: 'accessory', craftedBy: 'Tailoring' },
  },
  {
    profession: 'Fishing',
    professionIcon: '🎣',
    tool:        { name: "Sin'dorei Reeler's Rod",               slot: 'tool',      craftedBy: 'Engineering' },
    accessory1:  { name: "Elegant Artisan's Fishing Hat",         slot: 'accessory', craftedBy: 'Tailoring' },
    accessory2:  { name: '-',                                     slot: 'accessory' },
  },
  {
    profession: 'Cooking',
    professionIcon: '🍳',
    tool:        { name: "Super Sin'dorei Rolling Pin",           slot: 'tool',      craftedBy: 'Inscription' },
    accessory1:  { name: "Thalassian Chef's Chapeau",             slot: 'accessory', craftedBy: 'Tailoring' },
    accessory2:  { name: '-',                                     slot: 'accessory' },
  },
]
