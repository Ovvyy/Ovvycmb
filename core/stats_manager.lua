-- ============================================
-- STATS MANAGER - Gestion dynamique des stats
-- Tracking temps réel des buffs/debuffs
-- Adaptation automatique aux changements
-- ============================================

StatsManager = {}

-- Cache des stats avec timestamp
StatsManager.cache = {
    lastUpdate = 0,
    stats = {},
    buffs = {},
    debuffs = {}
}

-- Durée cache (ms) - court pour être réactif
StatsManager.CACHE_DURATION = 100

-- ============================================
-- RÉCUPÉRATION STATS RÉELLES
-- ============================================

function StatsManager:getRealStats(fighter)
    if not fighter then
        log("STATS", "Fighter invalide", "ERROR")
        return self:getDefaultStats()
    end
    
    local now = global.timestamp()
    local cacheKey = fighter.id
    
    -- Vérifier cache (très court TTL pour temps réel)
    if self.cache.stats[cacheKey] and 
       (now - self.cache.lastUpdate) < self.CACHE_DURATION then
        return self.cache.stats[cacheKey]
    end
    
    -- Calculer stats réelles
    local stats = {
        -- Stats de base
        intelligence = fighter.stats.intelligence or 0,
        strength = fighter.stats.strength or 0,
        chance = fighter.stats.chance or 0,
        agility = fighter.stats.agility or 0,
        
        -- Puissance de base
        basePower = fighter.stats.power or 0,
        
        -- Puissance RÉELLE (base + buffs dynamiques)
        power = self:calculateRealPower(fighter),
        
        -- PV
        currentHP = fighter.lifePoints or 0,
        maxHP = fighter.maxLifePoints or 1,
        
        -- PA/PM/PO
        ap = fighter.AP or 0,
        mp = fighter.MP or 0,
        range = fighter.Range or 0,
        
        -- Dommages fixes
        fixedDamage = fighter.stats.damageReflection or 0,
        
        -- Résistances (peuvent être négatives)
        fireResist = fighter.stats.fireResistPercent or 0,
        waterResist = fighter.stats.waterResistPercent or 0,
        earthResist = fighter.stats.earthResistPercent or 0,
        airResist = fighter.stats.airResistPercent or 0,
        neutralResist = fighter.stats.neutralResistPercent or 0,
        
        -- Métadonnées
        lastUpdate = now,
        fighterId = fighter.id
    }
    
    -- Mettre en cache
    self.cache.stats[cacheKey] = stats
    self.cache.lastUpdate = now
    
    if DEBUG.LOG_CALCULS then
        log("STATS", string.format(
            "%s: INT:%d STR:%d AGI:%d CHA:%d | Puissance:%d (base:%d)",
            fighter.name or "Fighter",
            stats.intelligence,
            stats.strength,
            stats.agility,
            stats.chance,
            stats.power,
            stats.basePower
        ), "DEBUG")
    end
    
    return stats
end

-- ============================================
-- CALCUL PUISSANCE RÉELLE (DYNAMIQUE)
-- ============================================

function StatsManager:calculateRealPower(fighter)
    local basePower = fighter.stats.power or 0
    local bonusPower = 0
    
    -- Analyser les buffs actifs
    local activeBuffs = self:getActiveBuffs(fighter)
    
    for _, buff in ipairs(activeBuffs) do
        if buff.type == "power" then
            bonusPower = bonusPower + (buff.value or 0)
            
            if DEBUG.LOG_CALCULS then
                log("STATS", string.format(
                    "Buff puissance détecté: +%d de %s (reste %d tours)",
                    buff.value,
                    buff.source or "Inconnu",
                    buff.turnsRemaining or 0
                ), "DEBUG")
            end
        end
    end
    
    local totalPower = basePower + bonusPower
    
    if bonusPower > 0 then
        log("STATS", string.format(
            "Puissance réelle: %d (base:%d + buffs:%d)",
            totalPower,
            basePower,
            bonusPower
        ), "DEBUG")
    end
    
    return totalPower
end

-- ============================================
-- DÉTECTION BUFFS ACTIFS
-- ============================================

function StatsManager:getActiveBuffs(fighter)
    local buffs = {}
    
    -- Méthode 1: Parser les effets actifs du fighter
    if fighter.effects then
        for _, effect in ipairs(fighter.effects) do
            local buff = self:parseEffect(effect, fighter)
            if buff then
                table.insert(buffs, buff)
            end
        end
    end
    
    -- Méthode 2: Détecter via comparaison stats
    -- Si power > basePower, il y a un buff
    local basePower = fighter.stats.basePower or fighter.stats.power or 0
    local currentPower = fighter.stats.power or 0
    
    if currentPower > basePower then
        local diff = currentPower - basePower
        
        -- Vérifier si c'est un buff connu (Flèche Assaillante = +50)
        if diff == 50 then
            table.insert(buffs, {
                type = "power",
                value = 50,
                source = "Flèche Assaillante",
                turnsRemaining = self:estimateBuffDuration(fighter, "power_50")
            })
        else
            -- Buff inconnu
            table.insert(buffs, {
                type = "power",
                value = diff,
                source = "Buff inconnu",
                turnsRemaining = 3  -- Estimation
            })
        end
    end
    
    -- Méthode 3: Tracking manuel (voir trackBuff ci-dessous)
    local trackedBuffs = self:getTrackedBuffs(fighter.id)
    for _, buff in ipairs(trackedBuffs) do
        table.insert(buffs, buff)
    end
    
    return buffs
end

function StatsManager:parseEffect(effect, fighter)
    -- Parser un effet actif
    -- Structure dépend de l'API Frigost
    
    if not effect.type then
        return nil
    end
    
    -- Buff de puissance
    if effect.type == "BOOST_POWER" or effect.description and effect.description:match("puissance") then
        return {
            type = "power",
            value = effect.value or 0,
            source = effect.spellName or "Inconnu",
            turnsRemaining = effect.duration or 0
        }
    end
    
    -- Buff de portée
    if effect.type == "BOOST_RANGE" or effect.description and effect.description:match("portée") then
        return {
            type = "range",
            value = effect.value or 0,
            source = effect.spellName or "Inconnu",
            turnsRemaining = effect.duration or 0
        }
    end
    
    -- Buff de caractéristique (INT)
    if effect.type == "BOOST_INTELLIGENCE" or effect.description and effect.description:match("intelligence") then
        return {
            type = "intelligence",
            value = effect.value or 0,
            source = effect.spellName or "Inconnu",
            turnsRemaining = effect.duration or 0
        }
    end
    
    return nil
end

-- ============================================
-- TRACKING MANUEL DES BUFFS
-- ============================================

-- Registre des buffs trackés manuellement
StatsManager.trackedBuffs = {}

function StatsManager:trackBuff(fighterId, buffData)
    if not self.trackedBuffs[fighterId] then
        self.trackedBuffs[fighterId] = {}
    end
    
    -- Ajouter timestamp et tour
    buffData.timestamp = global.timestamp()
    buffData.appliedTurn = currentRound()
    
    table.insert(self.trackedBuffs[fighterId], buffData)
    
    log("STATS", string.format(
        "Buff tracké: %s +%d pour fighter %s",
        buffData.type,
        buffData.value,
        fighterId
    ), "DEBUG")
end

function StatsManager:getTrackedBuffs(fighterId)
    if not self.trackedBuffs[fighterId] then
        return {}
    end
    
    local currentTurn = currentRound()
    local activeBuffs = {}
    
    for i = #self.trackedBuffs[fighterId], 1, -1 do
        local buff = self.trackedBuffs[fighterId][i]
        local turnsElapsed = currentTurn - (buff.appliedTurn or 0)
        local turnsRemaining = (buff.duration or 3) - turnsElapsed
        
        if turnsRemaining > 0 then
            -- Buff encore actif
            buff.turnsRemaining = turnsRemaining
            table.insert(activeBuffs, buff)
        else
            -- Buff expiré, retirer
            table.remove(self.trackedBuffs[fighterId], i)
            log("STATS", "Buff expiré: " .. buff.type, "DEBUG")
        end
    end
    
    return activeBuffs
end

function StatsManager:clearTrackedBuffs(fighterId)
    self.trackedBuffs[fighterId] = nil
end

function StatsManager:clearAllTrackedBuffs()
    self.trackedBuffs = {}
end

-- ============================================
-- ESTIMATION DURÉE BUFFS
-- ============================================

function StatsManager:estimateBuffDuration(fighter, buffType)
    -- Estimer la durée restante d'un buff
    -- Basé sur les patterns connus
    
    if buffType == "power_50" then
        -- Flèche Assaillante: durée typique 3 tours
        return 3
    end
    
    if buffType == "range_7" then
        -- Tirs Éloignés: durée typique 3 tours
        return 3
    end
    
    if buffType == "intelligence_200" then
        -- Cupidité Enutrof: durée typique 3 tours
        return 3
    end
    
    -- Par défaut
    return 2
end

-- ============================================
-- ENREGISTREMENT AUTOMATIQUE BUFFS
-- ============================================

function StatsManager:onSpellCast(spell, caster)
    -- Appelé automatiquement après lancement d'un sort
    
    if spell.hasBuff then
        local buffData = {
            type = spell.buffType or "unknown",
            value = spell.buffValue or 0,
            duration = spell.duration or 3,
            source = spell.name or "Inconnu"
        }
        
        -- Déterminer la cible du buff
        local targetId = caster.id
        if not spell.selfBuff and spell.target == "team" then
            -- Buff d'équipe - tracer pour tous les alliés
            local allies = fighters()
            for _, ally in ipairs(allies) do
                if ally.team == caster.team then
                    self:trackBuff(ally.id, buffData)
                end
            end
        else
            -- Buff personnel
            self:trackBuff(targetId, buffData)
        end
        
        log("STATS", string.format(
            "Buff enregistré: %s lance %s → %s +%d",
            caster.name,
            spell.name,
            buffData.type,
            buffData.value
        ), "SUCCESS")
    end
end

-- ============================================
-- SANTÉ & SEUILS
-- ============================================

function StatsManager:getHealthStatus(fighter)
    local currentHP = fighter.lifePoints or 0
    local maxHP = fighter.maxLifePoints or 1
    local percent = currentHP / maxHP
    
    if percent <= CONFIG.SEUIL_VIE_CRITIQUE then
        return "critical", percent
    elseif percent <= CONFIG.SEUIL_VIE_PRECAUTION then
        return "low", percent
    elseif percent >= CONFIG.SEUIL_VIE_OPTIMAL then
        return "optimal", percent
    else
        return "normal", percent
    end
end

function StatsManager:isInDanger(fighter)
    local status, percent = self:getHealthStatus(fighter)
    return status == "critical" or status == "low"
end

function StatsManager:needsHealing(fighter)
    local status, percent = self:getHealthStatus(fighter)
    return status == "critical"
end

-- ============================================
-- CALCULS AVANCÉS
-- ============================================

function StatsManager:calculateDPS(fighter, spell)
    -- Calculer DPS théorique d'un sort
    local stats = self:getRealStats(fighter)
    local baseDamage = spell.baseDamage or 0
    
    -- Utiliser puissance RÉELLE (avec buffs)
    local power = stats.power
    
    -- Caractéristique selon élément
    local characteristic = 0
    if spell.element == ELEMENTS.FEU then
        characteristic = stats.intelligence
    elseif spell.element == ELEMENTS.EAU then
        characteristic = stats.chance
    elseif spell.element == ELEMENTS.TERRE or spell.element == ELEMENTS.NEUTRE then
        characteristic = stats.strength
    elseif spell.element == ELEMENTS.AIR then
        characteristic = stats.agility
    end
    
    -- Formule Dofus
    local damage = baseDamage * (1 + (power + characteristic) / 100)
    
    -- Avec critique (estimation 50% chance)
    if spell.canCrit then
        damage = damage * 1.25
    end
    
    return math.floor(damage)
end

function StatsManager:compareStats(fighter1, fighter2)
    -- Comparer les stats de deux fighters
    local stats1 = self:getRealStats(fighter1)
    local stats2 = self:getRealStats(fighter2)
    
    return {
        powerDiff = stats1.power - stats2.power,
        hpDiff = stats1.currentHP - stats2.currentHP,
        fighter1Stronger = (stats1.power + stats1.intelligence + stats1.strength + 
                           stats1.agility + stats1.chance) > 
                          (stats2.power + stats2.intelligence + stats2.strength + 
                           stats2.agility + stats2.chance)
    }
end

-- ============================================
-- STATISTIQUES ÉQUIPE
-- ============================================

function StatsManager:getTeamStats()
    local allies = fighters()
    local stats = {
        totalHP = 0,
        totalMaxHP = 0,
        averageHP = 0,
        lowestHP = 1.0,
        lowestHPFighter = nil,
        totalPower = 0,
        averagePower = 0,
        count = 0
    }
    
    for _, ally in ipairs(allies) do
        if ally.team == enum_Team.Attacker then
            stats.count = stats.count + 1
            
            local hp = ally.lifePoints or 0
            local maxHP = ally.maxLifePoints or 1
            local hpPercent = hp / maxHP
            
            stats.totalHP = stats.totalHP + hp
            stats.totalMaxHP = stats.totalMaxHP + maxHP
            
            if hpPercent < stats.lowestHP then
                stats.lowestHP = hpPercent
                stats.lowestHPFighter = ally
            end
            
            local fighterStats = self:getRealStats(ally)
            stats.totalPower = stats.totalPower + fighterStats.power
        end
    end
    
    if stats.count > 0 then
        stats.averageHP = stats.totalHP / stats.totalMaxHP
        stats.averagePower = stats.totalPower / stats.count
    end
    
    return stats
end

-- ============================================
-- BUFFS PRIORITAIRES
-- ============================================

function StatsManager:shouldRefreshBuff(fighter, buffType)
    local activeBuffs = self:getActiveBuffs(fighter)
    
    for _, buff in ipairs(activeBuffs) do
        if buff.type == buffType then
            -- Buff actif, vérifier durée restante
            if buff.turnsRemaining <= CONFIG.DUREE_MIN_BUFF then
                log("STATS", string.format(
                    "Buff %s expire bientôt (%d tours), refresh recommandé",
                    buffType,
                    buff.turnsRemaining
                ), "DEBUG")
                return true
            else
                log("STATS", string.format(
                    "Buff %s encore actif (%d tours restants)",
                    buffType,
                    buff.turnsRemaining
                ), "DEBUG")
                return false
            end
        end
    end
    
    -- Buff pas actif
    log("STATS", "Buff " .. buffType .. " non actif, lancement recommandé", "DEBUG")
    return true
end

function StatsManager:getMissingBuffs(fighter, requiredBuffs)
    -- Déterminer quels buffs manquent
    local missing = {}
    local activeBuffs = self:getActiveBuffs(fighter)
    
    for _, requiredBuff in ipairs(requiredBuffs) do
        local found = false
        
        for _, activeBuff in ipairs(activeBuffs) do
            if activeBuff.type == requiredBuff then
                found = true
                break
            end
        end
        
        if not found then
            table.insert(missing, requiredBuff)
        end
    end
    
    return missing
end

-- ============================================
-- DÉTECTION CHANGEMENTS
-- ============================================

function StatsManager:detectStatsChange(fighter)
    -- Détecter si les stats ont changé depuis dernière vérification
    local currentStats = self:getRealStats(fighter)
    local cacheKey = fighter.id .. "_previous"
    local previousStats = self.cache.stats[cacheKey]
    
    if not previousStats then
        -- Première vérification
        self.cache.stats[cacheKey] = currentStats
        return false, {}
    end
    
    local changes = {}
    
    if currentStats.power ~= previousStats.power then
        table.insert(changes, {
            stat = "power",
            old = previousStats.power,
            new = currentStats.power,
            diff = currentStats.power - previousStats.power
        })
    end
    
    if currentStats.currentHP ~= previousStats.currentHP then
        table.insert(changes, {
            stat = "hp",
            old = previousStats.currentHP,
            new = currentStats.currentHP,
            diff = currentStats.currentHP - previousStats.currentHP
        })
    end
    
    -- Sauvegarder nouvelles stats
    self.cache.stats[cacheKey] = currentStats
    
    return #changes > 0, changes
end

-- ============================================
-- STATS PAR DÉFAUT
-- ============================================

function StatsManager:getDefaultStats()
    return {
        intelligence = 0,
        strength = 0,
        chance = 0,
        agility = 0,
        basePower = 0,
        power = 0,
        currentHP = 1,
        maxHP = 1,
        ap = 0,
        mp = 0,
        range = 0,
        fixedDamage = 0,
        fireResist = 0,
        waterResist = 0,
        earthResist = 0,
        airResist = 0,
        neutralResist = 0,
        lastUpdate = 0,
        fighterId = 0
    }
end

-- ============================================
-- NETTOYAGE
-- ============================================

function StatsManager:clearCache()
    self.cache = {
        lastUpdate = 0,
        stats = {},
        buffs = {},
        debuffs = {}
    }
    log("STATS", "Cache nettoyé", "DEBUG")
end

function StatsManager:reset()
    self:clearCache()
    self:clearAllTrackedBuffs()
    log("STATS", "Stats Manager réinitialisé", "SUCCESS")
end

-- ============================================
-- DEBUG & AFFICHAGE
-- ============================================

function StatsManager:displayStats(fighter)
    local stats = self:getRealStats(fighter)
    
    console.print("========================================")
    console.print("=== STATS: " .. (fighter.name or "Fighter") .. " ===")
    console.print("========================================")
    console.print("PV: " .. stats.currentHP .. "/" .. stats.maxHP .. " (" .. math.floor((stats.currentHP/stats.maxHP)*100) .. "%)")
    console.print("PA: " .. stats.ap .. " | PM: " .. stats.mp .. " | PO: " .. stats.range)
    console.print("")
    console.print("CARACTÉRISTIQUES:")
    console.print("  Intelligence: " .. stats.intelligence)
    console.print("  Force: " .. stats.strength)
    console.print("  Chance: " .. stats.chance)
    console.print("  Agilité: " .. stats.agility)
    console.print("  Puissance: " .. stats.power .. " (base: " .. stats.basePower .. ")")
    console.print("")
    console.print("RÉSISTANCES:")
    console.print("  Feu: " .. stats.fireResist .. "%")
    console.print("  Eau: " .. stats.waterResist .. "%")
    console.print("  Terre: " .. stats.earthResist .. "%")
    console.print("  Air: " .. stats.airResist .. "%")
    console.print("  Neutre: " .. stats.neutralResist .. "%")
    console.print("")
    
    local buffs = self:getActiveBuffs(fighter)
    if #buffs > 0 then
        console.print("BUFFS ACTIFS:")
        for _, buff in ipairs(buffs) do
            console.print(string.format("  • %s: +%d (%d tours restants) [%s]",
                buff.type,
                buff.value,
                buff.turnsRemaining or 0,
                buff.source or "?"
            ))
        end
    else
        console.print("Aucun buff actif")
    end
    
    console.print("========================================")
end

return StatsManager