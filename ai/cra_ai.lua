-- ============================================
-- IA CRA - Multi-cibles Distance
-- Niveau 200 - Distance optimale 10+ cases
-- OBJECTIF: 0 PA et 0 PM à la fin du tour
-- Protection timeout + Recalculs début de tour
-- ============================================

function CRA_AI()
    local moi = currentFighter()
    local tour = currentRound()
    
    log("CRA", "========================================")
    log("CRA", "=== TOUR " .. tour .. " - " .. (moi.name or "CRA") .. " ===")
    log("CRA", "========================================")
    log("CRA", "PA:" .. moi.AP .. " PM:" .. moi.MP .. " PV:" .. moi.lifePoints .. "/" .. moi.maxLifePoints)
    
    -- ========================================
    -- DÉBUT DE TOUR: RECALCULS ET ANALYSE
    -- ========================================
    log("CRA", "→ Analyse situation début de tour...")
    
    -- Nettoyer caches (positions ont changé depuis dernier tour)
    if MapAnalyzer and MapAnalyzer.clearCache then
        MapAnalyzer:clearCache()
    end
    if MovementManager and MovementManager.clearCache then
        MovementManager:clearCache()
    end
    
    -- Analyser TOUS les monstres (positions + résistances)
    if LearningManager and LearningManager.analyserTousMonstres then
        LearningManager:analyserTousMonstres()
    end
    
    -- Mettre à jour obstacles (fighters ont bougé)
    if MapAnalyzer and MapAnalyzer.updateObstacles then
        MapAnalyzer:updateObstacles()
    end
    
    -- Analyser santé
    local healthStatus, healthPercent = StatsManager:getHealthStatus(moi)
    log("CRA", "Santé: " .. healthStatus .. " (" .. math.floor(healthPercent * 100) .. "%)")
    
    -- Compter ennemis restants
    local nbEnnemis = 0
    local ennemis = fighters()
    for _, ennemi in ipairs(ennemis) do
        if ennemi.team == enum_Team.Defender then
            nbEnnemis = nbEnnemis + 1
        end
    end
    log("CRA", "Ennemis restants: " .. nbEnnemis)
    
    -- ========================================
    -- MODE SURVIE (< 30% PV)
    -- ========================================
    if healthStatus == "critical" then
        return executeSurvivalMode()
    end
    
    -- ========================================
    -- TOUR 1: BUFFS PUIS COMBAT
    -- ========================================
    if tour == 1 then
        return executeTurn1()
    end
    
    -- ========================================
    -- TOURS 2+: COMBAT PUR
    -- ========================================
    return executeCombatRotation()
end

-- ============================================
-- MODE SURVIE
-- ============================================

function executeSurvivalMode()
    log("CRA", "🚨 MODE SURVIE ACTIVÉ")
    
    local moi = currentFighter()
    local timeoutMax = 30000
    local startTime = global.timestamp()
    
    -- Sorts vol de vie par priorité
    local spellsVolDeVie = {
        getSpellByName(SPELLS_CRA, "Flèche Écrasante"),
        getSpellByName(SPELLS_CRA, "Flèche Détonante"),
    }
    
    -- Boucle jusqu'à 0 PA ou timeout
    while moi.AP >= 2 do
        -- Protection timeout
        local elapsed = global.timestamp() - startTime
        if elapsed > timeoutMax then
            log("CRA", "⚠️ TIMEOUT survie (" .. math.floor(elapsed/1000) .. "s)", "ERROR")
            break
        end
        
        moi = currentFighter()
        local spellLance = false
        
        -- Recalculer ennemis (ils ont pu bouger)
        local ennemis = fighters()
        
        for _, spell in ipairs(spellsVolDeVie) do
            if spell and moi.AP >= spell.apCost then
                -- Trouver meilleure cible
                local bestTarget = nil
                local bestScore = -999
                
                for _, ennemi in ipairs(ennemis) do
                    if ennemi.team == enum_Team.Defender then
                        local score = CombatCalculator:scoreSpell(spell, ennemi, moi)
                        if score > bestScore then
                            bestScore = score
                            bestTarget = ennemi
                        end
                    end
                end
                
                if bestTarget and bestScore > 0 then
                    log("CRA", "→ Vol de vie: " .. spell.name .. " sur " .. bestTarget.name .. " (PA:" .. moi.AP .. ")")
                    
                    if canCastSpell(spell.id, bestTarget.cellId) then
                        castSpell(spell.id, bestTarget.cellId)
                        StatsManager:onSpellCast(spell, moi)
                        global.sleep(300)
                        spellLance = true
                        break
                    else
                        -- Se rapprocher si PM disponibles
                        if moi.MP > 0 then
                            MovementManager:sePositionnerOptimalement(bestTarget, spell)
                            moi = currentFighter()
                            
                            if canCastSpell(spell.id, bestTarget.cellId) then
                                castSpell(spell.id, bestTarget.cellId)
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
        
        if not spellLance then
            break
        end
    end
    
    -- Utiliser TOUS les PM pour fuir
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
-- TOUR 1: BUFFS PUIS COMBAT
-- ============================================

function executeTurn1()
    log("CRA", "🎯 TOUR 1: Buffs PUIS combat jusqu'à 0 PA/PM")
    
    local moi = currentFighter()
    local timeoutMax = 60000  -- 60s pour tour 1 (plus long)
    local startTime = global.timestamp()
    
    -- ========================================
    -- PHASE 1: BUFFS PRIORITAIRES
    -- ========================================
    log("CRA", "Phase 1: Buffs")
    
    local buffsPriority = {
        {spell = getSpellByName(SPELLS_CRA, "Tirs Perçants"), priorite = 1},
        {spell = getSpellByName(SPELLS_CRA, "Tirs Éloignés"), priorite = 2},
    }
    
    for _, buffData in ipairs(buffsPriority) do
        -- Vérifier timeout
        local elapsed = global.timestamp() - startTime
        if elapsed > timeoutMax then
            log("CRA", "⚠️ TIMEOUT phase buffs", "ERROR")
            break
        end
        
        moi = currentFighter()
        local buff = buffData.spell
        
        if buff and moi.AP >= buff.apCost then
            local shouldCast = true
            
            -- Tirs Éloignés: Vérifier si nécessaire
            if buff.name == "Tirs Éloignés" then
                local needsRange = false
                local ennemis = fighters()
                
                for _, ennemi in ipairs(ennemis) do
                    if ennemi.team == enum_Team.Defender then
                        local distance = cellsDistance(moi.cellId, ennemi.cellId)
                        if distance > 12 then
                            needsRange = true
                            break
                        end
                    end
                end
                
                shouldCast = needsRange
                
                if not needsRange then
                    log("CRA", "Skip " .. buff.name .. " (portée suffisante)")
                end
            end
            
            if shouldCast then
                if buff.target == "self" or buff.target == "area" then
                    log("CRA", "→ " .. buff.name .. " (PA:" .. moi.AP .. ")")
                    castSpell(buff.id, moi.cellId)
                    StatsManager:onSpellCast(buff, moi)
                    global.sleep(300)
                end
            end
        end
    end
    
    -- ========================================
    -- PHASE 2: COMBAT COMPLET
    -- ========================================
    log("CRA", "Phase 2: Combat complet")
    moi = currentFighter()
    log("CRA", "PA restants après buffs: " .. moi.AP)
    
    local tempsRestant = timeoutMax - (global.timestamp() - startTime)
    executeCombatUntilEmpty(tempsRestant)
    
    -- ========================================
    -- PHASE 3: UTILISER TOUS LES PM RESTANTS
    -- ========================================
    moi = currentFighter()
    if moi.MP > 0 then
        log("CRA", "Phase 3: Utilisation PM restants (" .. moi.MP .. " PM)")
        MovementManager:utiliserPMRestants()
    end
    
    moi = currentFighter()
    local totalTime = global.timestamp() - startTime
    log("CRA", "========================================")
    log("CRA", "FIN TOUR 1 - PA:" .. moi.AP .. " PM:" .. moi.MP .. " | Temps: " .. math.floor(totalTime/1000) .. "s")
    log("CRA", "========================================")
    
    finishTurn()
end

-- ============================================
-- TOURS 2+: COMBAT PUR
-- ============================================

function executeCombatRotation()
    log("CRA", "⚔️ COMBAT: Taper jusqu'à 0 PA/PM")
    
    local timeoutMax = 45000  -- 45s par tour
    local startTime = global.timestamp()
    
    executeCombatUntilEmpty(timeoutMax)
    
    -- Utiliser PM restants
    local moi = currentFighter()
    if moi.MP > 0 then
        log("CRA", "→ Utilisation PM restants (" .. moi.MP .. " PM)")
        MovementManager:utiliserPMRestants()
    end
    
    moi = currentFighter()
    local totalTime = global.timestamp() - startTime
    log("CRA", "========================================")
    log("CRA", "FIN TOUR - PA:" .. moi.AP .. " PM:" .. moi.MP .. " | Temps: " .. math.floor(totalTime/1000) .. "s")
    log("CRA", "========================================")
    
    finishTurn()
end

-- ============================================
-- COMBAT JUSQU'À 0 PA (avec timeout)
-- ============================================

function executeCombatUntilEmpty(timeoutMs)
    timeoutMs = timeoutMs or 45000  -- 45s par défaut
    
    local moi = currentFighter()
    local paMin = 2
    local tentativesMax = 20
    local tentatives = 0
    local startTime = global.timestamp()
    
    log("CRA", "Début combat - PA:" .. moi.AP .. " | Timeout: " .. math.floor(timeoutMs/1000) .. "s")
    
    while moi.AP >= paMin and tentatives < tentativesMax do
        tentatives = tentatives + 1
        
        -- ========================================
        -- PROTECTION TIMEOUT STRICTE
        -- ========================================
        local elapsed = global.timestamp() - startTime
        if elapsed > timeoutMs then
            log("CRA", "⚠️ TIMEOUT SÉCURITÉ atteint (" .. math.floor(elapsed/1000) .. "s)", "ERROR")
            log("CRA", "Arrêt pour éviter freeze - PA restants: " .. moi.AP)
            break
        end
        
        moi = currentFighter()
        
        log("CRA", "→ Tentative " .. tentatives .. "/" .. tentativesMax .. " (PA:" .. moi.AP .. " PM:" .. moi.MP .. " - " .. math.floor(elapsed/1000) .. "s)", "DEBUG")
        
        -- ========================================
        -- RECALCUL SITUATION (entités ont bougé)
        -- ========================================
        if tentatives > 1 then
            -- Après chaque action, recalculer obstacles
            if MapAnalyzer and MapAnalyzer.updateObstacles then
                MapAnalyzer:updateObstacles()
            end
        end
        
        -- ========================================
        -- TROUVER MEILLEURE ACTION
        -- ========================================
        local bestAction = findBestAction()
        
        if not bestAction then
            log("CRA", "Aucune action possible avec " .. moi.AP .. " PA")
            break
        end
        
        -- ========================================
        -- EXÉCUTER ACTION
        -- ========================================
        local success = executeAction(bestAction)
        
        if not success then
            log("CRA", "Échec action, tentative suivante")
        end
        
        global.sleep(200)
    end
    
    moi = currentFighter()
    local totalTime = global.timestamp() - startTime
    
    if tentatives >= tentativesMax then
        log("CRA", "⚠️ Limite tentatives atteinte (" .. tentativesMax .. ")", "ERROR")
    end
    
    log("CRA", "Fin combat - PA:" .. moi.AP .. " | Tentatives: " .. tentatives .. " | Temps: " .. math.floor(totalTime/1000) .. "s")
end

-- ============================================
-- TROUVER MEILLEURE ACTION (avec recalcul)
-- ============================================

function findBestAction()
    local moi = currentFighter()
    
    -- Récupérer ennemis ACTUELS (positions à jour)
    local ennemis = fighters()
    local ennemisActifs = {}
    
    for _, ennemi in ipairs(ennemis) do
        if ennemi.team == enum_Team.Defender then
            table.insert(ennemisActifs, ennemi)
        end
    end
    
    if #ennemisActifs == 0 then
        log("CRA", "Plus d'ennemis détectés", "DEBUG")
        return nil
    end
    
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
    
    log("CRA", "Analyse: " .. #ennemisActifs .. " ennemis, " .. #sortsDisponibles .. " sorts disponibles", "DEBUG")
    
    -- ========================================
    -- SCORING: Analyser TOUTES les combinaisons
    -- ========================================
    local bestAction = nil
    local bestScore = -999
    
    for _, ennemi in ipairs(ennemisActifs) do
        for _, spell in ipairs(sortsDisponibles) do
            -- RECALCULER score (résistances + position ont pu changer)
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
    
    if bestAction then
        log("CRA", string.format(
            "Meilleure action: %s → %s (score:%d, distance:%d)",
            bestAction.spell.name,
            bestAction.target.name,
            bestAction.score,
            cellsDistance(moi.cellId, bestAction.target.cellId)
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
    
    log("CRA", "Exécution: " .. spell.name .. " → " .. target.name .. " (PA:" .. moi.AP .. " PM:" .. moi.MP .. ")")
    
    -- Vérifier si cible toujours vivante (a pu mourir entre temps)
    if target.lifePoints <= 0 then
        log("CRA", "⚠️ Cible morte entre temps, skip")
        return false
    end
    
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
-- UTILITAIRES
-- ============================================

function refreshFighter()
    return currentFighter()
end

function logTurnStats()
    local moi = currentFighter()
    
    log("CRA", "========================================")
    log("CRA", "STATS FIN DE TOUR:")
    log("CRA", "  PA restants: " .. moi.AP)
    log("CRA", "  PM restants: " .. moi.MP)
    log("CRA", "  PV: " .. moi.lifePoints .. "/" .. moi.maxLifePoints)
    
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