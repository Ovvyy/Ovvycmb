-- ============================================
-- PLACEMENT MANAGER - Placement initial équipe
-- Optimisation formation Cra distance + Enutrof support
-- Niveau 200 - Distance 10+ cases
-- ============================================

PlacementManager = {}

-- Configuration placement
PlacementManager.config = {
    formationPreferee = "ligne_arriere",  -- ligne_arriere, triangle, dispersee
    distanceMinEntreAllies = 2,           -- Distance min entre Cra
    distanceIdealeCible = 10,             -- Distance idéale aux ennemis
    enuTrofDevant = false,                -- Enutrof devant ou derrière ?
}

-- Cache positions
PlacementManager.cache = {
    lastPlacement = {},
    enemyStartCells = {},
    allyStartCells = {}
}

-- ============================================
-- PLACEMENT PRINCIPAL
-- ============================================

function PlacementManager:executePlacement()
    log("PLACEMENT", "=== DÉBUT PLACEMENT ===")
    
    -- Analyser cellules de départ disponibles
    local startCells = self:getAvailableStartCells()
    
    if not startCells or #startCells == 0 then
        log("PLACEMENT", "❌ Aucune cellule de départ disponible", "ERROR")
        return false
    end
    
    log("PLACEMENT", "Cellules disponibles: " .. #startCells)
    
    -- Analyser positions ennemies (si visibles)
    local enemyPositions = self:analyzeEnemyStartPositions()
    
    -- Calculer formation optimale
    local formation = self:calculateOptimalFormation(startCells, enemyPositions)
    
    if not formation then
        log("PLACEMENT", "❌ Impossible de calculer formation", "ERROR")
        return false
    end
    
    -- Afficher plan de placement
    self:displayFormationPlan(formation)
    
    -- Exécuter placement
    local success = self:executeFormation(formation)
    
    if success then
        log("PLACEMENT", "✅ Placement terminé avec succès", "SUCCESS")
    else
        log("PLACEMENT", "⚠️  Placement partiel ou échoué", "ERROR")
    end
    
    return success
end

-- ============================================
-- ANALYSE CELLULES DE DÉPART
-- ============================================

function PlacementManager:getAvailableStartCells()
    -- Récupérer cellules de placement disponibles
    local startCells = {}
    
    -- API Frigost pour cellules de départ
    -- (La méthode exacte dépend de la doc Frigost)
    
    -- Méthode 1: Via API directe (si existe)
    if startPlacementCells then
        startCells = startPlacementCells()
    end
    
    -- Méthode 2: Via map data
    if #startCells == 0 and map and map.placementCells then
        startCells = map.placementCells
    end
    
    -- Fallback: Détecter via accessibleCells au tour 0
    if #startCells == 0 then
        local accessible = accessibleCells()
        for _, cell in ipairs(accessible) do
            table.insert(startCells, cell.cellId)
        end
    end
    
    -- Filtrer cellules praticables
    local validCells = {}
    for _, cellId in ipairs(startCells) do
        if self:isCellValid(cellId) then
            table.insert(validCells, cellId)
        end
    end
    
    log("PLACEMENT", "Cellules valides: " .. #validCells .. "/" .. #startCells, "DEBUG")
    
    return validCells
end

function PlacementManager:isCellValid(cellId)
    -- Vérifier si cellule est valide pour placement
    
    -- Pas déjà occupée
    local fighters_list = fighters()
    for _, fighter in ipairs(fighters_list) do
        if fighter.cellId == cellId then
            return false
        end
    end
    
    -- Praticable
    if not MapAnalyzer:isWalkable(cellId) then
        return false
    end
    
    return true
end

function PlacementManager:analyzeEnemyStartPositions()
    -- Analyser où sont/seront les ennemis
    local enemies = {}
    local fighters_list = fighters()
    
    for _, fighter in ipairs(fighters_list) do
        if fighter.team == enum_Team.Defender then
            table.insert(enemies, {
                cellId = fighter.cellId,
                name = fighter.name,
                distance = 0
            })
        end
    end
    
    if #enemies > 0 then
        log("PLACEMENT", "Ennemis détectés: " .. #enemies, "DEBUG")
        
        -- Calculer centre de masse ennemis
        local centerX, centerY = 0, 0
        for _, enemy in ipairs(enemies) do
            local coords = cellCoords(enemy.cellId)
            if coords then
                centerX = centerX + coords.x
                centerY = centerY + coords.y
            end
        end
        
        if #enemies > 0 then
            centerX = centerX / #enemies
            centerY = centerY / #enemies
        end
        
        return {
            enemies = enemies,
            center = coordsToCell(math.floor(centerX), math.floor(centerY)),
            count = #enemies
        }
    else
        log("PLACEMENT", "Aucun ennemi visible (placement pré-combat)", "DEBUG")
        return nil
    end
end

-- ============================================
-- CALCUL FORMATION
-- ============================================

function PlacementManager:calculateOptimalFormation(availableCells, enemyData)
    log("PLACEMENT", "Calcul formation: " .. self.config.formationPreferee)
    
    local formation = {
        cra1 = nil,
        cra2 = nil,
        cra3 = nil,
        enutrof = nil,
        type = self.config.formationPreferee
    }
    
    -- Sélectionner méthode selon type
    if self.config.formationPreferee == "ligne_arriere" then
        formation = self:formationLigneArriere(availableCells, enemyData)
    elseif self.config.formationPreferee == "triangle" then
        formation = self:formationTriangle(availableCells, enemyData)
    elseif self.config.formationPreferee == "dispersee" then
        formation = self:formationDispersee(availableCells, enemyData)
    else
        -- Fallback: ligne arrière
        formation = self:formationLigneArriere(availableCells, enemyData)
    end
    
    return formation
end

-- ============================================
-- FORMATIONS SPÉCIFIQUES
-- ============================================

function PlacementManager:formationLigneArriere(availableCells, enemyData)
    log("PLACEMENT", "Formation: Ligne arrière (Cra distance max)")
    
    local formation = {
        type = "ligne_arriere",
        positions = {}
    }
    
    -- Déterminer direction ennemis
    local enemyCenter = nil
    if enemyData and enemyData.center then
        enemyCenter = enemyData.center
    else
        -- Supposer ennemis au centre de la map
        enemyCenter = MapAnalyzer:getMapCenter()
    end
    
    -- Trouver cellules les plus éloignées des ennemis
    local cellsWithDistance = {}
    
    for _, cellId in ipairs(availableCells) do
        local distance = 999
        
        if enemyCenter then
            distance = cellsDistance(cellId, enemyCenter)
        end
        
        table.insert(cellsWithDistance, {
            cellId = cellId,
            distance = distance
        })
    end
    
    -- Trier par distance décroissante
    table.sort(cellsWithDistance, function(a, b) return a.distance > b.distance end)
    
    -- Sélectionner 4 cellules les plus éloignées avec espacement
    local selected = {}
    
    for _, cell in ipairs(cellsWithDistance) do
        local tooClose = false
        
        -- Vérifier distance avec cellules déjà sélectionnées
        for _, selectedCell in ipairs(selected) do
            local dist = cellsDistance(cell.cellId, selectedCell.cellId)
            if dist < self.config.distanceMinEntreAllies then
                tooClose = true
                break
            end
        end
        
        if not tooClose then
            table.insert(selected, cell)
            
            if #selected >= 4 then
                break
            end
        end
    end
    
    if #selected < 4 then
        log("PLACEMENT", "⚠️  Seulement " .. #selected .. " positions trouvées", "ERROR")
        return nil
    end
    
    -- Assigner positions
    -- Cra les plus éloignés, Enutrof légèrement devant ou derrière
    if self.config.enuTrofDevant then
        -- Enutrof devant (plus proche)
        formation.enutrof = selected[4].cellId
        formation.cra1 = selected[1].cellId
        formation.cra2 = selected[2].cellId
        formation.cra3 = selected[3].cellId
    else
        -- Cra devant, Enutrof derrière
        formation.cra1 = selected[1].cellId
        formation.cra2 = selected[2].cellId
        formation.cra3 = selected[3].cellId
        formation.enutrof = selected[4].cellId
    end
    
    return formation
end

function PlacementManager:formationTriangle(availableCells, enemyData)
    log("PLACEMENT", "Formation: Triangle")
    
    -- Formation triangle: 2 Cra devant, 1 Cra + Enutrof derrière
    local formation = {
        type = "triangle",
        positions = {}
    }
    
    local enemyCenter = nil
    if enemyData and enemyData.center then
        enemyCenter = enemyData.center
    else
        enemyCenter = MapAnalyzer:getMapCenter()
    end
    
    -- Trouver 2 cellules devant (plus proches)
    -- et 2 cellules derrière (plus loin)
    
    local cellsWithDistance = {}
    for _, cellId in ipairs(availableCells) do
        local distance = cellsDistance(cellId, enemyCenter or cellId)
        table.insert(cellsWithDistance, {
            cellId = cellId,
            distance = distance
        })
    end
    
    table.sort(cellsWithDistance, function(a, b) return a.distance < b.distance end)
    
    -- Trouver équilibre devant/derrière
    local midIndex = math.floor(#cellsWithDistance / 2)
    
    local front = {}
    local back = {}
    
    for i = 1, midIndex do
        table.insert(front, cellsWithDistance[i])
    end
    
    for i = midIndex + 1, #cellsWithDistance do
        table.insert(back, cellsWithDistance[i])
    end
    
    -- Sélectionner 2 devant avec espacement
    local frontSelected = self:selectSpacedCells(front, 2)
    
    -- Sélectionner 2 derrière avec espacement
    local backSelected = self:selectSpacedCells(back, 2)
    
    if #frontSelected < 2 or #backSelected < 2 then
        log("PLACEMENT", "⚠️  Impossible de former triangle", "ERROR")
        return self:formationLigneArriere(availableCells, enemyData)
    end
    
    -- Assigner positions
    formation.cra1 = frontSelected[1].cellId
    formation.cra2 = frontSelected[2].cellId
    formation.cra3 = backSelected[1].cellId
    formation.enutrof = backSelected[2].cellId
    
    return formation
end

function PlacementManager:formationDispersee(availableCells, enemyData)
    log("PLACEMENT", "Formation: Dispersée (max espacement)")
    
    local formation = {
        type = "dispersee",
        positions = {}
    }
    
    -- Sélectionner 4 cellules avec espacement maximal
    local selected = self:selectMaxSpacedCells(availableCells, 4)
    
    if #selected < 4 then
        log("PLACEMENT", "⚠️  Impossible de disperser suffisamment", "ERROR")
        return self:formationLigneArriere(availableCells, enemyData)
    end
    
    -- Assigner aléatoirement (ou selon distance ennemis)
    formation.cra1 = selected[1].cellId
    formation.cra2 = selected[2].cellId
    formation.cra3 = selected[3].cellId
    formation.enutrof = selected[4].cellId
    
    return formation
end

-- ============================================
-- SÉLECTION CELLULES
-- ============================================

function PlacementManager:selectSpacedCells(cells, count)
    local selected = {}
    
    for _, cell in ipairs(cells) do
        local tooClose = false
        
        for _, selectedCell in ipairs(selected) do
            local dist = cellsDistance(cell.cellId, selectedCell.cellId)
            if dist < self.config.distanceMinEntreAllies then
                tooClose = true
                break
            end
        end
        
        if not tooClose then
            table.insert(selected, cell)
            
            if #selected >= count then
                break
            end
        end
    end
    
    return selected
end

function PlacementManager:selectMaxSpacedCells(cells, count)
    -- Algorithme greedy pour maximiser espacement
    
    if #cells < count then
        return cells
    end
    
    local selected = {}
    
    -- Commencer par cellule aléatoire
    table.insert(selected, cells[1])
    
    while #selected < count do
        local bestCell = nil
        local maxMinDistance = 0
        
        for _, cell in ipairs(cells) do
            local alreadySelected = false
            
            for _, sel in ipairs(selected) do
                if cell.cellId == sel.cellId then
                    alreadySelected = true
                    break
                end
            end
            
            if not alreadySelected then
                -- Calculer distance minimale à toutes les cellules sélectionnées
                local minDist = 999
                
                for _, sel in ipairs(selected) do
                    local dist = cellsDistance(cell.cellId, sel.cellId)
                    minDist = math.min(minDist, dist)
                end
                
                -- Garder cellule avec distance minimale maximale
                if minDist > maxMinDistance then
                    maxMinDistance = minDist
                    bestCell = cell
                end
            end
        end
        
        if bestCell then
            table.insert(selected, bestCell)
        else
            break
        end
    end
    
    return selected
end

-- ============================================
-- EXÉCUTION PLACEMENT
-- ============================================

function PlacementManager:executeFormation(formation)
    log("PLACEMENT", "Exécution du placement...")
    
    if not formation then
        log("PLACEMENT", "❌ Formation invalide", "ERROR")
        return false
    end
    
    -- Récupérer fighters
    local allies = fighters()
    local cras = {}
    local enutrof = nil
    
    for _, fighter in ipairs(allies) do
        if fighter.team == enum_Team.Attacker then
            if fighter.breedId == BREED_CRA then
                table.insert(cras, fighter)
            elseif fighter.breedId == BREED_ENUTROF then
                enutrof = fighter
            end
        end
    end
    
    log("PLACEMENT", "Cra détectés: " .. #cras .. " | Enutrof: " .. (enutrof and "1" or "0"))
    
    -- Placer chaque personnage
    local placements = {
        {fighter = cras[1], cell = formation.cra1, name = "Cra #1"},
        {fighter = cras[2], cell = formation.cra2, name = "Cra #2"},
        {fighter = cras[3], cell = formation.cra3, name = "Cra #3"},
        {fighter = enutrof, cell = formation.enutrof, name = "Enutrof"},
    }
    
    local success = true
    
    for _, placement in ipairs(placements) do
        if placement.fighter and placement.cell then
            log("PLACEMENT", "→ " .. placement.name .. " vers cellule " .. placement.cell)
            
            local placed = self:placeFighter(placement.fighter, placement.cell)
            
            if placed then
                log("PLACEMENT", "  ✓ Placé avec succès")
                global.sleep(200)
            else
                log("PLACEMENT", "  ✗ Échec placement", "ERROR")
                success = false
            end
        else
            if not placement.fighter then
                log("PLACEMENT", "⚠️  " .. placement.name .. " non trouvé", "ERROR")
            end
            if not placement.cell then
                log("PLACEMENT", "⚠️  Pas de cellule pour " .. placement.name, "ERROR")
            end
            success = false
        end
    end
    
    return success
end

function PlacementManager:placeFighter(fighter, targetCell)
    -- Placer un fighter sur une cellule
    
    if not fighter or not targetCell then
        return false
    end
    
    -- Vérifier si déjà placé
    if fighter.cellId == targetCell then
        log("PLACEMENT", fighter.name .. " déjà en position", "DEBUG")
        return true
    end
    
    -- Méthode 1: API directe de placement (si existe)
    if placeCharacter then
        local success = pcall(function()
            placeCharacter(fighter.id, targetCell)
        end)
        
        if success then
            return true
        end
    end
    
    -- Méthode 2: Via mouvement
    local success = pcall(function()
        map.move(targetCell)
    end)
    
    if success then
        return true
    end
    
    -- Méthode 3: Clic sur cellule
    -- (Dépend de l'API Frigost)
    
    log("PLACEMENT", "Impossible de placer " .. fighter.name, "ERROR")
    return false
end

-- ============================================
-- VALIDATION PLACEMENT
-- ============================================

function PlacementManager:validatePlacement()
    -- Vérifier que le placement est optimal
    
    local allies = fighters()
    local positions = {}
    
    for _, fighter in ipairs(allies) do
        if fighter.team == enum_Team.Attacker then
            table.insert(positions, {
                name = fighter.name,
                cellId = fighter.cellId
            })
        end
    end
    
    if #positions < 4 then
        log("PLACEMENT", "⚠️  Placement incomplet (" .. #positions .. "/4)", "ERROR")
        return false
    end
    
    -- Vérifier espacement
    for i = 1, #positions do
        for j = i + 1, #positions do
            local dist = cellsDistance(positions[i].cellId, positions[j].cellId)
            
            if dist < self.config.distanceMinEntreAllies then
                log("PLACEMENT", "⚠️  " .. positions[i].name .. " et " .. positions[j].name .. " trop proches (" .. dist .. " cases)", "ERROR")
                return false
            end
        end
    end
    
    log("PLACEMENT", "✓ Placement validé", "SUCCESS")
    return true
end

-- ============================================
-- AFFICHAGE
-- ============================================

function PlacementManager:displayFormationPlan(formation)
    console.print("========================================")
    console.print("=== PLAN DE PLACEMENT ===")
    console.print("========================================")
    console.print("Formation: " .. (formation.type or "?"))
    console.print("")
    console.print("Positions:")
    
    if formation.cra1 then
        console.print("  Cra #1 → Cellule " .. formation.cra1)
    end
    
    if formation.cra2 then
        console.print("  Cra #2 → Cellule " .. formation.cra2)
    end
    
    if formation.cra3 then
        console.print("  Cra #3 → Cellule " .. formation.cra3)
    end
    
    if formation.enutrof then
        console.print("  Enutrof → Cellule " .. formation.enutrof)
    end
    
    console.print("========================================")
end

-- ============================================
-- CONFIGURATION
-- ============================================

function PlacementManager:setFormation(formationType)
    local validTypes = {"ligne_arriere", "triangle", "dispersee"}
    
    for _, validType in ipairs(validTypes) do
        if formationType == validType then
            self.config.formationPreferee = formationType
            log("PLACEMENT", "Formation changée: " .. formationType, "SUCCESS")
            return true
        end
    end
    
    log("PLACEMENT", "Type de formation invalide: " .. formationType, "ERROR")
    return false
end

function PlacementManager:setEnutrofPosition(devant)
    self.config.enuTrofDevant = devant
    log("PLACEMENT", "Enutrof " .. (devant and "DEVANT" or "DERRIÈRE"), "SUCCESS")
end

return PlacementManager