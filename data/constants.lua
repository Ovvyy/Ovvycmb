-- ============================================
-- CONSTANTS - Configuration Globale
-- Team Niveau 200 - Style Équilibré
-- ============================================

-- === CONFIGURATION COMBAT ===
CONFIG = {
    DISTANCE_SECURITE = 8,
    DISTANCE_OPTIMALE_CRA = 10,
    DISTANCE_MAX_CRA = 12,
    DISTANCE_MIN_CRA = 2,
    DISTANCE_CRITIQUE = 3,
    DISTANCE_OPTIMALE_ENU = 6,
    DISTANCE_MAX_ENU = 8,
    SEUIL_VIE_CRITIQUE = 0.30,
    SEUIL_VIE_PRECAUTION = 0.50,
    SEUIL_VIE_OPTIMAL = 0.70,
    SEUIL_PM_CRITIQUE = 3,
    SEUIL_VIE_FOCUS = 0.35,
    SEUIL_VIE_OVERKILL = 0.15,
    MIN_PA_POUR_TAPER = 2,
    DUREE_MIN_BUFF = 3,
    MAX_TENTATIVES_ACTION = 3,
    MAX_TOURS_COMBAT = 30,
    TIMEOUT_CALCUL_MS = 5000,
    TOUJOURS_TAPER = true,
    PRIORITE_SURVIE = true,
    PRIORITE_FINISH = true,
    POIDS_DEGATS = 0.35,
    POIDS_SECURITE = 0.30,
    POIDS_EFFICACITE_PA = 0.15,
    POIDS_POSITION = 0.10,
    POIDS_FINISH = 0.10,
    MAX_RESISTANCE_PERCENT_JOUEUR = 50,
    MAX_RESISTANCE_PERCENT_SUMMON = 100,
    MIN_RESISTANCE_PERCENT = -100,
}

-- === PROFILS ===
PROFILS = {
    EQUILIBRE = {
        DISTANCE_SECURITE = 8,
        PRIORITE_SURVIE = true,
        POIDS_DEGATS = 0.35,
        POIDS_SECURITE = 0.30,
        POIDS_EFFICACITE_PA = 0.15,
        POIDS_POSITION = 0.10,
        POIDS_FINISH = 0.10
    },
    AGRESSIF = {
        DISTANCE_SECURITE = 6,
        PRIORITE_SURVIE = false,
        POIDS_DEGATS = 0.60,
        POIDS_SECURITE = 0.10,
        POIDS_EFFICACITE_PA = 0.15,
        POIDS_POSITION = 0.10,
        POIDS_FINISH = 0.05
    },
    DEFENSIF = {
        DISTANCE_SECURITE = 10,
        PRIORITE_SURVIE = true,
        POIDS_DEGATS = 0.20,
        POIDS_SECURITE = 0.50,
        POIDS_EFFICACITE_PA = 0.10,
        POIDS_POSITION = 0.15,
        POIDS_FINISH = 0.05
    }
}

PROFIL_ACTIF = "EQUILIBRE"

-- === IDs ===
BREED_CRA = 9
BREED_ENUTROF = 3

BUFFS = {
    CUPIDITE = 0,
    TIR_PUISSANT = 0,
    TIR_ELOIGNE = 0,
    MAITRISE_ARC = 0,
}

ETATS = {
    RETRAIT_PM = 0,
    RETRAIT_PO = 0,
    INVULNERABLE = 0,
    INVISIBLE = 0,
    RETRAIT_PA = 0,
}

-- === ÉLÉMENTS ===
ELEMENTS = {
    NEUTRE = "neutral",
    FEU = "fire",
    EAU = "water",
    TERRE = "earth",
    AIR = "air"
}

ELEMENT_TO_STAT = {
    ["neutral"] = "strength",
    ["fire"] = "intelligence",
    ["water"] = "chance",
    ["earth"] = "strength",
    ["air"] = "agility"
}

-- === DEBUG ===
DEBUG = {
    ENABLED = true,
    VERBOSE = false,
    LOG_CALCULS = true,
    LOG_MOUVEMENTS = true,
    LOG_DEGATS = true,
    LOG_RESISTANCES = true,
    EXPORT_STATS = true,
}

-- === APPRENTISSAGE ===
APPRENTISSAGE = {
    ENABLED = true,
    FICHIER = script.folder() .. "\\data\\monsters_data.json",
    MIN_SAMPLES = 5,
    CONFIANCE_SEUIL = 0.80,
    UPDATE_REAL_TIME = true,
    TOLERANCE_VARIANCE = 15,
    SAUVEGARDER_CHAQUE_COMBAT = true,
}

-- === STATS GLOBALES ===
STATS_GLOBALES = {
    combats_total = 0,
    combats_victoires = 0,
    combats_defaites = 0,
    tours_moyen = 0,
    tours_total = 0,
    degats_total = 0,
    degats_recus_total = 0,
    vie_perdue_total = 0,
    sorts_lances = {},
    monstres_tues = {},
    temps_combat_total = 0,
    derniere_maj = 0,
}

-- ============================================
-- FONCTIONS
-- ============================================

function chargerProfil(nomProfil)
    if PROFILS[nomProfil] then
        for key, value in pairs(PROFILS[nomProfil]) do
            CONFIG[key] = value
        end
        if console and console.print then
            console.print("[CONFIG] Profil chargé: " .. nomProfil)
        end
        return true
    end
    return false
end

function validerConstantes()
    local erreurs = {}
    
    if CONFIG.DISTANCE_MIN_CRA >= CONFIG.DISTANCE_MAX_CRA then
        table.insert(erreurs, "DISTANCE_MIN_CRA >= DISTANCE_MAX_CRA")
    end
    
    if CONFIG.DISTANCE_OPTIMALE_CRA > CONFIG.DISTANCE_MAX_CRA then
        table.insert(erreurs, "DISTANCE_OPTIMALE_CRA > DISTANCE_MAX_CRA")
    end
    
    if CONFIG.SEUIL_VIE_CRITIQUE >= CONFIG.SEUIL_VIE_PRECAUTION then
        table.insert(erreurs, "SEUIL_VIE_CRITIQUE >= SEUIL_VIE_PRECAUTION")
    end
    
    local totalPoids = CONFIG.POIDS_DEGATS + CONFIG.POIDS_SECURITE + 
                       CONFIG.POIDS_EFFICACITE_PA + CONFIG.POIDS_POSITION + 
                       CONFIG.POIDS_FINISH
    
    if math.abs(totalPoids - 1.0) > 0.01 then
        table.insert(erreurs, "Total poids scoring != 1.0")
    end
    
    if #erreurs > 0 then
        if console and console.error then
            console.error("❌ ERREURS CONSTANTES:")
            for _, erreur in ipairs(erreurs) do
                console.error("  - " .. erreur)
            end
        end
        return false
    end
    
    if console and console.print then
        console.print("[CONFIG] ✅ Validation OK")
    end
    return true
end

function log(module, message, niveau)
    niveau = niveau or "INFO"
    
    if not DEBUG.ENABLED then return end
    if niveau == "DEBUG" and not DEBUG.VERBOSE then return end
    
    if not console or not console.print then return end
    
    local prefix = "[" .. module .. "] "
    
    if niveau == "ERROR" and console.error then
        console.error(prefix .. message)
    elseif niveau == "SUCCESS" and console.print then
        console.print(prefix .. message)
    else
        console.print(prefix .. message)
    end
end

function exporterStats()
    if not DEBUG.EXPORT_STATS then return end
    if not JSON then return end
    
    STATS_GLOBALES.derniere_maj = global.timestamp()
    
    if STATS_GLOBALES.combats_total > 0 then
        STATS_GLOBALES.tours_moyen = STATS_GLOBALES.tours_total / STATS_GLOBALES.combats_total
    end
    
    local statsJson = JSON:encode(STATS_GLOBALES)
    local fichier = io.open(script.folder() .. "\\data\\stats_combat.json", "w")
    
    if fichier then
        fichier:write(statsJson)
        fichier:close()
    end
end

function afficherStatsConsole()
    if not console or not console.print then return end
    
    console.print("========================================")
    console.print("=== STATISTIQUES GLOBALES ===")
    console.print("========================================")
    console.print("Combats total: " .. STATS_GLOBALES.combats_total)
    console.print("Victoires: " .. STATS_GLOBALES.combats_victoires)
    console.print("Défaites: " .. STATS_GLOBALES.combats_defaites)
    
    if STATS_GLOBALES.combats_total > 0 then
        local tauxVictoire = (STATS_GLOBALES.combats_victoires / STATS_GLOBALES.combats_total) * 100
        console.print("Taux victoire: " .. math.floor(tauxVictoire) .. "%")
    end
    
    console.print("========================================")
end

function chargerStatsExistantes()
    if not JSON then return end
    
    local fichier = io.open(script.folder() .. "\\data\\stats_combat.json", "r")
    
    if fichier then
        local contenu = fichier:read("*a")
        fichier:close()
        
        if contenu and contenu ~= "" then
            local success, stats = pcall(function()
                return JSON:decode(contenu)
            end)
            
            if success and stats then
                STATS_GLOBALES = stats
            end
        end
    end
end

function initialiserConstants()
    if not console or not console.print then return false end
    
    console.print("[CONFIG] === INITIALISATION ===")
    console.print("[CONFIG] Niveau: 200 | Profil: " .. PROFIL_ACTIF)
    
    chargerProfil(PROFIL_ACTIF)
    
    if not validerConstantes() then
        return false
    end
    
    console.print("[CONFIG] Distance sécurité: " .. CONFIG.DISTANCE_SECURITE)
    console.print("[CONFIG] Distance optimale Cra: " .. CONFIG.DISTANCE_OPTIMALE_CRA)
    console.print("[CONFIG] Apprentissage: " .. (APPRENTISSAGE.ENABLED and "ON" or "OFF"))
    
    chargerStatsExistantes()
    
    console.print("[CONFIG] ✅ Initialisation terminée")
    return true
end