-- ============================================
-- IA CRA - Multi-cibles Distance
-- Niveau 200 - Distance optimale 10+ cases
-- OBJECTIF: 0 PA et 0 PM à la fin du tour
-- ============================================

function CRA_AI()
    local moi = currentFighter()
    local tour = currentRound()
    
    log("CRA", "=== TOUR " .. tour .. " ===")
    log("CRA", "PA:" .. moi.AP .. " PM:" .. moi.MP)
    
    -- Analyser santé
    local healthStatus, healthPercent = StatsManager:getHealthStatus(moi)
    log("CRA", "Santé: " .. healthStatus .. " (" .. math.floor(healthPercent * 100) .. "%)")
    
    -- Analyser monstres pour apprentissage
    LearningManager:analyserTousMonstres()
    
    -- MODE SURVIE (< 30% PV)
    if healthStatus == "critical" then
        return executeSurvivalMode()
    end
    
    -- TOUR 1: Buffs PUIS combat
    if tour == 1 then
        return executeTurn1()
    end
    
    -- TOURS 2+: Combat pur
    return executeCombatRotation()
end

-- ============================================
-- MODE SURVIE
-- ============================================

function executeSurvivalMode()
    log("CRA", "🚨 MODE SURVIE ACTIVÉ")
    
    local moi = currentFighter()
    
    -- Boucle jusqu'à 0 PA
    while moi.AP >= 2 do  -- Minimum 2 PA pour Flèche Détonante
        moi = currentFighter()  -- Refresh stats
        
        -- Sorts vol de vie par priorité
        local spellsVolDeVie = {
            getSpellByName(SPELLS_CRA, "Flèche Écrasante"),    -- 3 PA - 41 dégâts
            getSpellByName(SPELLS_CRA, "Flèche Détonante"),    -- 2 PA - 21 dégâts
        }
        
        local spellLance = false
        
        for _, spell in ipairs(spellsVolDeVie) do
            if spell and moi.AP >= spell.apCost then
                -- Trouver meilleure cible
                local target, bestSpell, score = CombatCalculator:findBestTarget({spell}, moi)
                
                if target and score > 0 then
                    log("CRA", "→ Vol de vie: " .. spell.name .. " sur " .. target.name .. " (PA:" .. moi.AP .. ")")
                    
                    if canCastSpell(spell.id, target.cellId) then
                        castSpell(spell.id, target.cellId)
                        StatsManager:onSpellCast(spell, moi)
                        global.sleep(300)
                        spellLance = true
                        break
                    else
                        -- Se rapprocher si possible
                        if moi.MP > 0 then
                            MovementManager:sePositionnerOptimalement(target, spell)
                            moi = currentFighter()
                            
                            if canCastSpell(spell.id, target.cellId) then
                                castSpell(spell.id, target.cellId)
                                StatsManager:onSpellCast(spell, moi)
                                global.sleep(300)
                                spellLance = true
                                break
                            end
                        end
                    end
                end
            end
        end
        
        -- Si aucun sort lancé, sortir de la boucle
        if not spellLance then
            break
        end
    end
    
    -- Utiliser TOUS les PM restants pour fuir
    moi = currentFighter()
    if moi.MP > 0 then
        log("CRA", "→ Fuite avec TOUS les PM (" .. moi.MP .. " PM)")
        MovementManager:retreatToSafety()
    end
    
    moi = currentFighter()
    log("CRA", "Fin survie - PA:" .. moi.AP .. " PM:" .. moi.MP)
    
    finishTurn()
end

-- ============================================
-- TOUR 1: BUFFS PUIS COMBAT COMPLET
-- ============================================

function executeTurn1()
    log("CRA", "🎯 TOUR 1: Buffs PUIS combat jusqu'à 0 PA/PM")
    
    local moi = currentFighter()
    
    -- PHASE 1: BUFFS PRIORITAIRES
    log("CRA", "Phase 1: Buffs")
    
    local buffsPriority = {
        {spell = getSpellByName(SPELLS_CRA, "Tirs Perçants"), priorite = 1},
        {spell = getSpellByName(SPELLS_CRA, "Tirs Éloignés"), priorite = 2},
    }
    
    for _, buffData in ipairs(buffsPriority) do
        moi = currentFighter()
        local buff = buffData.spell
        
        if buff and moi.AP >= buff.apCost then
            -- Vérifier si buff nécessaire
            local shouldCast = true
            
            if buff.name == "Tirs Éloignés" then
                -- Vérifier si manque de portée
                local needsRange = false
                local ennemis = fighters()
                
                for _, ennemi in ipairs(ennemis) do
                    if ennemi.team == enum_Team.Defender then
                        local distance = cellsDistance(moi.cellId, ennemi.cellId)
                        if distance > 12 then  -- Hors portée base
                            needsRange = true
                            break
                        end
                    end
                end
                
                shouldCast = needsRange
            end
            
            if shouldCast then
                if buff.target == "self" or buff.target == "area" then
                    log("CRA", "→ " .. buff.name .. " (PA:" .. moi.AP .. ")")
                    castSpell(buff.id, moi.cellId)
                    StatsManager:onSpellCast(buff, moi)
                    global.sleep(300)
                else
                    log("CRA", "⚠️ Buff " .. buff.name .. " nécessite cible", "DEBUG")
                end
            else
                log("CRA", "Skip " .. buff.name .. " (non nécessaire)")
            end
        end
    end
    
    -- PHASE 2: COMBAT JUSQU'À 0 PA
    log("CRA", "Phase 2: Combat complet")
    moi = currentFighter()
    log("CRA", "PA restants après buffs: " .. moi.AP)
    
    executeCombatUntilEmpty()
    
    -- PHASE 3: UTILISER TOUS LES PM RESTANTS
    moi = currentFighter()
    if moi.MP > 0 then
        log("CRA", "Phase 3: Utilisation PM restants (" .. moi.MP .. " PM)")
        MovementManager:utiliserPMRestants()
    end
    
    moi = currentFighter()
    log("CRA", "FIN TOUR 1 - PA:" .. moi.AP .. " PM:" .. moi.PM, "SUCCESS")
    
    finishTurn()
end

-- ============================================
-- TOURS 2+: COMBAT PUR JUSQU'À 0 PA/PM
-- ============================================

function executeCombatRotation()
    log("CRA", "⚔️ COMBAT: Taper jusqu'à 0 PA/PM")
    
    executeCombatUntilEmpty()
    
    -- Utiliser PM restants
    local moi = currentFighter()
    if moi.MP > 0 then
        log("CRA", "→ Utilisation PM restants (" .. moi.MP .. " PM)")
        MovementManager:utiliserPMRestants()
    end
    
    moi = currentFighter()
    log("CRA", "FIN TOUR - PA:" .. moi.AP .. " PM:" .. moi.MP, "SUCCESS")
    
    finishTurn()
end

-- ============================================
-- COMBAT JUSQU'À 0 PA
-- ============================================

function executeCombatUntilEmpty()
    local moi = currentFighter()
    local paMin = 2  -- PA minimum pour lancer un sort (Flèche Détonante)
    local tentativesMax = 20  -- Sécurité anti-boucle infinie
    local tentatives = 0
    
    log("CRA", "Début combat - PA disponibles: " .. moi.AP)
    
    while moi.AP >= paMin and tentatives < tentativesMax do
        tentatives = tentatives + 1
        moi = currentFighter()  -- Refresh stats
        
        log("CRA", "→ Tentative " .. tentatives .. " (PA:" .. moi.AP .. " PM:" .. moi.MP .. ")", "DEBUG")
        
        -- Trouver meilleure action
        local bestAction = findBestAction()
        
        if not bestAction then
            log("CRA", "Aucune action possible, fin combat")
            break
        end
        
        -- Exécuter action
        local success = executeAction(bestAction)
        
        if not success then
            log("CRA", "Échec action, tentative suivante")
            -- Continuer quand même, peut-être qu'une autre action fonctionnera
        end
        
        global.sleep(200)
    end
    
    moi = currentFighter()
    
    if tentatives >= tentativesMax then
        log("CRA", "⚠️ Limite tentatives atteinte", "ERROR")
    end
    
    log("CRA", "Fin combat - PA restants: " .. moi.AP .. " (tentatives: " .. tentatives .. ")")
end

-- ============================================
-- TROUVER MEILLEURE ACTION
-- ============================================

function findBestAction()
    local moi = currentFighter()
    local ennemis = fighters()
    
    -- Filtrer sorts disponibles (PA suffisants)
    local sortsDisponibles = {}
    
    for _, spell in ipairs(SPELLS_CRA) do
        if not spell.isBuff and not spell.isSummon and moi.AP >= spell.apCost then
            table.insert(sortsDisponibles, spell)
        end
    end
    
    if #sortsDisponibles == 0 then
        log("CRA", "Aucun sort disponible avec " .. moi.AP .. " PA", "DEBUG")
        return nil
    end
    
    log("CRA", "Sorts disponibles: " .. #sortsDisponibles, "DEBUG")
    
    -- Analyser toutes les combinaisons cible + sort
    local bestAction = nil
    local bestScore = -999
    
    for _, ennemi in ipairs(ennemis) do
        if ennemi.team == enum_Team.Defender then
            for _, spell in ipairs(sortsDisponibles) do
                local score = CombatCalculator:scoreSpell(spell, ennemi, moi)
                
                if score > bestScore then
                    bestScore = score
                    bestAction = {
                        spell = spell,
                        target = ennemi,
                        score = score,
                        type = "attack"
                    }
                end
            end
        end
    end
    
    if bestAction then
        log("CRA", string.format(
            "Meilleure action: %s sur %s (score:%d)",
            bestAction.spell.name,
            bestAction.target.name,
            bestAction.score
        ), "DEBUG")
    end
    
    return bestAction
end

-- ============================================
-- EXÉCUTER ACTION
-- ============================================

function executeAction(action)
    if not action then
        return false
    end
    
    local moi = currentFighter()
    local spell = action.spell
    local target = action.target
    
    log("CRA", "Exécution: " .. spell.name .. " → " .. target.name)
    
    -- Vérifier si on peut lancer directement
    if canCastSpell(spell.id, target.cellId) then
        log("CRA", "  Tir direct possible")
        
        local success = castSpell(spell.id, target.cellId)
        
        if success then
            StatsManager:onSpellCast(spell, moi)
            log("CRA", "  ✓ Sort lancé (PA:" .. currentFighter().AP .. ")")
            return true
        else
            log("CRA", "  ✗ Échec lancement", "ERROR")
            return false
        end
    end
    
    -- Sinon, essayer Hit & Run
    moi = currentFighter()
    if moi.MP > 0 then
        log("CRA", "  Hit & Run nécessaire")
        
        local success = MovementManager:executeHitAndRun(spell, target)
        
        if success then
            log("CRA", "  ✓ Hit & Run réussi (PA:" .. currentFighter().AP .. " PM:" .. currentFighter().MP .. ")")
            return true
        else
            log("CRA", "  ✗ Hit & Run échoué", "ERROR")
            return false
        end
    else
        log("CRA", "  ✗ Hors portée et 0 PM", "ERROR")
        return false
    end
end

-- ============================================
-- GESTION FLÈCHE DU JUGEMENT (DYNAMIQUE)
-- ============================================

function shouldUseFlecheDuJugement()
    local moi = currentFighter()
    local flecheJugement = getSpellByName(SPELLS_CRA, "Flèche du Jugement")
    
    if not flecheJugement or moi.AP < flecheJugement.apCost then
        return false
    end
    
    -- Calculer dégâts potentiels
    -- Formule: 18 + (42 * PM_restants%)
    local pmPercent = moi.MP / 6  -- Supposer 6 PM max
    local degatsEstimes = 18 + (42 * pmPercent)
    
    log("CRA", string.format(
        "Flèche Jugement: %d dégâts potentiels (PM:%d/%d = %.0f%%)",
        math.floor(degatsEstimes),
        moi.MP,
        6,
        pmPercent * 100
    ), "DEBUG")
    
    -- Utiliser si PM > 50% (dégâts > 39)
    return pmPercent > 0.5
end

-- ============================================
-- STATS FIN DE TOUR
-- ============================================

function logTurnStats()
    local moi = currentFighter()
    
    log("CRA", "========================================")
    log("CRA", "STATS FIN DE TOUR:")
    log("CRA", "  PA restants: " .. moi.AP)
    log("CRA", "  PM restants: " .. moi.MP)
    log("CRA", "  PV: " .. moi.lifePoints .. "/" .. moi.maxLifePoints)
    
    -- Afficher buffs actifs
    local buffs = StatsManager:getActiveBuffs(moi)
    if #buffs > 0 then
        log("CRA", "  Buffs actifs:")
        for _, buff in ipairs(buffs) do
            log("CRA", string.format(
                "    • %s: +%d (%d tours)",
                buff.type,
                buff.value,
                buff.turnsRemaining or 0
            ))
        end
    end
    
    log("CRA", "========================================")
end

-- ============================================
-- HELPER: Refresh Fighter Stats
-- ============================================

function refreshFighter()
    -- Force refresh des stats du fighter
    return currentFighter()
end