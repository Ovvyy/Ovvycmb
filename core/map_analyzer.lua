-- ============================================
-- MAP ANALYZER - Analyse tactique du terrain
-- LoS (Line of Sight), zones sûres, positions optimales
-- Optimisé pour Cra niveau 200 (10+ cases)
-- ============================================

MapAnalyzer = {}

-- Cache pour optimisation
MapAnalyzer.cache = {
    obstacles = {},
    walkable = {},
    safeCells = {},
    lastAnalysis = 0,
    mapId = 0
}

-- Durée validité cache (ms)
MapAnalyzer.CACHE_DURATION = 5000

-- ============================================
-- LIGNE DE VUE (LINE OF SIGHT)
-- ============================================

function MapAnalyzer:hasLineOfSight(fromCell, toCell)
    if fromCell == toCell then
        return true
    end
    
    -- Vérifier cache d'obstacles
    if not self:isObstaclesUpdated() then
        self:updateObstacles()
    end
    
    -- Algorithme Bresenham simplifié
    local path = self:bresenhamLine(fromCell, toCell)
    
    for _, cell in ipairs(path) do
        -- Ignorer cellule départ et arrivée
        if cell ~= fromCell and cell ~= toCell then
            if self:isObstacle(cell) then
                if DEBUG.LOG_CALCULS then
                    log("MAP", string.format("LoS bloquée: %d → %d (obstacle cellule %d)", fromCell, toCell, cell), "DEBUG")
                end
                return false
            end
        end
    end
    
    if DEBUG.LOG_CALCULS then
        log("MAP", string.format("LoS OK: %d → %d", fromCell, toCell), "DEBUG")
    end
    
    return true
end

function MapAnalyzer:bresenhamLine(cell1, cell2)
    -- Algorithme Bresenham pour tracer ligne entre 2 cellules
    local coords1 = cellCoords(cell1)
    local coords2 = cellCoords(cell2)
    
    if not coords1 or not coords2 then
        return {}
    end
    
    local x0, y0 = coords1.x, coords1.y
    local x1, y1 = coords2.x, coords2.y
    
    local line = {}
    
    local dx = math.abs(x1 - x0)
    local dy = math.abs(y1 - y0)
    local sx = x0 < x1 and 1 or -1
    local sy = y0 < y1 and 1 or -1
    local err = dx - dy
    
    local x, y = x0, y0
    local maxIterations = 100  -- Sécurité
    local iterations = 0
    
    while true do
        iterations = iterations + 1
        if iterations > maxIterations then break end
        
        -- Convertir coords → cellId
        local cellId = coordsToCell(x, y)
        if cellId then
            table.insert(line, cellId)
        end
        
        if x == x1 and y == y1 then break end
        
        local e2 = 2 * err
        
        if e2 > -dy then
            err = err - dy
            x = x + sx
        end
        
        if e2 < dx then
            err = err + dx
            y = y + sy
        end
    end
    
    return line
end

-- ============================================
-- DÉTECTION OBSTACLES
-- ============================================

function MapAnalyzer:isObstacle(cellId)
    -- Vérifier si cellule est un obstacle
    
    -- Vérifier cache
    if self.cache.obstacles[cellId] ~= nil then
        return self.cache.obstacles[cellId]
    end
    
    -- Vérifier si cellule walkable
    local isWalkable = self:isWalkable(cellId)
    
    -- Vérifier si occupée par fighter
    local isOccupied = self:isCellOccupied(cellId)
    
    local isObst = not isWalkable or isOccupied
    
    -- Mettre en cache
    self.cache.obstacles[cellId] = isObst
    
    return isObst
end

function MapAnalyzer:isWalkable(cellId)
    -- Vérifier si cellule est praticable
    
    -- Vérifier cache
    if self.cache.walkable[cellId] ~= nil then
        return self.cache.walkable[cellId]
    end
    
    -- Vérifier avec API Frigost
    local walkable = false
    
    -- Méthode 1: Via accessibleCells
    local accessibles = accessibleCells()
    for _, cell in ipairs(accessibles) do
        if cell.cellId == cellId then
            walkable = true
            break
        end
    end
    
    -- Méthode 2: Tenter pathfinding
    if not walkable then
        local moi = currentFighter()
        if moi then
            local path = findPath(moi.cellId, cellId)
            walkable = path ~= nil and #path > 0
        end
    end
    
    -- Cache
    self.cache.walkable[cellId] = walkable
    
    return walkable
end

function MapAnalyzer:isCellOccupied(cellId)
    -- Vérifier si cellule occupée par un fighter
    local fighters_list = fighters()
    
    for _, fighter in ipairs(fighters_list) do
        if fighter.cellId == cellId then
            return true
        end
    end
    
    return false
end

function MapAnalyzer:updateObstacles()
    -- Mettre à jour liste des obstacles
    log("MAP", "Mise à jour obstacles", "DEBUG")
    
    self.cache.obstacles = {}
    self.cache.walkable = {}
    
    -- Marquer cellules occupées
    local fighters_list = fighters()
    for _, fighter in ipairs(fighters_list) do
        self.cache.obstacles[fighter.cellId] = true
    end
    
    self.cache.lastAnalysis = global.timestamp()
end

function MapAnalyzer:isObstaclesUpdated()
    local now = global.timestamp()
    return (now - self.cache.lastAnalysis) < self.CACHE_DURATION
end

-- ============================================
-- POSITIONS DE TIR OPTIMALES
-- ============================================

function MapAnalyzer:findBestShootingPosition(targetCell, minRange, maxRange)
    log("MAP", string.format("Recherche position tir (portée %d-%d)", minRange, maxRange), "DEBUG")
    
    local moi = currentFighter()
    if not moi then
        log("MAP", "Pas de fighter actif", "ERROR")
        return nil
    end
    
    local accessibles = accessibleCells()
    local bestPosition = nil
    local bestScore = -999
    
    for _, cell in ipairs(accessibles) do
        local distance = cellsDistance(cell.cellId, targetCell)
        
        -- Vérifier portée
        if distance >= minRange and distance <= maxRange then
            
            -- Vérifier LoS
            if self:hasLineOfSight(cell.cellId, targetCell) then
                
                -- Calculer score
                local score = self:scorePotentialPosition(cell.cellId, targetCell, distance)
                
                if score > bestScore then
                    bestScore = score
                    bestPosition = {
                        cellId = cell.cellId,
                        distance = distance,
                        score = score
                    }
                end
            end
        end
    end
    
    if bestPosition then
        log("MAP", string.format(
            "Position optimale: cellule %d (distance:%d, score:%d)",
            bestPosition.cellId,
            bestPosition.distance,
            bestPosition.score
        ), "DEBUG")
    else
        log("MAP", "Aucune position de tir trouvée", "DEBUG")
    end
    
    return bestPosition
end

function MapAnalyzer:scorePotentialPosition(cellId, targetCell, distance)
    local score = 0
    
    -- BONUS: Distance optimale Cra (10 cases)
    local distanceOptimale = CONFIG.DISTANCE_OPTIMALE_CRA
    local ecartDistance = math.abs(distance - distanceOptimale)
    
    if ecartDistance == 0 then
        score = score + 500  -- Distance parfaite
    elseif ecartDistance <= 2 then
        score = score + 300  -- Distance très bonne (8-12)
    else
        score = score + 100  -- Distance acceptable
    end
    
    -- BONUS: Plus loin = mieux (dans la limite du raisonnable)
    score = score + distance * 10
    
    -- MALUS: Proximité avec ennemis
    local ennemis = fighters()
    local distanceMinEnnemis = 999
    
    for _, ennemi in ipairs(ennemis) do
        if ennemi.team == enum_Team.Defender then
            local dist = cellsDistance(cellId, ennemi.cellId)
            distanceMinEnnemis = math.min(distanceMinEnnemis, dist)
        end
    end
    
    if distanceMinEnnemis < CONFIG.DISTANCE_CRITIQUE then
        score = score - 500  -- DANGER: Trop proche d'un ennemi
    elseif distanceMinEnnemis < CONFIG.DISTANCE_SECURITE then
        score = score - 200  -- Un peu risqué
    end
    
    -- BONUS: Sécurité (loin de TOUS les ennemis)
    score = score + distanceMinEnnemis * 5
    
    -- BONUS: Position non exposée (pas entourée)
    local nbEnnemisProches = self:countNearbyEnemies(cellId, 5)
    score = score - nbEnnemisProches * 100
    
    return score
end

-- ============================================
-- ZONES SÛRES
-- ============================================

function MapAnalyzer:getSafestCell()
    log("MAP", "Recherche zone la plus sûre", "DEBUG")
    
    local moi = currentFighter()
    if not moi then
        return nil
    end
    
    -- Vérifier cache
    if self.cache.safeCells[1] and self:isObstaclesUpdated() then
        return self.cache.safeCells[1]
    end
    
    local accessibles = accessibleCells()
    local ennemis = fighters()
    local bestCell = nil
    local bestScore = -999
    
    for _, cell in ipairs(accessibles) do
        local score = 0
        
        -- Calculer distance à tous les ennemis
        local distanceTotale = 0
        local distanceMin = 999
        
        for _, ennemi in ipairs(ennemis) do
            if ennemi.team == enum_Team.Defender then
                local dist = cellsDistance(cell.cellId, ennemi.cellId)
                distanceTotale = distanceTotale + dist
                distanceMin = math.min(distanceMin, dist)
            end
        end
        
        -- BONUS: Distance moyenne élevée
        score = score + distanceTotale
        
        -- BONUS: Distance minimale élevée (le plus important)
        score = score + distanceMin * 100
        
        -- MALUS: Trop proche = DANGER
        if distanceMin < CONFIG.DISTANCE_CRITIQUE then
            score = score - 10000  -- Éviter à tout prix
        end
        
        -- BONUS: Distance optimale
        if distanceMin >= CONFIG.DISTANCE_OPTIMALE_CRA - 2 and
           distanceMin <= CONFIG.DISTANCE_OPTIMALE_CRA + 2 then
            score = score + 500
        end
        
        -- BONUS: Proximité alliés (soutien)
        local nbAlliesProches = self:countNearbyAllies(cell.cellId, 4)
        score = score + nbAlliesProches * 50
        
        if score > bestScore then
            bestScore = score
            bestCell = cell.cellId
        end
    end
    
    -- Mettre en cache
    if bestCell then
        self.cache.safeCells = {bestCell}
        log("MAP", string.format("Zone sûre trouvée: cellule %d (score:%d)", bestCell, bestScore), "DEBUG")
    else
        log("MAP", "Aucune zone sûre trouvée", "DEBUG")
    end
    
    return bestCell
end

function MapAnalyzer:getDangerLevel(cellId)
    -- Calculer niveau de danger d'une cellule (0-100)
    local ennemis = fighters()
    local danger = 0
    
    for _, ennemi in ipairs(ennemis) do
        if ennemi.team == enum_Team.Defender then
            local distance = cellsDistance(cellId, ennemi.cellId)
            
            -- Plus proche = plus dangereux
            if distance <= 1 then
                danger = danger + 50
            elseif distance <= 3 then
                danger = danger + 30
            elseif distance <= 5 then
                danger = danger + 10
            end
            
            -- Ennemi avec beaucoup de PM = plus dangereux
            if ennemi.MP >= CONFIG.SEUIL_PM_CRITIQUE then
                danger = danger + 20
            end
        end
    end
    
    return math.min(100, danger)
end

-- ============================================
-- COMPTAGE PROXIMITÉ
-- ============================================

function MapAnalyzer:countNearbyEnemies(cellId, radius)
    local count = 0
    local ennemis = fighters()
    
    for _, ennemi in ipairs(ennemis) do
        if ennemi.team == enum_Team.Defender then
            local distance = cellsDistance(cellId, ennemi.cellId)
            if distance <= radius then
                count = count + 1
            end
        end
    end
    
    return count
end

function MapAnalyzer:countNearbyAllies(cellId, radius)
    local count = 0
    local allies = fighters()
    
    for _, ally in ipairs(allies) do
        if ally.team == enum_Team.Attacker then
            local distance = cellsDistance(cellId, ally.cellId)
            if distance <= radius then
                count = count + 1
            end
        end
    end
    
    return count
end

function MapAnalyzer:getNearbyEnemies(cellId, radius)
    local nearby = {}
    local ennemis = fighters()
    
    for _, ennemi in ipairs(ennemis) do
        if ennemi.team == enum_Team.Defender then
            local distance = cellsDistance(cellId, ennemi.cellId)
            if distance <= radius then
                table.insert(nearby, {
                    fighter = ennemi,
                    distance = distance
                })
            end
        end
    end
    
    -- Trier par distance
    table.sort(nearby, function(a, b) return a.distance < b.distance end)
    
    return nearby
end

-- ============================================
-- ANALYSE FORMATION
-- ============================================

function MapAnalyzer:analyzeEnemyFormation()
    local ennemis = fighters()
    local positions = {}
    
    for _, ennemi in ipairs(ennemis) do
        if ennemi.team == enum_Team.Defender then
            table.insert(positions, ennemi.cellId)
        end
    end
    
    if #positions == 0 then
        return {
            type = "empty",
            spread = 0,
            center = nil
        }
    end
    
    -- Calculer centre de masse
    local centerX, centerY = 0, 0
    for _, cellId in ipairs(positions) do
        local coords = cellCoords(cellId)
        if coords then
            centerX = centerX + coords.x
            centerY = centerY + coords.y
        end
    end
    
    centerX = centerX / #positions
    centerY = centerY / #positions
    
    -- Calculer dispersion (spread)
    local totalDistance = 0
    for _, cellId in ipairs(positions) do
        local coords = cellCoords(cellId)
        if coords then
            local dist = math.sqrt((coords.x - centerX)^2 + (coords.y - centerY)^2)
            totalDistance = totalDistance + dist
        end
    end
    
    local spread = totalDistance / #positions
    
    -- Déterminer type de formation
    local formationType = "scattered"
    if spread < 2 then
        formationType = "grouped"
    elseif spread < 5 then
        formationType = "loose"
    end
    
    return {
        type = formationType,
        spread = spread,
        center = coordsToCell(math.floor(centerX), math.floor(centerY)),
        count = #positions
    }
end

function MapAnalyzer:isEnemyGrouped()
    local formation = self:analyzeEnemyFormation()
    return formation.type == "grouped"
end

-- ============================================
-- ZONES AoE
-- ============================================

function MapAnalyzer:getBestAoEPosition(aoeType, aoeRange)
    -- Trouver meilleure position pour AoE qui touche max d'ennemis
    
    local ennemis = fighters()
    local moi = currentFighter()
    
    if not moi or #ennemis == 0 then
        return nil
    end
    
    local bestCell = nil
    local maxEnemies = 0
    
    -- Tester chaque cellule accessible
    local accessibles = accessibleCells()
    
    for _, cell in ipairs(accessibles) do
        local enemiesHit = 0
        
        -- Calculer cellules AoE
        local aoeCells = self:getAoECells(cell.cellId, aoeType, aoeRange)
        
        -- Compter ennemis touchés
        for _, ennemi in ipairs(ennemis) do
            if ennemi.team == enum_Team.Defender then
                for _, aoeCell in ipairs(aoeCells) do
                    if ennemi.cellId == aoeCell then
                        enemiesHit = enemiesHit + 1
                        break
                    end
                end
            end
        end
        
        if enemiesHit > maxEnemies then
            maxEnemies = enemiesHit
            bestCell = cell.cellId
        end
    end
    
    if bestCell then
        log("MAP", string.format(
            "Meilleure position AoE: cellule %d (%d ennemis touchés)",
            bestCell,
            maxEnemies
        ), "DEBUG")
        
        return {
            cellId = bestCell,
            enemiesHit = maxEnemies
        }
    end
    
    return nil
end

function MapAnalyzer:getAoECells(centerCell, aoeType, aoeRange)
    local cells = {}
    
    if aoeType == "circle" then
        cells = circleCells(centerCell, aoeRange)
    elseif aoeType == "cross" then
        cells = crossCells(centerCell, aoeRange)
    elseif aoeType == "square" then
        cells = squareCells(centerCell, aoeRange)
    elseif aoeType == "line" then
        -- TODO: Implémenter si nécessaire
        cells = {}
    end
    
    return cells or {}
end

-- ============================================
-- PATHFINDING AVANCÉ
-- ============================================

function MapAnalyzer:findSafestPath(fromCell, toCell)
    -- Trouver chemin le plus sûr (évitant proximité ennemis)
    
    local directPath = findPath(fromCell, toCell)
    
    if not directPath then
        return nil
    end
    
    -- Évaluer danger du chemin
    local pathDanger = 0
    
    for _, cell in ipairs(directPath) do
        pathDanger = pathDanger + self:getDangerLevel(cell)
    end
    
    -- Si danger acceptable, retourner chemin direct
    if pathDanger < 50 then
        return directPath
    end
    
    -- Sinon, chercher alternative plus sûre
    log("MAP", "Chemin direct dangereux, recherche alternative", "DEBUG")
    
    -- TODO: Implémenter A* avec poids de danger
    -- Pour l'instant, retourner chemin direct
    return directPath
end

-- ============================================
-- HELPERS
-- ============================================

function MapAnalyzer:getMapCenter()
    -- Approximation du centre de la map
    -- Basé sur cellules accessibles
    
    local accessibles = accessibleCells()
    
    if #accessibles == 0 then
        return nil
    end
    
    local sumX, sumY = 0, 0
    local count = 0
    
    for _, cell in ipairs(accessibles) do
        local coords = cellCoords(cell.cellId)
        if coords then
            sumX = sumX + coords.x
            sumY = sumY + coords.y
            count = count + 1
        end
    end
    
    if count == 0 then
        return nil
    end
    
    local centerX = math.floor(sumX / count)
    local centerY = math.floor(sumY / count)
    
    return coordsToCell(centerX, centerY)
end

-- ============================================
-- NETTOYAGE
-- ============================================

function MapAnalyzer:clearCache()
    self.cache = {
        obstacles = {},
        walkable = {},
        safeCells = {},
        lastAnalysis = 0,
        mapId = 0
    }
    log("MAP", "Cache nettoyé", "DEBUG")
end

function MapAnalyzer:reset()
    self:clearCache()
    log("MAP", "Map Analyzer réinitialisé", "SUCCESS")
end

-- ============================================
-- DEBUG
-- ============================================

function MapAnalyzer:displayMapInfo()
    console.print("========================================")
    console.print("=== ANALYSE MAP ===")
    console.print("========================================")
    
    local formation = self:analyzeEnemyFormation()
    console.print("Formation ennemie: " .. formation.type)
    console.print("Dispersion: " .. math.floor(formation.spread * 10) / 10)
    console.print("Nombre ennemis: " .. formation.count)
    
    local safeCell = self:getSafestCell()
    if safeCell then
        console.print("Zone la plus sûre: cellule " .. safeCell)
        console.print("Niveau danger: " .. self:getDangerLevel(safeCell) .. "%")
    end
    
    console.print("========================================")
end

return MapAnalyzer