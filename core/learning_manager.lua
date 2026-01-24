-- ============================================
-- LEARNING MANAGER - Système d'apprentissage
-- Support résistances négatives (-100% à +100%)
-- ============================================

LearningManager = {}

LearningManager.cache = {}
LearningManager.currentCombat = {}

-- ============================================
-- INITIALISATION
-- ============================================

function LearningManager:init()
    if not APPRENTISSAGE.ENABLED then
        log("LEARNING", "Apprentissage désactivé")
        return
    end
    
    log("LEARNING", "Initialisation système apprentissage")
    log("LEARNING", "Support résistances: -100% → +100%")
    
    self:chargerDonnees()
    
    self.currentCombat = {
        monstres = {},
        debut = global.timestamp(),
        tour = 0,
        victoire = false
    }
end

-- ============================================
-- CHARGEMENT/SAUVEGARDE
-- ============================================

function LearningManager:chargerDonnees()
    local fichier = io.open(APPRENTISSAGE.FICHIER, "r")
    
    if fichier then
        local contenu = fichier:read("*a")
        fichier:close()
        
        if contenu and contenu ~= "" then
            local donnees = JSON:decode(contenu)
            
            if donnees and donnees.monsters then
                self.cache = donnees.monsters
                local count = self:compterMonstres()
                log("LEARNING", "Données chargées: " .. count .. " types de monstres")
                
                local fiables = 0
                for _, monstre in pairs(self.cache) do
                    if monstre.combats_total >= APPRENTISSAGE.MIN_SAMPLES then
                        fiables = fiables + 1
                    end
                end
                log("LEARNING", "Monstres fiables: " .. fiables .. "/" .. count)
            else
                log("LEARNING", "Fichier corrompu, réinitialisation")
                self.cache = {}
            end
        else
            log("LEARNING", "Fichier vide, initialisation")
            self.cache = {}
        end
    else
        log("LEARNING", "Création nouveau fichier apprentissage")
        self.cache = {}
        self:sauvegarderDonnees()
    end
end

function LearningManager:sauvegarderDonnees()
    local donnees = {
        version = "2.0.0",
        last_update = global.timestamp(),
        support_negative_resist = true,
        monsters = self.cache
    }
    
    local json = JSON:encode(donnees)
    
    local fichier = io.open(APPRENTISSAGE.FICHIER, "w")
    if fichier then
        fichier:write(json)
        fichier:close()
        log("LEARNING", "Sauvegarde OK: " .. self:compterMonstres() .. " monstres", "SUCCESS")
        return true
    else
        log("LEARNING", "❌ Erreur sauvegarde", "ERROR")
        return false
    end
end

-- ============================================
-- ANALYSE COMBAT
-- ============================================

function LearningManager:analyserMonstre(fighter)
    if not APPRENTISSAGE.ENABLED then return end
    if fighter.team ~= enum_Team.Defender then return end
    
    local monstreId = fighter.creatureGenericId
    if not monstreId or monstreId == 0 then
        log("LEARNING", "Monstre sans ID valide: " .. (fighter.name or "Inconnu"), "DEBUG")
        return
    end
    
    -- Extraire résistances (peuvent être négatives!)
    local donneesMonstre = {
        id = monstreId,
        nom = fighter.name or "Inconnu",
        niveau = fighter.level or 0,
        timestamp = global.timestamp(),
        
        resistances = {
            neutral = math.max(CONFIG.MIN_RESISTANCE_PERCENT, math.min(100, fighter.stats.neutralResistPercent or 0)),
            earth = math.max(CONFIG.MIN_RESISTANCE_PERCENT, math.min(100, fighter.stats.earthResistPercent or 0)),
            fire = math.max(CONFIG.MIN_RESISTANCE_PERCENT, math.min(100, fighter.stats.fireResistPercent or 0)),
            water = math.max(CONFIG.MIN_RESISTANCE_PERCENT, math.min(100, fighter.stats.waterResistPercent or 0)),
            air = math.max(CONFIG.MIN_RESISTANCE_PERCENT, math.min(100, fighter.stats.airResistPercent or 0)),
        },
        
        stats = {
            vie_max = fighter.maxLifePoints or 0,
            vie_actuelle = fighter.lifePoints or 0,
            pa = fighter.AP or 0,
            pm = fighter.MP or 0,
            po = fighter.Range or 0,
        }
    }
    
    -- Ajouter au combat actuel
    if not self.currentCombat.monstres[monstreId] then
        self.currentCombat.monstres[monstreId] = {}
    end
    
    table.insert(self.currentCombat.monstres[monstreId], donneesMonstre)
    
    -- Update temps réel
    if APPRENTISSAGE.UPDATE_REAL_TIME then
        self:integrerDonnees(monstreId, donneesMonstre)
    end
    
    log("LEARNING", "Analysé: " .. donneesMonstre.nom .. " (ID:" .. monstreId .. ")", "DEBUG")
end

function LearningManager:analyserTousMonstres()
    local allFighters = fighters()
    local count = 0
    
    for _, fighter in ipairs(allFighters) do
        if fighter.team == enum_Team.Defender then
            self:analyserMonstre(fighter)
            count = count + 1
        end
    end
    
    if count > 0 then
        log("LEARNING", "Analyse: " .. count .. " monstres détectés", "DEBUG")
    end
end

-- ============================================
-- INTÉGRATION DONNÉES
-- ============================================

function LearningManager:integrerDonnees(monstreId, nouvelleDonnee)
    -- Initialiser si nouveau
    if not self.cache[monstreId] then
        self.cache[monstreId] = {
            id = monstreId,
            nom = nouvelleDonnee.nom,
            niveau = nouvelleDonnee.niveau,
            combats_total = 0,
            
            resistances_moy = {
                neutral = 0, earth = 0, fire = 0, water = 0, air = 0
            },
            
            resistances_min = {
                neutral = 100, earth = 100, fire = 100, water = 100, air = 100
            },
            
            resistances_max = {
                neutral = -100, earth = -100, fire = -100, water = -100, air = -100
            },
            
            stats_moy = {
                vie_max = 0, pa = 0, pm = 0, po = 0
            },
            
            historique = {},
            derniere_maj = 0
        }
        
        log("LEARNING", "Nouveau monstre découvert: " .. nouvelleDonnee.nom, "SUCCESS")
    end
    
    local monstre = self.cache[monstreId]
    monstre.combats_total = monstre.combats_total + 1
    monstre.derniere_maj = global.timestamp()
    
    local n = monstre.combats_total
    
    -- Calculer moyennes mobiles (résistances négatives supportées!)
    for element, valeur in pairs(nouvelleDonnee.resistances) do
        -- Moyenne
        monstre.resistances_moy[element] = 
            ((monstre.resistances_moy[element] * (n - 1)) + valeur) / n
        
        -- Min/Max
        monstre.resistances_min[element] = math.min(monstre.resistances_min[element], valeur)
        monstre.resistances_max[element] = math.max(monstre.resistances_max[element], valeur)
    end
    
    -- Stats
    for stat, valeur in pairs(nouvelleDonnee.stats) do
        if monstre.stats_moy[stat] then
            monstre.stats_moy[stat] = 
                ((monstre.stats_moy[stat] * (n - 1)) + valeur) / n
        end
    end
    
    -- Historique (max 100)
    table.insert(monstre.historique, {
        timestamp = nouvelleDonnee.timestamp,
        resistances = nouvelleDonnee.resistances,
        stats = nouvelleDonnee.stats
    })
    
    if #monstre.historique > 100 then
        table.remove(monstre.historique, 1)
    end
    
    log("LEARNING", monstre.nom .. " MAJ: " .. n .. " combats (var:" .. math.floor(self:calculerVarianceMoyenne(monstre)) .. "%)", "DEBUG")
end

-- ============================================
-- RÉCUPÉRATION DONNÉES
-- ============================================

function LearningManager:obtenirResistances(monstreId)
    if not self.cache[monstreId] then
        log("LEARNING", "Monstre ID " .. monstreId .. " inconnu", "DEBUG")
        return nil
    end
    
    local monstre = self.cache[monstreId]
    local fiable = monstre.combats_total >= APPRENTISSAGE.MIN_SAMPLES
    local confiance = self:calculerConfiance(monstre)
    
    return {
        resistances = monstre.resistances_moy,
        min = monstre.resistances_min,
        max = monstre.resistances_max,
        variance = self:calculerVariance(monstre),
        variance_moy = self:calculerVarianceMoyenne(monstre),
        fiable = fiable,
        combats = monstre.combats_total,
        confiance = confiance
    }
end

function LearningManager:calculerVariance(monstre)
    local variance = {
        neutral = monstre.resistances_max.neutral - monstre.resistances_min.neutral,
        earth = monstre.resistances_max.earth - monstre.resistances_min.earth,
        fire = monstre.resistances_max.fire - monstre.resistances_min.fire,
        water = monstre.resistances_max.water - monstre.resistances_min.water,
        air = monstre.resistances_max.air - monstre.resistances_min.air,
    }
    
    return variance
end

function LearningManager:calculerVarianceMoyenne(monstre)
    local variance = self:calculerVariance(monstre)
    local total = variance.neutral + variance.earth + variance.fire + variance.water + variance.air
    return total / 5
end

function LearningManager:calculerConfiance(monstre)
    if monstre.combats_total < APPRENTISSAGE.MIN_SAMPLES then
        return monstre.combats_total / APPRENTISSAGE.MIN_SAMPLES
    end
    
    -- Confiance basée sur variance
    local varianceMoy = self:calculerVarianceMoyenne(monstre)
    
    -- Si variance <= tolérance = 100% confiance
    if varianceMoy <= APPRENTISSAGE.TOLERANCE_VARIANCE then
        return 1.0
    end
    
    -- Sinon, confiance décroît avec variance
    -- Formule: confiance = 1 - (variance_excedent / 100)
    local varianceExcedent = varianceMoy - APPRENTISSAGE.TOLERANCE_VARIANCE
    local confiance = 1.0 - (varianceExcedent / 100)
    
    return math.max(0, math.min(1.0, confiance))
end

function LearningManager:getMeilleurElement(monstreId)
    local donnees = self:obtenirResistances(monstreId)
    if not donnees then return nil end
    
    local resistances = donnees.resistances
    local meilleurElement = ELEMENTS.NEUTRE
    local resistanceMin = 100
    
    for element, valeur in pairs(resistances) do
        if valeur < resistanceMin then
            resistanceMin = valeur
            meilleurElement = element
        end
    end
    
    return meilleurElement, resistanceMin
end

function LearningManager:getPireElement(monstreId)
    local donnees = self:obtenirResistances(monstreId)
    if not donnees then return nil end
    
    local resistances = donnees.resistances
    local pireElement = ELEMENTS.NEUTRE
    local resistanceMax = -100
    
    for element, valeur in pairs(resistances) do
        if valeur > resistanceMax then
            resistanceMax = valeur
            pireElement = element
        end
    end
    
    return pireElement, resistanceMax
end

-- ============================================
-- FIN DE COMBAT
-- ============================================

function LearningManager:finCombat(victoire)
    if not APPRENTISSAGE.ENABLED then return end
    
    self.currentCombat.victoire = victoire or false
    
    -- Intégrer toutes les données si pas en temps réel
    if not APPRENTISSAGE.UPDATE_REAL_TIME then
        for monstreId, donnees in pairs(self.currentCombat.monstres) do
            for _, donnee in ipairs(donnees) do
                self:integrerDonnees(monstreId, donnee)
            end
        end
    end
    
    -- Sauvegarder
    if APPRENTISSAGE.SAUVEGARDER_CHAQUE_COMBAT then
        self:sauvegarderDonnees()
    end
    
    -- Résumé
    local nbTypes = 0
    for _ in pairs(self.currentCombat.monstres) do
        nbTypes = nbTypes + 1
    end
    
    log("LEARNING", "Fin combat - " .. nbTypes .. " types analysés", "SUCCESS")
    
    -- Reset combat actuel
    self.currentCombat = {
        monstres = {},
        debut = global.timestamp(),
        tour = 0,
        victoire = false
    }
end

-- ============================================
-- UTILITÉS
-- ============================================

function LearningManager:compterMonstres()
    local count = 0
    for _ in pairs(self.cache) do
        count = count + 1
    end
    return count
end

function LearningManager:afficherStats()
    console.print("========================================")
    console.print("=== APPRENTISSAGE - STATISTIQUES ===")
    console.print("========================================")
    console.print("Monstres répertoriés: " .. self:compterMonstres())
    console.print("")
    
    local monstresAffiches = 0
    for id, monstre in pairs(self.cache) do
        if monstre.combats_total >= APPRENTISSAGE.MIN_SAMPLES then
            local confiance = self:calculerConfiance(monstre)
            local varianceMoy = self:calculerVarianceMoyenne(monstre)
            
            console.print("• " .. monstre.nom .. " (ID:" .. id .. ")")
            console.print("  Combats: " .. monstre.combats_total)
            console.print("  Confiance: " .. math.floor(confiance * 100) .. "%")
            console.print("  Variance: ±" .. math.floor(varianceMoy) .. "%")
            
            -- Résistances moyennes
            console.print("  Résistances moyennes:")
            for element, valeur in pairs(monstre.resistances_moy) do
                local formattedValue = string.format("%+.1f%%", valeur)
                console.print("    " .. element .. ": " .. formattedValue)
            end
            
            console.print("")
            monstresAffiches = monstresAffiches + 1
        end
    end
    
    if monstresAffiches == 0 then
        console.print("Aucun monstre avec données fiables")
        console.print("(minimum " .. APPRENTISSAGE.MIN_SAMPLES .. " combats requis)")
    end
    
    console.print("========================================")
end

function LearningManager:afficherMonstre(monstreId)
    if not self.cache[monstreId] then
        console.error("Monstre ID " .. monstreId .. " inconnu")
        return
    end
    
    local monstre = self.cache[monstreId]
    local confiance = self:calculerConfiance(monstre)
    local variance = self:calculerVariance(monstre)
    
    console.print("========================================")
    console.print("=== " .. monstre.nom .. " (ID:" .. monstreId .. ") ===")
    console.print("========================================")
    console.print("Combats: " .. monstre.combats_total)
    console.print("Niveau moyen: " .. math.floor(monstre.niveau))
    console.print("Confiance: " .. math.floor(confiance * 100) .. "%")
    console.print("")
    
    console.print("Résistances moyennes:")
    for element, valeur in pairs(monstre.resistances_moy) do
        local min = monstre.resistances_min[element]
        local max = monstre.resistances_max[element]
        local var = variance[element]
        
        console.print(string.format("  %s: %+.1f%% (min:%+.0f%% max:%+.0f%% var:%.0f%%)", 
            element, valeur, min, max, var))
    end
    
    console.print("")
    console.print("Stats moyennes:")
    console.print("  Vie max: " .. math.floor(monstre.stats_moy.vie_max))
    console.print("  PA: " .. math.floor(monstre.stats_moy.pa))
    console.print("  PM: " .. math.floor(monstre.stats_moy.pm))
    console.print("  PO: " .. math.floor(monstre.stats_moy.po))
    console.print("========================================")
end

function LearningManager:exporterJSON(fichierSortie)
    fichierSortie = fichierSortie or (script.folder() .. "\\data\\monsters_export.json")
    
    local export = {
        version = "2.0.0",
        date_export = os.date("%Y-%m-%d %H:%M:%S"),
        timestamp = global.timestamp(),
        total_monstres = self:compterMonstres(),
        monsters = self.cache
    }
    
    local json = JSON:encode(export)
    
    local fichier = io.open(fichierSortie, "w")
    if fichier then
        fichier:write(json)
        fichier:close()
        log("LEARNING", "Export JSON OK: " .. fichierSortie, "SUCCESS")
        return true
    else
        log("LEARNING", "Erreur export JSON", "ERROR")
        return false
    end
end

function LearningManager:resetMonstre(monstreId)
    if self.cache[monstreId] then
        self.cache[monstreId] = nil
        log("LEARNING", "Monstre ID " .. monstreId .. " supprimé", "SUCCESS")
        self:sauvegarderDonnees()
        return true
    else
        log("LEARNING", "Monstre ID " .. monstreId .. " inconnu", "ERROR")
        return false
    end
end

function LearningManager:resetTout()
    self.cache = {}
    log("LEARNING", "Toutes les données supprimées", "SUCCESS")
    self:sauvegarderDonnees()
end

return LearningManager