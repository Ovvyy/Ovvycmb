-- ============================================
-- UTILS - Fonctions utilitaires
-- ============================================

function calculerMenace(ennemi)
    if not ennemi then return 0 end
    
    local menace = 0
    
    -- PV
    menace = menace + (ennemi.lifePoints or 0) / 10
    
    -- PM (mobilité = danger)
    menace = menace + (ennemi.MP or 0) * 20
    
    -- PA (capacité offensive)
    menace = menace + (ennemi.AP or 0) * 15
    
    -- Niveau
    menace = menace + (ennemi.level or 0) * 2
    
    return math.floor(menace)
end

function trierEnnemisParMenace(ennemis)
    local ennemisAvecMenace = {}
    
    for _, ennemi in ipairs(ennemis) do
        if ennemi.team == enum_Team.Defender then
            table.insert(ennemisAvecMenace, {
                fighter = ennemi,
                menace = calculerMenace(ennemi)
            })
        end
    end
    
    table.sort(ennemisAvecMenace, function(a, b)
        return a.menace > b.menace
    end)
    
    return ennemisAvecMenace
end

function cellCoords(cellId)
    -- Conversion cellId vers coordonnées
    -- NOTE: Cette fonction dépend de l'API Frigost
    -- Utiliser la fonction native si disponible
    if map and map.getCellCoords then
        return map.getCellCoords(cellId)
    end
    
    -- Fallback approximatif
    return {
        x = cellId % 14,
        y = math.floor(cellId / 14)
    }
end

function coordsToCell(x, y)
    -- Conversion coordonnées vers cellId
    if map and map.getCellId then
        return map.getCellId(x, y)
    end
    
    -- Fallback
    return y * 14 + x
end

function cellsDistance(cell1, cell2)
    -- Calculer distance entre 2 cellules
    local coords1 = cellCoords(cell1)
    local coords2 = cellCoords(cell2)
    
    if not coords1 or not coords2 then
        return 999
    end
    
    local dx = math.abs(coords1.x - coords2.x)
    local dy = math.abs(coords1.y - coords2.y)
    
    return math.max(dx, dy)
end

function accessibleCells()
    -- Récupérer cellules accessibles
    if map and map.accessibleCells then
        return map.accessibleCells()
    end
    
    return {}
end

function circleCells(centerCell, radius)
    -- Cellules en cercle autour d'un centre
    local cells = {}
    local center = cellCoords(centerCell)
    
    if not center then return cells end
    
    for dx = -radius, radius do
        for dy = -radius, radius do
            local dist = math.sqrt(dx*dx + dy*dy)
            if dist <= radius then
                local cellId = coordsToCell(center.x + dx, center.y + dy)
                if cellId then
                    table.insert(cells, cellId)
                end
            end
        end
    end
    
    return cells
end

function crossCells(centerCell, radius)
    -- Cellules en croix
    local cells = {}
    local center = cellCoords(centerCell)
    
    if not center then return cells end
    
    -- Horizontal
    for dx = -radius, radius do
        local cellId = coordsToCell(center.x + dx, center.y)
        if cellId then
            table.insert(cells, cellId)
        end
    end
    
    -- Vertical
    for dy = -radius, radius do
        local cellId = coordsToCell(center.x, center.y + dy)
        if cellId then
            table.insert(cells, cellId)
        end
    end
    
    return cells
end

function squareCells(centerCell, radius)
    -- Cellules en carré
    local cells = {}
    local center = cellCoords(centerCell)
    
    if not center then return cells end
    
    for dx = -radius, radius do
        for dy = -radius, radius do
            local cellId = coordsToCell(center.x + dx, center.y + dy)
            if cellId then
                table.insert(cells, cellId)
            end
        end
    end
    
    return cells
end

function findPath(fromCell, toCell)
    -- Trouver chemin entre 2 cellules
    if map and map.findPath then
        return map.findPath(fromCell, toCell)
    end
    
    -- Fallback vide
    return {}
end

function canCastSpell(spellId, targetCell)
    -- Vérifier si sort peut être lancé
    if spell and spell.canCast then
        return spell.canCast(spellId, targetCell)
    end
    
    return false
end

function castSpell(spellId, targetCell)
    -- Lancer un sort
    if spell and spell.cast then
        return spell.cast(spellId, targetCell)
    end
    
    return false
end

function currentFighter()
    -- Fighter actuel
    if character and character.currentFighter then
        return character.currentFighter()
    end
    
    return nil
end

function currentRound()
    -- Tour actuel
    if combat and combat.currentRound then
        return combat.currentRound()
    end
    
    return 0
end

function fighters()
    -- Liste de tous les fighters
    if combat and combat.fighters then
        return combat.fighters()
    end
    
    return {}
end

function finishTurn()
    -- Finir le tour
    if combat and combat.endTurn then
        combat.endTurn()
    end
end

return true