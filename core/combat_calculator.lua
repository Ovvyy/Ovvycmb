-- ============================================
-- COMBAT CALCULATOR - Calculs dégâts & Scoring
-- Formules officielles Dofus intégrées
-- Support résistances négatives
-- ============================================

CombatCalculator = {}

-- ============================================
-- FORMULES DOFUS OFFICIELLES
-- ============================================

--[[
    FORMULE DÉGÂTS TOTAUX (avant résistances):
    Dégâts = DégâtsBase * (1 + (Puissance + Caractéristique) / 100) + DommagesFixes
    
    FORMULE DÉGÂTS SUBIS (après résistances):
    DégâtsSubis = (DégâtsTotaux - RésistanceFixes) * (1 - RésistancePourcentage / 100)
    
    ORDRE APPLICATION:
    1. Calcul dégâts de base avec stats
    2. Ajout dommages fixes
    3. Application multiplicateurs (critiques, buffs finaux)
    4. Soustraction résistances fixes
    5. Application résistances en %
    6. Application réductions finales (boucliers, etc.)
    
    RÉSISTANCES:
    - Peuvent être NÉGATIVES (faiblesse élémentaire)
    - Joueurs limités à 50% max par élément
    - Invocations: pas de limite
    - Résistances fixes appliquées AVANT résistances %
]]

-- ============================================
-- CALCUL DÉGÂTS
-- ============================================

function CombatCalculator:calculerDegatsTheorique(spell, caster, target)
    if not spell or not caster or not target then
        log("COMBAT_CALC", "Paramètres invalides pour calcul dégâts", "ERROR")
        return 0
    end
    
    -- 1. DÉGÂTS DE BASE
    local degatsBase = spell.baseDamage or 0
    
    -- Si plage (min-max), prendre moyenne
    if spell.baseDamageMin and spell.baseDamageMax then
        degatsBase = (spell.baseDamageMin + spell.baseDamageMax) / 2
    end
    
    -- 2. STATS DU LANCEUR (avec buffs dynamiques)
    local stats = StatsManager:getRealStats(caster)
    
    -- Caractéristique selon élément du sort
    local caracteristique = 0
    if spell.element == ELEMENTS.FEU then
        caracteristique = stats.intelligence or 0
    elseif spell.element == ELEMENTS.EAU then
        caracteristique = stats.chance or 0
    elseif spell.element == ELEMENTS.TERRE or spell.element == ELEMENTS.NEUTRE then
        caracteristique = stats.strength or 0
    elseif spell.element == ELEMENTS.AIR then
        caracteristique = stats.agility or 0
    end
    
    -- ✅ Puissance RÉELLE (base + buffs comme Flèche Assaillante)
    local puissance = stats.power or 0
    
    -- 3. DOMMAGES FIXES
    local dommagesFixes = spell.fixedDamage or 0
    
    -- 4. CALCUL DÉGÂTS AVANT RÉSISTANCES
    -- Formule: DégâtsBase * (1 + (Puissance + Carac) / 100) + DommagesFixes
    local degatsAvantRes = degatsBase * (1 + (puissance + caracteristique) / 100) + dommagesFixes
    
    -- 5. MULTIPLICATEUR CRITIQUE
    local multiplicateurCrit = 1.0
    if spell.canCrit then
        -- Estimation: 50% de chance de crit à niveau 200
        -- En moyenne: 1.0 + 0.5 * 0.5 = 1.25
        multiplicateurCrit = 1.25
        
        -- Bonus dommages critiques si existant
        if spell.criticalDamage and spell.criticalDamage > 0 then
            multiplicateurCrit = multiplicateurCrit + (spell.criticalDamage / degatsBase) * 0.5
        end
    end
    
    degatsAvantRes = degatsAvantRes * multiplicateurCrit
    
    -- 6. RÉSISTANCES DE LA CIBLE
    local resistance = self:getResistanceElement(target, spell.element)
    
    -- 7. RÉSISTANCES FIXES (par défaut 0)
    local resistanceFixes = 0
    
    -- 8. CALCUL DÉGÂTS FINAUX
    -- Formule: (DégâtsAvantRes - ResFixes) * (1 - Res% / 100)
    local degatsApresResFixes = math.max(0, degatsAvantRes - resistanceFixes)
    
    -- IMPORTANT: Résistances peuvent être négatives!
    -- Si Res = -20%, alors (1 - (-20)/100) = 1.20 = +20% dégâts
    local multiplicateurRes = 1 - (resistance / 100)
    local degatsFinaux = degatsApresResFixes * multiplicateurRes
    
    -- Arrondir à l'entier inférieur (comme Dofus)
    degatsFinaux = math.floor(degatsFinaux)
    
    if DEBUG.LOG_DEGATS then
        log("COMBAT_CALC", string.format(
            "%s: Base:%.0f Carac:%d Puis:%d → AvantRes:%.0f Res:%+.0f%% → Final:%.0f",
            spell.name or "Sort",
            degatsBase,
            caracteristique,
            puissance,
            degatsAvantRes,
            resistance,
            degatsFinaux
        ), "DEBUG")
    end
    
    return degatsFinaux
end

-- ============================================
-- GESTION RÉSISTANCES
-- ============================================

function CombatCalculator:getResistanceElement(target, element)
    local resistance = 0
    
    -- 1. Essayer données apprises d'abord
    if APPRENTISSAGE.ENABLED and target.creatureGenericId then
        local donneesApprises = LearningManager:obtenirResistances(target.creatureGenericId)
        
        if donneesApprises and donneesApprises.fiable and 
           donneesApprises.confiance >= APPRENTISSAGE.CONFIANCE_SEUIL then
            
            resistance = donneesApprises.resistances[element] or 0
            
            if DEBUG.LOG_RESISTANCES then
                log("COMBAT_CALC", string.format(
                    "%s: Résistance %s = %+.1f%% (apprise, confiance:%.0f%%)",
                    target.name,
                    element,
                    resistance,
                    donneesApprises.confiance * 100
                ), "DEBUG")
            end
            
            return resistance
        end
    end
    
    -- 2. Sinon, utiliser stats actuelles
    resistance = self:getResistanceActuelle(target, element)
    
    -- 3. Analyser en temps réel pour apprentissage
    if APPRENTISSAGE.ENABLED then
        LearningManager:analyserMonstre(target)
    end
    
    return resistance
end

function CombatCalculator:getResistanceActuelle(target, element)
    local resistance = 0
    
    if element == ELEMENTS.FEU then
        resistance = target.stats.fireResistPercent or 0
    elseif element == ELEMENTS.EAU then
        resistance = target.stats.waterResistPercent or 0
    elseif element == ELEMENTS.TERRE then
        resistance = target.stats.earthResistPercent or 0
    elseif element == ELEMENTS.AIR then
        resistance = target.stats.airResistPercent or 0
    elseif element == ELEMENTS.NEUTRE then
        resistance = target.stats.neutralResistPercent or 0
    end
    
    -- Clamper selon le type (joueur vs invocation)
    if target.type == enum_FighterType.Character then
        resistance = math.max(CONFIG.MIN_RESISTANCE_PERCENT, 
                             math.min(CONFIG.MAX_RESISTANCE_PERCENT_JOUEUR, resistance))
    else
        -- Invocations/Monstres: pas de limite haute
        resistance = math.max(CONFIG.MIN_RESISTANCE_PERCENT, 
                             math.min(CONFIG.MAX_RESISTANCE_PERCENT_SUMMON, resistance))
    end
    
    if DEBUG.LOG_RESISTANCES then
        log("COMBAT_CALC", string.format(
            "%s: Résistance %s = %+.1f%% (actuelle)",
            target.name,
            element,
            resistance
        ), "DEBUG")
    end
    
    return resistance
end

function CombatCalculator:analyzeResistances(target)
    local resistances = {
        neutral = self:getResistanceElement(target, ELEMENTS.NEUTRE),
        earth = self:getResistanceElement(target, ELEMENTS.TERRE),
        fire = self:getResistanceElement(target, ELEMENTS.FEU),
        water = self:getResistanceElement(target, ELEMENTS.EAU),
        air = self:getResistanceElement(target, ELEMENTS.AIR)
    }
    
    return resistances
end

function CombatCalculator:getBestElement(target)
    local resistances = self:analyzeResistances(target)
    
    local minResist = 100
    local bestElement = ELEMENTS.NEUTRE
    
    for element, resist in pairs(resistances) do
        if resist < minResist then
            minResist = resist
            bestElement = element
        end
    end
    
    return bestElement, minResist
end

function CombatCalculator:getWorstElement(target)
    local resistances = self:analyzeResistances(target)
    
    local maxResist = -100
    local worstElement = ELEMENTS.NEUTRE
    
    for element, resist in pairs(resistances) do
        if resist > maxResist then
            maxResist = resist
            worstElement = element
        end
    end
    
    return worstElement, maxResist
end

-- ============================================
-- SYSTÈME DE SCORING
-- ============================================

function CombatCalculator:scoreSpell(spell, target, caster)
    if not spell or not target or not caster then
        return 0
    end
    
    local score = 0
    
    -- Vérifications préalables
    if not self:canCastSpellBasic(spell, target, caster) then
        return 0
    end
    
    -- ========================================
    -- 1. DÉGÂTS POTENTIELS (35%)
    -- ========================================
    local degatsEstimes = self:calculerDegatsTheorique(spell, caster, target)
    local scoreDegats = degatsEstimes * CONFIG.POIDS_DEGATS
    score = score + scoreDegats
    
    if DEBUG.LOG_CALCULS then
        log("COMBAT_CALC", "  Score dégâts: " .. math.floor(scoreDegats) .. " (dégâts:" .. math.floor(degatsEstimes) .. ")", "DEBUG")
    end
    
    -- ========================================
    -- 2. EFFICACITÉ ÉLÉMENTAIRE (30%)
    -- ========================================
    local bestElement, minResist = self:getBestElement(target)
    local scoreElement = 0
    
    if spell.element == bestElement then
        -- Élément optimal
        scoreElement = 300
        
        -- Bonus supplémentaire si résistance négative
        if minResist < 0 then
            scoreElement = scoreElement + math.abs(minResist) * 5
        end
    else
        -- Pénalité si mauvais élément
        local resistance = self:getResistanceElement(target, spell.element)
        if resistance > minResist + 20 then
            scoreElement = -100
        end
    end
    
    score = score + (scoreElement * CONFIG.POIDS_SECURITE)
    
    if DEBUG.LOG_CALCULS then
        log("COMBAT_CALC", "  Score élément: " .. math.floor(scoreElement * CONFIG.POIDS_SECURITE) .. " (élément:" .. spell.element .. ")", "DEBUG")
    end
    
    -- ========================================
    -- 3. EFFICACITÉ PA (15%)
    -- ========================================
    local apCost = spell.apCost or 3
    local efficacitePA = 0
    
    if apCost > 0 then
        -- Dégâts par PA
        efficacitePA = (degatsEstimes / apCost) * 10
        
        -- Bonus si sort peu coûteux
        if apCost <= 3 then
            efficacitePA = efficacitePA * 1.2
        end
    end
    
    score = score + (efficacitePA * CONFIG.POIDS_EFFICACITE_PA)
    
    if DEBUG.LOG_CALCULS then
        log("COMBAT_CALC", "  Score PA: " .. math.floor(efficacitePA * CONFIG.POIDS_EFFICACITE_PA) .. " (cout:" .. apCost .. "PA)", "DEBUG")
    end
    
    -- ========================================
    -- 4. POSITIONNEMENT (10%)
    -- ========================================
    local distance = cellsDistance(caster.cellId, target.cellId)
    local scorePosition = 0
    
    -- Vérifier portée
    if distance >= (spell.minRange or 0) and distance <= (spell.maxRange or 12) then
        scorePosition = 100
        
        -- Bonus si à distance optimale Cra
        if distance >= CONFIG.DISTANCE_OPTIMALE_CRA - 2 and 
           distance <= CONFIG.DISTANCE_OPTIMALE_CRA + 2 then
            scorePosition = scorePosition + 50
        end
        
        -- Vérifier LoS
        if MapAnalyzer:hasLineOfSight(caster.cellId, target.cellId) then
            scorePosition = scorePosition + 50
        else
            -- Pas de LoS = score nul
            return 0
        end
    else
        -- Hors portée = score nul
        return 0
    end
    
    score = score + (scorePosition * CONFIG.POIDS_POSITION)
    
    if DEBUG.LOG_CALCULS then
        log("COMBAT_CALC", "  Score position: " .. math.floor(scorePosition * CONFIG.POIDS_POSITION) .. " (dist:" .. distance .. ")", "DEBUG")
    end
    
    -- ========================================
    -- 5. FINISH KILL (10%)
    -- ========================================
    local targetHealthPercent = target.lifePoints / target.maxLifePoints
    local scoreFinish = 0
    
    if targetHealthPercent < CONFIG.SEUIL_VIE_FOCUS then
        -- Cible basse
        scoreFinish = 200
        
        -- Bonus massif si on peut tuer
        if degatsEstimes >= target.lifePoints then
            scoreFinish = scoreFinish + 500
        end
    elseif targetHealthPercent < CONFIG.SEUIL_VIE_OVERKILL then
        -- Cible très basse, probablement overkill
        scoreFinish = -100
    end
    
    score = score + (scoreFinish * CONFIG.POIDS_FINISH)
    
    if DEBUG.LOG_CALCULS then
        log("COMBAT_CALC", "  Score finish: " .. math.floor(scoreFinish * CONFIG.POIDS_FINISH) .. " (vie:" .. math.floor(targetHealthPercent * 100) .. "%)", "DEBUG")
    end
    
    -- ========================================
    -- 6. BONUS SPÉCIAUX
    -- ========================================
    
    -- VOL DE VIE en mode survie
    if spell.hasLifeSteal then
        local casterHealth = caster.lifePoints / caster.maxLifePoints
        if casterHealth < CONFIG.SEUIL_VIE_CRITIQUE then
            score = score + 500  -- PRIORITÉ ABSOLUE
            if DEBUG.LOG_CALCULS then
                log("COMBAT_CALC", "  Bonus SURVIE vol de vie: +500", "DEBUG")
            end
        elseif casterHealth < CONFIG.SEUIL_VIE_PRECAUTION then
            score = score + 200
        end
    end
    
    -- AoE - bonus par cible touchée
    if spell.isAoE then
        local enemiesInRange = self:countEnemiesInAoE(spell, target.cellId)
        if enemiesInRange > 1 then
            local bonusAoE = (enemiesInRange - 1) * 150
            score = score + bonusAoE
            if DEBUG.LOG_CALCULS then
                log("COMBAT_CALC", "  Bonus AoE: +" .. bonusAoE .. " (" .. enemiesInRange .. " cibles)", "DEBUG")
            end
        end
    end
    
    -- Arrondir score final
    score = math.floor(score)
    
    if DEBUG.LOG_CALCULS then
        log("COMBAT_CALC", "SCORE FINAL: " .. score .. " pour " .. (spell.name or "Sort") .. " sur " .. (target.name or "Cible"), "DEBUG")
    end
    
    return score
end

-- ============================================
-- VÉRIFICATIONS
-- ============================================

function CombatCalculator:canCastSpellBasic(spell, target, caster)
    -- Vérifier PA
    if caster.AP < (spell.apCost or 0) then
        return false
    end
    
    -- Vérifier portée
    local distance = cellsDistance(caster.cellId, target.cellId)
    if distance < (spell.minRange or 0) or distance > (spell.maxRange or 12) then
        return false
    end
    
    -- Vérifier LoS
    if spell.needsLoS ~= false then  -- Par défaut, on suppose que LoS est nécessaire
        if not MapAnalyzer:hasLineOfSight(caster.cellId, target.cellId) then
            return false
        end
    end
    
    -- Vérifier si cible valide
    if spell.targetType == "ally" and target.team ~= caster.team then
        return false
    end
    
    if spell.targetType == "enemy" and target.team == caster.team then
        return false
    end
    
    return true
end

-- ============================================
-- UTILITAIRES AoE
-- ============================================

function CombatCalculator:countEnemiesInAoE(spell, centerCell)
    local count = 0
    local ennemis = fighters()
    local aoeCells = {}
    
    -- Calculer cellules AoE selon type
    if spell.aoeType == "circle" then
        aoeCells = circleCells(centerCell, spell.aoeRange or 1)
    elseif spell.aoeType == "cross" then
        aoeCells = crossCells(centerCell, spell.aoeRange or 1)
    elseif spell.aoeType == "square" then
        aoeCells = squareCells(centerCell, spell.aoeRange or 1)
    elseif spell.aoeType == "line" then
        -- TODO: Implémenter si nécessaire
        aoeCells = {}
    end
    
    -- Compter ennemis dans la zone
    for _, ennemi in ipairs(ennemis) do
        if ennemi.team == enum_Team.Defender then
            for _, cell in ipairs(aoeCells) do
                if ennemi.cellId == cell then
                    count = count + 1
                    break
                end
            end
        end
    end
    
    return count
end

function CombatCalculator:getAoETargets(spell, centerCell)
    local targets = {}
    local ennemis = fighters()
    local aoeCells = {}
    
    if spell.aoeType == "circle" then
        aoeCells = circleCells(centerCell, spell.aoeRange or 1)
    elseif spell.aoeType == "cross" then
        aoeCells = crossCells(centerCell, spell.aoeRange or 1)
    elseif spell.aoeType == "square" then
        aoeCells = squareCells(centerCell, spell.aoeRange or 1)
    end
    
    for _, ennemi in ipairs(ennemis) do
        if ennemi.team == enum_Team.Defender then
            for _, cell in ipairs(aoeCells) do
                if ennemi.cellId == cell then
                    table.insert(targets, ennemi)
                    break
                end
            end
        end
    end
    
    return targets
end

-- ============================================
-- ANALYSE OPTIMALE
-- ============================================

function CombatCalculator:findBestSpellForTarget(spellList, target, caster)
    local bestSpell = nil
    local bestScore = -1
    
    for _, spell in ipairs(spellList) do
        if not spell.isBuff and not spell.isSummon then
            local score = self:scoreSpell(spell, target, caster)
            
            if score > bestScore then
                bestScore = score
                bestSpell = spell
            end
        end
    end
    
    return bestSpell, bestScore
end

function CombatCalculator:findBestTarget(spellList, caster)
    local ennemis = fighters()
    local bestTarget = nil
    local bestSpell = nil
    local bestScore = -1
    
    for _, ennemi in ipairs(ennemis) do
        if ennemi.team == enum_Team.Defender then
            local spell, score = self:findBestSpellForTarget(spellList, ennemi, caster)
            
            if score > bestScore then
                bestScore = score
                bestTarget = ennemi
                bestSpell = spell
            end
        end
    end
    
    return bestTarget, bestSpell, bestScore
end

-- ============================================
-- STATISTIQUES
-- ============================================

function CombatCalculator:estimeTempsKill(target, caster, spellList)
    local degatsParTour = 0
    
    -- Calculer DPS moyen avec sorts disponibles
    for _, spell in ipairs(spellList) do
        if not spell.isBuff and not spell.isSummon then
            local degats = self:calculerDegatsTheorique(spell, caster, target)
            degatsParTour = degatsParTour + degats
        end
    end
    
    if degatsParTour <= 0 then
        return 999
    end
    
    local toursNecessaires = math.ceil(target.lifePoints / degatsParTour)
    return toursNecessaires
end

return CombatCalculator