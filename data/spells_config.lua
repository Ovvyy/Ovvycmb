-- ============================================
-- CONFIGURATION DES SORTS CRA & ENUTROF
-- ============================================

SPELLS_CRA = {
    {
        id = 13066,
        name = "Tirs Perçants",
        name_en = "Piercing Shots",
        element = "neutral",
        apCost = 3,
        minRange = 0,
        maxRange = 0,
        baseDamage = 0,
        isBuff = true,
        buffType = "penetration",
        buffValue = 999,
        target = "self",
        duration = 3,
        canCrit = false,
        isAoE = false,
        needsLoS = false,
        priority = 1,
        description = "Boost pénétration massif"
    },
    {
        id = 13058,
        name = "Tirs Éloignés",
        name_en = "Distant Shots",
        element = "neutral",
        apCost = 3,
        minRange = 0,
        maxRange = 0,
        baseDamage = 0,
        isBuff = true,
        buffType = "range",
        buffValue = 7,
        target = "area",
        areaType = "circle",
        areaRange = 3,
        duration = 3,
        canCrit = false,
        isAoE = true,
        needsLoS = false,
        priority = 2,
        description = "+7 PO zone"
    },
    {
        id = 13086,
        name = "Flèche Fulminante",
        name_en = "Fulminating Arrow",
        element = "fire",
        apCost = 4,
        minRange = 1,
        maxRange = 6,
        baseDamage = 46,
        canCrit = true,
        isAoE = true,
        areaType = "rebound",
        needsLoS = true,
        hasRebounds = true,
        reboundBonus = 10,
        priority = 3,
        description = "46 + (10 par rebond)"
    },
    {
        id = 13077,
        name = "Flèche Assaillante",
        name_en = "Assailing Arrow",
        element = "fire",
        apCost = 4,
        minRange = 2,
        maxRange = 10,
        baseDamage = 42,
        canCrit = true,
        isAoE = true,
        areaType = "cross",
        areaRange = 1,
        needsLoS = true,
        hasBuff = true,
        buffType = "power",
        buffValue = 50,
        selfBuff = true,
        priority = 4,
        description = "AoE croix + boost +50 puissance"
    },
    {
        id = 13075,
        name = "Flèche Écrasante",
        name_en = "Crushing Arrow",
        element = "fire",
        apCost = 3,
        minRange = 3,
        maxRange = 11,
        baseDamage = 41,
        canCrit = true,
        isAoE = true,
        areaType = "circle",
        areaRange = 1,
        needsLoS = true,
        hasLifeSteal = true,
        healPercent = 100,
        hasDebuff = true,
        debuffType = "pesanteur",
        revealsInvisible = true,
        priority = 5,
        description = "Vol de vie 100% + AoE"
    },
    {
        id = 13072,
        name = "Tir Répulsif",
        name_en = "Repulsive Shot",
        element = "fire",
        apCost = 3,
        minRange = 1,
        maxRange = 10,
        baseDamage = 38,
        canCrit = true,
        isAoE = true,
        areaType = "line",
        needsLoS = true,
        lineOnly = true,
        hasPush = true,
        pushDistance = 1,
        pushType = "line_only",
        pushAdjacent = true,
        priority = 6,
        description = "Ligne + repousse adjacent 1 case"
    },
    {
        id = 13085,
        name = "Flèche Détonante",
        name_en = "Exploding Arrow",
        element = "fire",
        apCost = 2,
        minRange = 1,
        maxRange = 11,
        baseDamage = 21,
        canCrit = true,
        isAoE = false,
        needsLoS = true,
        hasLifeSteal = true,
        healPercent = 100,
        priority = 7,
        description = "2 PA + vol de vie"
    },
    {
        id = 13078,
        name = "Flèche du Jugement",
        name_en = "Arrow of Judgement",
        element = "earth",
        apCost = 3,
        minRange = 1,
        maxRange = 13,
        baseDamage = 18,
        canCrit = true,
        isAoE = false,
        needsLoS = true,
        hasDynamicDamage = true,
        dynamicFormula = "18 + (42 * PM_restants_pourcent)",
        dynamicMaxBonus = 42,
        priority = 8,
        description = "18 + (42 * %PM restants)"
    },
    {
        id = 13069,
        name = "Flèche Cinglante",
        name_en = "Lashing Arrow",
        element = "earth",
        apCost = 3,
        minRange = 1,
        maxRange = 12,
        baseDamage = 35,
        canCrit = true,
        isAoE = false,
        needsLoS = true,
        hasPush = true,
        pushDistance = 2,
        priority = 9,
        description = "Single target + repousse 2"
    },
    {
        id = 13059,
        name = "Pluie de Flèches",
        name_en = "Raining Arrows",
        element = "air",
        apCost = 3,
        minRange = 0,
        maxRange = 11,
        baseDamage = 32,
        canCrit = true,
        isAoE = true,
        areaType = "circle",
        areaRange = 2,
        needsLoS = true,
        priority = 10,
        description = "AoE cercle rayon 2"
    },
    {
        id = 13068,
        name = "Flèche de Concentration",
        name_en = "Concentration Arrow",
        element = "air",
        apCost = 3,
        minRange = 2,
        maxRange = 12,
        baseDamage = 31,
        canCrit = true,
        isAoE = true,
        areaType = "cross",
        areaRange = 3,
        needsLoS = true,
        hasPull = true,
        pullType = "perpendicular_cross",
        priority = 11,
        description = "AoE croix + attire perpendiculaires"
    },
    {
        id = 13055,
        name = "Tir de Recul",
        name_en = "Retreating Shot",
        element = "air",
        apCost = 3,
        minRange = 1,
        maxRange = 12,
        baseDamage = 34,
        canCrit = true,
        isAoE = false,
        needsLoS = true,
        lineOnly = true,
        diagonalOnly = true,
        hasPush = true,
        pushDistance = 4,
        pushType = "diagonal_or_line",
        priority = 12,
        description = "Diagonal/Ligne + repousse 4"
    },
}

SPELLS_ENUTROF = {
    {
        id = 0,
        name = "Cupidité",
        element = "neutral",
        apCost = 2,
        minRange = 0,
        maxRange = 0,
        baseDamage = 0,
        isBuff = true,
        buffType = "intelligence",
        buffValue = 200,
        target = "team",
        duration = 3,
        canCrit = false,
        isAoE = false,
        needsLoS = false,
        priority = 1,
        description = "+200 INT équipe"
    },
    {
        id = 0,
        name = "Pelle Repousse",
        element = "water",
        apCost = 4,
        minRange = 1,
        maxRange = 8,
        baseDamage = 0,
        canCrit = true,
        isAoE = false,
        needsLoS = true,
        removesMP = 3,
        hasPush = true,
        pushDistance = 1,
        priority = 2,
        description = "Retire 3 PM + repousse"
    },
    {
        id = 0,
        name = "Sac Animé",
        element = "neutral",
        apCost = 3,
        minRange = 0,
        maxRange = 0,
        baseDamage = 0,
        isSummon = true,
        summonType = "tank",
        summonHP = 0,
        canCrit = false,
        isAoE = false,
        needsLoS = false,
        priority = 3,
        description = "Invocation tank"
    },
}

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

function getSpellByName(spellList, name)
    for _, spell in ipairs(spellList) do
        if spell.name == name or spell.name_en == name then
            return spell
        end
    end
    return nil
end

function getSpellById(spellList, id)
    for _, spell in ipairs(spellList) do
        if spell.id == id then
            return spell
        end
    end
    return nil
end

function getSortsByPriority(spellList, excludeBuffs)
    excludeBuffs = excludeBuffs or false
    local sorts = {}
    
    for _, spell in ipairs(spellList) do
        if not excludeBuffs or (not spell.isBuff and not spell.isSummon) then
            table.insert(sorts, spell)
        end
    end
    
    table.sort(sorts, function(a, b)
        return (a.priority or 99) < (b.priority or 99)
    end)
    
    return sorts
end

function getBuffSpells(spellList)
    local buffs = {}
    
    for _, spell in ipairs(spellList) do
        if spell.isBuff then
            table.insert(buffs, spell)
        end
    end
    
    table.sort(buffs, function(a, b)
        return (a.priority or 99) < (b.priority or 99)
    end)
    
    return buffs
end

function getDPSSpells(spellList)
    local dps = {}
    
    for _, spell in ipairs(spellList) do
        if not spell.isBuff and not spell.isSummon and spell.baseDamage > 0 then
            table.insert(dps, spell)
        end
    end
    
    return dps
end

function getLifeStealSpells(spellList)
    local lifesteal = {}
    
    for _, spell in ipairs(spellList) do
        if spell.hasLifeSteal then
            table.insert(lifesteal, spell)
        end
    end
    
    return lifesteal
end

function validerSortsConfig()
    if not console or not console.print then return true end
    
    console.print("[SPELLS] === VALIDATION ===")
    
    local countCra = #SPELLS_CRA
    console.print("[SPELLS] Sorts Cra: " .. countCra)
    
    local buffs = 0
    local dps = 0
    
    for _, spell in ipairs(SPELLS_CRA) do
        if spell.isBuff then
            buffs = buffs + 1
        elseif not spell.isSummon then
            dps = dps + 1
        end
    end
    
    console.print("[SPELLS]   Buffs: " .. buffs .. " | DPS: " .. dps)
    
    local countEnu = #SPELLS_ENUTROF
    console.print("[SPELLS] Sorts Enutrof: " .. countEnu)
    
    console.print("[SPELLS] ✅ Validation OK")
    return true
end