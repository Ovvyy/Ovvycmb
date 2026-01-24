-- ============================================
-- UTILITAIRES GÉNÉRIQUES
-- ============================================

-- Calculer la menace d'un ennemi
function calculerMenace(fighter)
    local moi = currentFighter()
    local menace = 0
    
    -- Distance (plus proche = plus dangereux)
    local distance = cellsDistance(moi.cellId, fighter.cellId)
    menace = menace + (10 - distance) * 10
    
    -- PM
    menace = menace + fighter.MP * 5
    
    -- PV (cibles basses = prioritaires)
    local pourcentageVie = fighter.lifePoints / fighter.maxLifePoints
    if pourcentageVie < CONFIG.SEUIL_VIE_FOCUS then
        menace = menace + 50
    end
    
    return menace
end

-- Trouver l'ennemi le plus menaçant
function ennemiPlusMenacant()
    local ennemis = fighters()
    local plusMenacant = nil
    local menaceMax = -1
    
    for _, fighter in ipairs(ennemis) do
        if fighter.team == enum_Team.Defender then
            local menace = calculerMenace(fighter)
            if menace > menaceMax then
                menaceMax = menace
                plusMenacant = fighter
            end
        end
    end
    
    return plusMenacant
end

-- Vérifier si ennemi au corps à corps
function estCorpsACorps(fighter)
    local moi = currentFighter()
    local distance = cellsDistance(moi.cellId, fighter.cellId)
    return distance <= 1
end

-- Compter ennemis à portée
function compterEnnemisPortee(portee)
    local moi = currentFighter()
    local compte = 0
    local ennemis = fighters()
    
    for _, fighter in ipairs(ennemis) do
        if fighter.team == enum_Team.Defender then
            local distance = cellsDistance(moi.cellId, fighter.cellId)
            if distance <= portee then
                compte = compte + 1
            end
        end
    end
    
    return compte
end

-- Trouver cellule la plus éloignée des ennemis
function cellulePlusEloignee()
    local cellules = accessibleCells()
    local meilleureCellule = nil
    local distanceMax = -1
    local ennemis = fighters()
    
    for _, cell in ipairs(cellules) do
        local distanceMin = 9999
        
        for _, ennemi in ipairs(ennemis) do
            if ennemi.team == enum_Team.Defender then
                local dist = cellsDistance(cell.cellId, ennemi.cellId)
                if dist < distanceMin then
                    distanceMin = dist
                end
            end
        end
        
        if distanceMin > distanceMax then
            distanceMax = distanceMin
            meilleureCellule = cell
        end
    end
    
    return meilleureCellule
end