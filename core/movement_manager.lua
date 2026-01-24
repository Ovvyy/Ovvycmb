-- ============================================
-- MOVEMENT MANAGER - Déplacements tactiques
-- Hit & Run optimisé pour niveau 200
-- OBJECTIF: Utiliser 100% des PM chaque tour
-- Maintien distance 10+ cases
-- ============================================

MovementManager = {}

-- Cache pour optimisation
MovementManager.cache = {
    lastCalculation = 0,
    cachedPaths = {}
}

-- ============================================
-- HIT & RUN TACTIQUE
-- ============================================

function MovementManager:executeHitAndRun(spell, target)
    local moi = currentFighter()
    local initialCell = moi.cellId
    
    log("MOVEMENT", "=== HIT & RUN ===")
    log("MOVEMENT", "Cible: " .. (target.name or "?") .. " | Sort: " .. (spell.name or "?"))
    log("MOVEMENT", "PM disponibles: " .. moi.MP)
    
    -- 1. CALCULER POSITION DE TIR OPTIMALE
    local shootingPos = MapAnalyzer:findBestShootingPosition(
        target.cellId,
        spell.minRange or 1,
        spell.maxRange or 12
    )
    
    if not shootingPos then
        log("MOVEMENT", "❌ Aucune position de tir trouvée")
        return false
    end
    
    log("MOVEMENT", "Position tir: cellule " .. shootingPos.cellId .. " (distance:" .. shootingPos.distance .. ")", "DEBUG")
    
    -- 2. CALCULER COÛTS PM
    local pmPourAvancer = self:calculatePMCost(initialCell, shootingPos.cellId)
    local pmDisponibles = moi.MP
    
    -- Si pas assez de PM pour avancer, tir statique
    if pmPourAvancer > pmDisponibles then
        log("MOVEMENT", "PM insuffisants pour avancer (" .. pmPourAvancer .. " > " .. pmDisponibles .. "), tir statique")
        return self:tirStatique(spell, target)
    end
    
    -- 3. PHASE AVANCER
    log("MOVEMENT", "→ Avancer (" .. pmPourAvancer .. " PM)")
    local advanceSuccess = self:avancerVersPosition(initialCell, shootingPos.cellId, pmPourAvancer)
    
    if not advanceSuccess then
        log("MOVEMENT", "❌ Échec avancement")
        return false
    end
    
    global.sleep(200)
    
    -- 4. PHASE TIRER
    log("MOVEMENT", "→ Tir sur cible")
    local shootSuccess = self:executerTir(spell, target)
    
    if not shootSuccess then
        log("MOVEMENT", "❌ Échec tir")
    end
    
    global.sleep(200)
    
    -- 5. PHASE RECULER (UTILISER TOUS LES PM RESTANTS)
    local pmRestants = currentFighter().MP
    
    if pmRestants > 0 then
        log("MOVEMENT", "→ Repli tactique avec TOUS les PM restants (" .. pmRestants .. " PM)")
        self:repliMaximal(pmRestants)
    else
        log("MOVEMENT", "✓ Tous les PM utilisés (0 PM restants)", "SUCCESS")
    end
    
    log("MOVEMENT", "Hit & Run terminé", "SUCCESS")
    return shootSuccess
end

-- ============================================
-- MOUVEMENTS DE BASE
-- ============================================

function MovementManager:avancerVersPosition(fromCell, toCell, maxPM)
    local path = findPath(fromCell, toCell)
    
    if not path or #path == 0 then
        log("MOVEMENT", "Aucun chemin trouvé", "ERROR")
        return false
    end
    
    local pmUtilises = 0
    
    for i = 1, math.min(#path, maxPM) do
        if pmUtilises >= maxPM then break end
        
        local success = pcall(function()
            map.move(path[i])
        end)
        
        if success then
            pmUtilises = pmUtilises + 1
            global.sleep(100)
        else
            log("MOVEMENT", "Erreur déplacement vers cellule " .. path[i], "ERROR")
            break
        end
    end
    
    log("MOVEMENT", "Avancé de " .. pmUtilises .. " PM", "DEBUG")
    return pmUtilises > 0
end

function MovementManager:repliMaximal(pmDisponibles)
    local safeCell = MapAnalyzer:getSafestCell()
    
    if not safeCell then
        log("MOVEMENT", "Aucune zone sûre trouvée, utilise PM pour s'éloigner maximum", "DEBUG")
        return self:seloignerMaximum(pmDisponibles)
    end
    
    local moi = currentFighter()
    local path = findPath(moi.cellId, safeCell)
    
    if not path or #path == 0 then
        log("MOVEMENT", "Impossible de rejoindre zone sûre, utilise PM pour s'éloigner", "DEBUG")
        return self:seloignerMaximum(pmDisponibles)
    end
    
    -- Utiliser TOUS les PM disponibles
    for i = 1, math.min(#path, pmDisponibles) do
        local success = pcall(function()
            map.move(path[i])
        end)
        
        if success then
            global.sleep(100)
        else
            break
        end
    end
    
    return true
end

function MovementManager:seloignerMaximum(pmDisponibles)
    -- S'éloigner le plus possible des ennemis avec tous les PM restants
    local moi = currentFighter()
    local ennemis = fighters()
    local accessibles = accessibleCells()
    
    -- Calculer centre de masse des ennemis
    local centreX, centreY = 0, 0
    local count = 0
    
    for _, ennemi in ipairs(ennemis) do
        if ennemi.team == enum_Team.Defender then
            local coords = cellCoords(ennemi.cellId)
            centreX = centreX + coords.x
            centreY = centreY + coords.y
            count = count + 1
        end
    end
    
    if count == 0 then
        log("MOVEMENT", "Aucun ennemi pour calculer éloignement")
        return false
    end
    
    centreX = centreX / count
    centreY = centreY / count
    
    -- Trouver cellule la plus éloignée accessible avec les PM disponibles
    local meilleureCellule = nil
    local meilleureDistance = 0
    
    for _, cell in ipairs(accessibles) do
        local pmCost = self:calculatePMCost(moi.cellId, cell.cellId)
        
        if pmCost <= pmDisponibles then
            local coords = cellCoords(cell.cellId)
            local distance = math.sqrt((coords.x - centreX)^2 + (coords.y - centreY)^2)
            
            if distance > meilleureDistance then
                meilleureDistance = distance
                meilleureCellule = cell
            end
        end
    end
    
    if meilleureCellule then
        log("MOVEMENT", "Éloignement maximum vers cellule " .. meilleureCellule.cellId)
        return self:avancerVersPosition(moi.cellId, meilleureCellule.cellId, pmDisponibles)
    end
    
    return false
end

function MovementManager:tirStatique(spell, target)
    log("MOVEMENT", "Mode tir statique")
    
    if canCastSpell(spell.id, target.cellId) then
        local success = castSpell(spell.id, target.cellId)
        global.sleep(300)
        return success
    else
        log("MOVEMENT", "Impossible de lancer " .. (spell.name or "sort"), "ERROR")
        return false
    end
end

function MovementManager:executerTir(spell, target)
    -- Vérifier si on peut toujours lancer le sort
    local moi = currentFighter()
    
    if not canCastSpell(spell.id, target.cellId) then
        log("MOVEMENT", "⚠️  Sort non lançable après déplacement", "ERROR")
        return false
    end
    
    local success = castSpell(spell.id, target.cellId)
    
    if success then
        log("MOVEMENT", "✓ Sort lancé avec succès", "DEBUG")
    else
        log("MOVEMENT", "✗ Échec lancement sort", "ERROR")
    end
    
    return success
end

-- ============================================
-- REPLI D'URGENCE (MODE SURVIE)
-- ============================================

function MovementManager:retreatToSafety()
    local moi = currentFighter()
    
    log("MOVEMENT", "🚨 REPLI D'URGENCE - Utiliser TOUS les PM pour fuir")
    
    local safeCell = MapAnalyzer:getSafestCell()
    
    if not safeCell then
        log("MOVEMENT", "⚠️  Aucune zone sûre, fuite aléatoire maximum", "ERROR")
        return self:seloignerMaximum(moi.MP)
    end
    
    log("MOVEMENT", "Fuite vers cellule " .. safeCell)
    
    local path = findPath(moi.cellId, safeCell)
    
    if not path or #path == 0 then
        log("MOVEMENT", "Impossible de fuir, éloignement maximum", "ERROR")
        return self:seloignerMaximum(moi.MP)
    end
    
    -- Utiliser TOUS les PM pour fuir
    for i = 1, math.min(#path, moi.MP) do
        local success = pcall(function()
            map.move(path[i])
        end)
        
        if success then
            global.sleep(80)
        else
            break
        end
    end
    
    log("MOVEMENT", "Repli effectué", "SUCCESS")
    return true
end

-- ============================================
-- MAINTIEN DISTANCE
-- ============================================

function MovementManager:maintainDistance(minDistance)
    local moi = currentFighter()
    local ennemis = fighters()
    local ennemiProche = nil
    local distanceMin = 999
    
    -- Trouver l'ennemi le plus proche
    for _, ennemi in ipairs(ennemis) do
        if ennemi.team == enum_Team.Defender then
            local distance = cellsDistance(moi.cellId, ennemi.cellId)
            if distance < distanceMin then
                distanceMin = distance
                ennemiProche = ennemi
            end
        end
    end
    
    if not ennemiProche then
        log("MOVEMENT", "Aucun ennemi détecté", "DEBUG")
        return true
    end
    
    log("MOVEMENT", "Ennemi le plus proche: " .. ennemiProche.name .. " à " .. distanceMin .. " cases", "DEBUG")
    
    -- Vérifier si distance OK
    if distanceMin >= minDistance then
        log("MOVEMENT", "✓ Distance sécurisée (" .. distanceMin .. " >= " .. minDistance .. ")")
        return true
    end
    
    -- DANGER: Trop proche !
    log("MOVEMENT", "⚠️  DANGER: Ennemi trop proche (" .. distanceMin .. " < " .. minDistance .. ")", "ERROR")
    
    -- Fuir avec TOUS les PM
    return self:retreatToSafety()
end

function MovementManager:maintainOptimalDistance()
    -- Maintenir distance optimale Cra (10+ cases)
    return self:maintainDistance(CONFIG.DISTANCE_OPTIMALE_CRA)
end

-- ============================================
-- UTILISER TOUS LES PM RESTANTS
-- ============================================

function MovementManager:utiliserPMRestants()
    local moi = currentFighter()
    local pmRestants = moi.MP
    
    if pmRestants == 0 then
        log("MOVEMENT", "✓ Tous les PM déjà utilisés", "SUCCESS")
        return true
    end
    
    log("MOVEMENT", "Il reste " .. pmRestants .. " PM - Optimisation positionnement final")
    
    -- Stratégie: Se repositionner pour le prochain tour
    local meilleurCellule = self:trouverMeilleurPositionnementFinal(pmRestants)
    
    if meilleurCellule then
        log("MOVEMENT", "Repositionnement final vers cellule " .. meilleurCellule.cellId)
        return self:avancerVersPosition(moi.cellId, meilleurCellule.cellId, pmRestants)
    else
        -- Fallback: s'éloigner au maximum
        log("MOVEMENT", "Pas de position optimale, éloignement maximum")
        return self:seloignerMaximum(pmRestants)
    end
end

function MovementManager:trouverMeilleurPositionnementFinal(pmDisponibles)
    local moi = currentFighter()
    local accessibles = accessibleCells()
    local ennemis = fighters()
    
    local meilleureCellule = nil
    local meilleurScore = -999
    
    for _, cell in ipairs(accessibles) do
        local pmCost = self:calculatePMCost(moi.cellId, cell.cellId)
        
        -- Vérifier que accessible avec PM disponibles
        if pmCost <= pmDisponibles then
            local score = 0
            
            -- Calculer distance minimale aux ennemis
            local distanceMinEnnemis = 999
            for _, ennemi in ipairs(ennemis) do
                if ennemi.team == enum_Team.Defender then
                    local dist = cellsDistance(cell.cellId, ennemi.cellId)
                    distanceMinEnnemis = math.min(distanceMinEnnemis, dist)
                end
            end
            
            -- BONUS: Distance optimale (10 cases)
            if distanceMinEnnemis >= CONFIG.DISTANCE_OPTIMALE_CRA - 2 and
               distanceMinEnnemis <= CONFIG.DISTANCE_OPTIMALE_CRA + 2 then
                score = score + 500
            end
            
            -- BONUS: Plus loin = mieux
            score = score + distanceMinEnnemis * 50
            
            -- BONUS: Utiliser le maximum de PM
            score = score + pmCost * 10
            
            -- MALUS: Trop proche = danger
            if distanceMinEnnemis < CONFIG.DISTANCE_CRITIQUE then
                score = score - 1000
            end
            
            if score > meilleurScore then
                meilleurScore = score
                meilleureCellule = cell
            end
        end
    end
    
    if meilleureCellule then
        log("MOVEMENT", "Meilleure cellule trouvée (score:" .. meilleurScore .. ")", "DEBUG")
    end
    
    return meilleureCellule
end

-- ============================================
-- CALCULS PM
-- ============================================

function MovementManager:calculatePMCost(fromCell, toCell)
    local cacheKey = fromCell .. "_" .. toCell
    
    -- Vérifier cache
    if self.cache.cachedPaths[cacheKey] then
        return self.cache.cachedPaths[cacheKey]
    end
    
    local path = findPath(fromCell, toCell)
    
    if not path then
        self.cache.cachedPaths[cacheKey] = 999
        return 999
    end
    
    local cost = #path
    self.cache.cachedPaths[cacheKey] = cost
    
    return cost
end

function MovementManager:canAffordMovement(fromCell, toCell, pmDisponibles)
    local cost = self:calculatePMCost(fromCell, toCell)
    return pmDisponibles >= cost
end

-- ============================================
-- POSITIONNEMENT STRATÉGIQUE
-- ============================================

function MovementManager:sePositionnerOptimalement(target, spell)
    local moi = currentFighter()
    
    log("MOVEMENT", "Recherche position optimale pour " .. (spell.name or "sort"))
    
    -- Chercher position à distance optimale
    local bestPos = MapAnalyzer:findBestShootingPosition(
        target.cellId,
        spell.minRange or 1,
        spell.maxRange or 12
    )
    
    if not bestPos then
        log("MOVEMENT", "Aucune position optimale trouvée")
        return false
    end
    
    -- Vérifier si déjà en bonne position
    if moi.cellId == bestPos.cellId then
        log("MOVEMENT", "Déjà en position optimale")
        return true
    end
    
    -- Se déplacer avec TOUS les PM disponibles
    local pmCost = self:calculatePMCost(moi.cellId, bestPos.cellId)
    
    if moi.MP < pmCost then
        log("MOVEMENT", "PM insuffisants pour position optimale (" .. moi.MP .. "/" .. pmCost .. ")")
        -- Se rapprocher autant que possible
        return self:avancerVersPosition(moi.cellId, bestPos.cellId, moi.MP)
    end
    
    return self:avancerVersPosition(moi.cellId, bestPos.cellId, pmCost)
end

-- ============================================
-- KITING AVANCÉ
-- ============================================

function MovementManager:kiteEnnemi(ennemi, pmDisponibles)
    local moi = currentFighter()
    local distance = cellsDistance(moi.cellId, ennemi.cellId)
    
    log("MOVEMENT", "Kiting " .. ennemi.name .. " (distance:" .. distance .. ") avec " .. pmDisponibles .. " PM")
    
    -- Si déjà assez loin, optimiser position
    if distance >= CONFIG.DISTANCE_OPTIMALE_CRA then
        log("MOVEMENT", "Distance déjà optimale, repositionnement final")
        return self:utiliserPMRestants()
    end
    
    -- Trouver cellule plus éloignée accessible
    local accessibles = accessibleCells()
    local meilleureCellule = nil
    local meilleureDistance = distance
    local meilleurPMCost = 0
    
    for _, cell in ipairs(accessibles) do
        local pmCost = self:calculatePMCost(moi.cellId, cell.cellId)
        
        if pmCost <= pmDisponibles then
            local nouvelleDist = cellsDistance(cell.cellId, ennemi.cellId)
            
            -- Vérifier que plus loin
            if nouvelleDist > meilleureDistance then
                -- Vérifier pas trop proche d'autres ennemis
                local autresEnnemisProches = false
                local ennemis = fighters()
                
                for _, autreEnnemi in ipairs(ennemis) do
                    if autreEnnemi.team == enum_Team.Defender and autreEnnemi.id ~= ennemi.id then
                        if cellsDistance(cell.cellId, autreEnnemi.cellId) < CONFIG.DISTANCE_CRITIQUE then
                            autresEnnemisProches = true
                            break
                        end
                    end
                end
                
                if not autresEnnemisProches then
                    meilleureDistance = nouvelleDist
                    meilleureCellule = cell
                    meilleurPMCost = pmCost
                end
            end
        end
    end
    
    if not meilleureCellule then
        log("MOVEMENT", "Aucune cellule de kite trouvée")
        return false
    end
    
    -- Kite + utiliser PM restants après
    log("MOVEMENT", "Kite vers cellule " .. meilleureCellule.cellId .. " (distance:" .. meilleureDistance .. ", PM:" .. meilleurPMCost .. ")")
    
    local success = self:avancerVersPosition(moi.cellId, meilleureCellule.cellId, meilleurPMCost)
    
    -- Utiliser PM restants
    local pmApres = currentFighter().MP
    if pmApres > 0 then
        log("MOVEMENT", "PM restants après kite: " .. pmApres)
        self:utiliserPMRestants()
    end
    
    return success
end

-- ============================================
-- GESTION OBSTACLES
-- ============================================

function MovementManager:contournerObstacle(targetCell)
    local moi = currentFighter()
    
    -- Essayer de trouver un chemin direct
    local path = findPath(moi.cellId, targetCell)
    
    if path and #path > 0 then
        -- Chemin direct existe
        return path
    end
    
    -- Pas de chemin direct, chercher alternatives
    log("MOVEMENT", "Recherche contournement...", "DEBUG")
    
    local cellules = accessibleCells()
    local meilleurChemin = nil
    local meilleurScore = 999
    
    for _, cell in ipairs(cellules) do
        local pathVersCell = findPath(moi.cellId, cell.cellId)
        local pathDepuisCell = findPath(cell.cellId, targetCell)
        
        if pathVersCell and pathDepuisCell then
            local coutTotal = #pathVersCell + #pathDepuisCell
            
            if coutTotal < meilleurScore then
                meilleurScore = coutTotal
                meilleurChemin = pathVersCell
            end
        end
    end
    
    return meilleurChemin
end

-- ============================================
-- NETTOYAGE CACHE
-- ============================================

function MovementManager:clearCache()
    self.cache = {
        lastCalculation = 0,
        cachedPaths = {}
    }
    log("MOVEMENT", "Cache nettoyé", "DEBUG")
end

return MovementManager