-- ============================================
-- MAIN - Point d'entrée du script
-- Team: 3x Cra + 1x Enutrof (Niveau 200)
-- ============================================

console.print("========================================")
console.print("=== CHARGEMENT SCRIPT CRA/ENU ===")
console.print("========================================")

-- ============================================
-- HELPER: Normaliser les chemins
-- ============================================

function normalizePath(path)
    -- Remplacer tous les / par des \
    return path:gsub("/", "\\")
end

-- ============================================
-- CHARGEMENT MODULES
-- ============================================

-- Récupérer le dossier du script
local scriptFolder = normalizePath(script.folder())
console.print("[MAIN] Dossier: " .. scriptFolder)

-- 1. JSON (CRITIQUE - doit être chargé en premier)
local JSONFile = scriptFolder .. "\\lib\\JSON.lua"
console.print("[MAIN] Chargement JSON depuis: " .. JSONFile)

-- Vérifier que le fichier existe
local testFile = io.open(JSONFile, "r")
if not testFile then
    console.error("❌ FICHIER JSON.lua INTROUVABLE")
    console.error("Chemin attendu: " .. JSONFile)
    console.error("")
    console.error("SOLUTIONS:")
    console.error("1. Vérifiez que le fichier JSON.lua existe dans le dossier /lib/")
    console.error("2. Téléchargez-le depuis: https://3373271050-files.gitbook.io/.../JSON.lua")
    console.error("3. Placez-le dans: " .. scriptFolder .. "\\lib\\JSON.lua")
    script.stop()
    return
else
    testFile:close()
    console.print("[MAIN] ✓ Fichier JSON.lua trouvé")
end

-- Charger JSON
local success, err = pcall(function()
    JSON = loadfile(JSONFile)()
end)

if not success or not JSON then
    console.error("❌ Erreur chargement JSON.lua")
    console.error("Erreur: " .. tostring(err))
    console.error("")
    console.error("Le fichier JSON.lua est peut-être corrompu.")
    console.error("Téléchargez-le à nouveau depuis la documentation Frigost.")
    script.stop()
    return
end

console.print("✓ JSON chargé")

-- 2. CONSTANTS
local constantsFile = scriptFolder .. "\\data\\constants.lua"
success, err = pcall(function()
    dofile(constantsFile)
end)

if not success then
    console.error("❌ Erreur chargement constants.lua")
    console.error("Fichier: " .. constantsFile)
    console.error("Erreur: " .. tostring(err))
    script.stop()
    return
end
console.print("✓ Constants chargé")

-- Initialiser constants
if initialiserConstants then
    initialiserConstants()
end

-- 3. SPELLS CONFIG
local spellsFile = scriptFolder .. "\\data\\spells_config.lua"
success, err = pcall(function()
    dofile(spellsFile)
end)

if not success then
    console.error("❌ Erreur chargement spells_config.lua")
    console.error("Fichier: " .. spellsFile)
    console.error("Erreur: " .. tostring(err))
    script.stop()
    return
end
console.print("✓ Spells config chargé")

-- Valider spells
if validerSortsConfig then
    validerSortsConfig()
end

-- 4. UTILS
local utilsFile = scriptFolder .. "\\lib\\utils.lua"
success, err = pcall(function()
    dofile(utilsFile)
end)

if not success then
    console.error("❌ Erreur chargement utils.lua")
    console.error("Fichier: " .. utilsFile)
    console.error("Erreur: " .. tostring(err))
    script.stop()
    return
end
console.print("✓ Utils chargé")

-- 5. LEARNING MANAGER
local learningFile = scriptFolder .. "\\core\\learning_manager.lua"
success, err = pcall(function()
    dofile(learningFile)
end)

if not success then
    console.error("❌ Erreur chargement learning_manager.lua")
    console.error("Fichier: " .. learningFile)
    console.error("Erreur: " .. tostring(err))
    script.stop()
    return
end
console.print("✓ Learning Manager chargé")

-- 6. MODULES CORE
local coreModules = {
    {file = "map_analyzer", name = "Map Analyzer"},
    {file = "combat_calculator", name = "Combat Calculator"},
    {file = "movement_manager", name = "Movement Manager"},
    {file = "stats_manager", name = "Stats Manager"},
    {file = "placement_manager", name = "Placement Manager"}
}

for _, module in ipairs(coreModules) do
    local moduleFile = scriptFolder .. "\\core\\" .. module.file .. ".lua"
    success, err = pcall(function()
        dofile(moduleFile)
    end)
    
    if not success then
        console.error("❌ Erreur chargement " .. module.file .. ".lua")
        console.error("Fichier: " .. moduleFile)
        console.error("Erreur: " .. tostring(err))
        script.stop()
        return
    end
    console.print("✓ " .. module.name .. " chargé")
end

-- 7. IA
local aiModules = {
    {file = "cra_ai", name = "Cra AI"},
    {file = "enutrof_ai", name = "Enutrof AI"}
}

for _, module in ipairs(aiModules) do
    local moduleFile = scriptFolder .. "\\ai\\" .. module.file .. ".lua"
    success, err = pcall(function()
        dofile(moduleFile)
    end)
    
    if not success then
        console.error("❌ Erreur chargement " .. module.file .. ".lua")
        console.error("Fichier: " .. moduleFile)
        console.error("Erreur: " .. tostring(err))
        script.stop()
        return
    end
    console.print("✓ " .. module.name .. " chargé")
end

console.print("========================================")
console.print("✅ Tous les modules chargés avec succès")
console.print("========================================")

-- ============================================
-- INITIALISATION
-- ============================================

-- Initialiser Learning Manager
if LearningManager and LearningManager.init then
    LearningManager:init()
end

-- Stats session
STATS_SESSION = {
    combats_total = 0,
    combats_victoires = 0,
    combats_defaites = 0,
    debut_session = global.timestamp(),
    dernier_combat = 0
}

-- ============================================
-- PARAMÈTRES COMBAT
-- ============================================

MAX_MONSTERS = 8
MIN_MONSTERS = 1
FORBIDDEN_MONSTERS = {}
FORCE_MONSTERS = {}

-- ============================================
-- FONCTION PRINCIPALE DE DÉPLACEMENT
-- ============================================

function move()
    console.print("========================================")
    console.print("=== DÉBUT DU TRAJET ===")
    console.print("========================================")
    
    -- TODO: REMPLACER PAR VOTRE TRAJET
    return {
        { map = "7,-18", path = "right", fight = true },
        { map = "8,-18", path = "right", fight = true },
        { map = "9,-18", path = "bottom", fight = true },
        { map = "9,-17", path = "left", fight = true },
        { map = "8,-17", path = "left", fight = true },
        { map = "7,-17", path = "top", fight = true },
    }
end

-- ============================================
-- GESTION COMBAT
-- ============================================

function fight()
    local tour = currentRound()
    local moi = currentFighter()
    
    if not moi then
        if console and console.print then
            console.print("[MAIN] Pas de fighter actif, attente...")
        end
        return
    end
    
    console.print("")
    console.print("========================================")
    console.print("=== TOUR " .. tour .. " - " .. (moi.name or "Fighter") .. " ===")
    console.print("========================================")
    
    -- TOUR 0: PLACEMENT
    if tour == 0 then
        console.print("[MAIN] 🎯 PHASE PLACEMENT")
        
        if PlacementManager and PlacementManager.executePlacement then
            local success = PlacementManager:executePlacement()
            
            if success then
                console.print("[MAIN] ✅ Placement terminé")
            else
                console.print("[MAIN] ⚠️ Placement partiel")
            end
        else
            console.print("[MAIN] ⚠️ PlacementManager non disponible")
        end
        
        global.sleep(500)
        return
    end
    
    -- Nettoyer caches au début du combat
    if tour == 1 then
        if MapAnalyzer and MapAnalyzer.clearCache then
            MapAnalyzer:clearCache()
        end
        if MovementManager and MovementManager.clearCache then
            MovementManager:clearCache()
        end
    end
    
    -- COMBAT: Appeler l'IA appropriée
    if moi.breedId == BREED_CRA then
        console.print("[MAIN] → IA CRA activée")
        if CRA_AI then
            CRA_AI()
        else
            console.error("[MAIN] ❌ Fonction CRA_AI non trouvée")
            finishTurn()
        end
    elseif moi.breedId == BREED_ENUTROF then
        console.print("[MAIN] → IA ENUTROF activée")
        if ENUTROF_AI then
            ENUTROF_AI()
        else
            console.error("[MAIN] ❌ Fonction ENUTROF_AI non trouvée")
            finishTurn()
        end
    else
        console.print("[MAIN] ⚠️ Classe inconnue: " .. tostring(moi.breedId))
        finishTurn()
    end
end

-- ============================================
-- ÉVÉNEMENTS COMBAT
-- ============================================

function fightStart()
    console.print("========================================")
    console.print("⚔️  DÉBUT DU COMBAT")
    console.print("========================================")
    
    STATS_SESSION.combats_total = STATS_SESSION.combats_total + 1
    STATS_SESSION.dernier_combat = global.timestamp()
    
    -- Reset caches
    if MapAnalyzer and MapAnalyzer.clearCache then
        MapAnalyzer:clearCache()
    end
    if MovementManager and MovementManager.clearCache then
        MovementManager:clearCache()
    end
    if StatsManager and StatsManager.clearCache then
        StatsManager:clearCache()
    end
    
    -- Analyser monstres
    if LearningManager and LearningManager.analyserTousMonstres then
        console.print("[MAIN] Analyse ennemis en cours...")
        LearningManager:analyserTousMonstres()
    end
    
    -- Afficher composition
    local ennemis = fighters()
    local nbEnnemis = 0
    
    for _, ennemi in ipairs(ennemis) do
        if ennemi.team == enum_Team.Defender then
            nbEnnemis = nbEnnemis + 1
            console.print("[MAIN]   • " .. (ennemi.name or "Inconnu") .. " (Niv." .. (ennemi.level or "?") .. ")")
        end
    end
    
    console.print("[MAIN] Nombre d'ennemis: " .. nbEnnemis)
    
    -- Afficher stats équipe
    if StatsManager and StatsManager.getTeamStats then
        local teamStats = StatsManager:getTeamStats()
        console.print("[MAIN] Vie moyenne équipe: " .. math.floor(teamStats.averageHP * 100) .. "%")
    end
end

function fightEnd(result)
    console.print("========================================")
    console.print("🏁 FIN DU COMBAT")
    console.print("========================================")
    
    -- Résultat
    if result == 1 then
        console.print("✅ VICTOIRE")
        STATS_SESSION.combats_victoires = STATS_SESSION.combats_victoires + 1
        if LearningManager and LearningManager.finCombat then
            LearningManager:finCombat(true)
        end
    else
        console.print("❌ DÉFAITE")
        STATS_SESSION.combats_defaites = STATS_SESSION.combats_defaites + 1
        if LearningManager and LearningManager.finCombat then
            LearningManager:finCombat(false)
        end
    end
    
    -- Stats session
    local duree = (global.timestamp() - STATS_SESSION.debut_session) / 1000
    local combatsH = 0
    
    if duree > 0 then
        combatsH = (STATS_SESSION.combats_total / duree) * 3600
    end
    
    console.print("")
    console.print("=== STATS SESSION ===")
    console.print("Combats: " .. STATS_SESSION.combats_total)
    console.print("Victoires: " .. STATS_SESSION.combats_victoires)
    console.print("Défaites: " .. STATS_SESSION.combats_defaites)
    
    if STATS_SESSION.combats_total > 0 then
        local tauxVictoire = (STATS_SESSION.combats_victoires / STATS_SESSION.combats_total) * 100
        console.print("Taux victoire: " .. math.floor(tauxVictoire) .. "%")
    end
    
    console.print("Combats/h: " .. math.floor(combatsH))
    console.print("Durée session: " .. math.floor(duree / 60) .. " min")
    
    -- Afficher stats apprentissage
    if APPRENTISSAGE and APPRENTISSAGE.ENABLED and LearningManager then
        local nbMonstres = LearningManager:compterMonstres()
        console.print("Monstres appris: " .. nbMonstres)
    end
    
    console.print("========================================")
    
    -- Exporter stats
    if exporterStats then
        exporterStats()
    end
    
    -- Reset caches
    if MapAnalyzer and MapAnalyzer.clearCache then
        MapAnalyzer:clearCache()
    end
    if MovementManager and MovementManager.clearCache then
        MovementManager:clearCache()
    end
    if StatsManager and StatsManager.reset then
        StatsManager:reset()
    end
end

-- ============================================
-- GESTION BANQUE
-- ============================================

function bank()
    console.print("========================================")
    console.print("🏦 RETOUR BANQUE")
    console.print("========================================")
    console.print("⚠️ Fonction banque non implémentée")
end

-- ============================================
-- GESTION INVENTAIRE
-- ============================================

function onInventoryFull()
    console.print("========================================")
    console.print("📦 INVENTAIRE PLEIN")
    console.print("========================================")
    console.error("Inventaire plein - Arrêt du script")
    script.stop()
end

-- ============================================
-- FONCTIONS ARRÊT/ERREUR
-- ============================================

function script_stopped()
    console.print("")
    console.print("========================================")
    console.print("🛑 SCRIPT ARRÊTÉ")
    console.print("========================================")
    
    -- Sauvegarder données apprentissage
    if APPRENTISSAGE and APPRENTISSAGE.ENABLED and LearningManager and LearningManager.sauvegarderDonnees then
        LearningManager:sauvegarderDonnees()
        console.print("✓ Données apprentissage sauvegardées")
    end
    
    -- Afficher stats finales
    console.print("")
    console.print("=== STATS FINALES ===")
    console.print("Combats total: " .. STATS_SESSION.combats_total)
    console.print("Victoires: " .. STATS_SESSION.combats_victoires)
    console.print("Défaites: " .. STATS_SESSION.combats_defaites)
    
    local duree = (global.timestamp() - STATS_SESSION.debut_session) / 1000
    console.print("Durée totale: " .. math.floor(duree / 60) .. " min")
    
    if STATS_SESSION.combats_total > 0 then
        local tauxVictoire = (STATS_SESSION.combats_victoires / STATS_SESSION.combats_total) * 100
        console.print("Taux victoire: " .. math.floor(tauxVictoire) .. "%")
    end
    
    console.print("========================================")
    
    -- Afficher stats apprentissage
    if APPRENTISSAGE and APPRENTISSAGE.ENABLED and LearningManager and LearningManager.afficherStats then
        LearningManager:afficherStats()
    end
end

function script_error(errorMessage)
    console.print("")
    console.print("========================================")
    console.print("❌ ERREUR SCRIPT")
    console.print("========================================")
    console.error("Message: " .. tostring(errorMessage or "Erreur inconnue"))
    console.print("========================================")
    
    -- Sauvegarder quand même
    if APPRENTISSAGE and APPRENTISSAGE.ENABLED and LearningManager and LearningManager.sauvegarderDonnees then
        LearningManager:sauvegarderDonnees()
    end
    
    if exporterStats then
        exporterStats()
    end
end

-- ============================================
-- COMMANDES PERSONNALISÉES
-- ============================================

function cmdStats()
    console.print("========================================")
    console.print("=== STATISTIQUES ===")
    console.print("========================================")
    
    if afficherStatsConsole then
        afficherStatsConsole()
    end
    
    if APPRENTISSAGE and APPRENTISSAGE.ENABLED and LearningManager and LearningManager.afficherStats then
        LearningManager:afficherStats()
    end
end

function cmdResetLearning()
    console.print("⚠️ Reset apprentissage...")
    if LearningManager and LearningManager.resetTout then
        LearningManager:resetTout()
        console.print("✅ Apprentissage réinitialisé")
    else
        console.error("❌ LearningManager non disponible")
    end
end

function cmdShowMonster(monstreId)
    if not monstreId then
        console.error("Usage: cmdShowMonster(ID)")
        return
    end
    
    if LearningManager and LearningManager.afficherMonstre then
        LearningManager:afficherMonstre(monstreId)
    else
        console.error("❌ LearningManager non disponible")
    end
end

function cmdSetFormation(formationType)
    if not formationType then
        console.error("Usage: cmdSetFormation('ligne_arriere' | 'triangle' | 'dispersee')")
        return
    end
    
    if PlacementManager and PlacementManager.setFormation then
        PlacementManager:setFormation(formationType)
    else
        console.error("❌ PlacementManager non disponible")
    end
end

function cmdTestIA()
    console.print("🧪 Test IA Cra...")
    
    local moi = currentFighter()
    
    if moi and moi.breedId == BREED_CRA then
        if CRA_AI then
            CRA_AI()
        else
            console.error("❌ CRA_AI non disponible")
        end
    else
        console.error("Pas de Cra actif")
    end
end

-- ============================================
-- LOGS DÉMARRAGE
-- ============================================

console.print("")
console.print("========================================")
console.print("🚀 SCRIPT PRÊT")
console.print("========================================")

if CONFIG then
    console.print("Configuration:")
    console.print("  • Profil: " .. (PROFIL_ACTIF or "?"))
    console.print("  • Distance optimale: " .. (CONFIG.DISTANCE_OPTIMALE_CRA or "?") .. " cases")
    console.print("  • Apprentissage: " .. (APPRENTISSAGE and APPRENTISSAGE.ENABLED and "ACTIVÉ" or "DÉSACTIVÉ"))
    console.print("  • Debug: " .. (DEBUG and DEBUG.ENABLED and "ACTIVÉ" or "DÉSACTIVÉ"))
end

console.print("")
console.print("Commandes disponibles:")
console.print("  • cmdStats() - Afficher stats")
console.print("  • cmdResetLearning() - Reset apprentissage")
console.print("  • cmdShowMonster(ID) - Afficher monstre")
console.print("  • cmdSetFormation(type) - Changer formation")
console.print("  • cmdTestIA() - Tester IA")
console.print("========================================")
console.print("")