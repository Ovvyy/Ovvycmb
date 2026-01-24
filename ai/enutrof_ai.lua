-- ============================================
-- IA ENUTROF - Support
-- ============================================

function ENUTROF_AI()
    local moi = currentFighter()
    local tour = currentRound()
    
    log("ENUTROF", "=== TOUR " .. tour .. " ===")
    log("ENUTROF", "PA:" .. moi.AP .. " PM:" .. moi.MP)
    
    -- Tour 1: Setup
    if tour == 1 then
        log("ENUTROF", "Setup initial")
        
        -- Cupidité
        local cupidite = getSpellByName(SPELLS_ENUTROF, "Cupidité")
        if cupidite and canCastSpell(cupidite.id, moi.cellId) then
            log("ENUTROF", "→ Cupidité (+200 INT équipe)")
            castSpell(cupidite.id, moi.cellId)
            global.sleep(300)
        end
        
        -- Sac Animé
        local sac = getSpellByName(SPELLS_ENUTROF, "Sac Animé")
        if sac and canCastSpell(sac.id, moi.cellId) then
            log("ENUTROF", "→ Sac Animé")
            castSpell(sac.id, moi.cellId)
            global.sleep(300)
        end
        
        -- Positionnement
        local safeCell = MapAnalyzer:getSafestCell()
        if safeCell and moi.MP > 0 then
            local path = findPath(moi.cellId, safeCell)
            if path then
                for i = 1, math.min(#path, moi.MP) do
                    map.move(path[i])
                    global.sleep(100)
                end
            end
        end
        
        finishTurn()
        return
    end
    
    -- Tour 2+: Contrôle
    log("ENUTROF", "Phase contrôle")
    
    local pelleRepousse = getSpellByName(SPELLS_ENUTROF, "Pelle Repousse")
    
    if pelleRepousse then
        -- Trouver ennemi le plus proche avec PM
        local ennemis = fighters()
        local menace = nil
        local distMin = 999
        
        for _, ennemi in ipairs(ennemis) do
            if ennemi.team == enum_Team.Defender and ennemi.MP >= CONFIG.SEUIL_PM_CRITIQUE then
                local dist = cellsDistance(moi.cellId, ennemi.cellId)
                if dist < distMin then
                    distMin = dist
                    menace = ennemi
                end
            end
        end
        
        if menace and canCastSpell(pelleRepousse.id, menace.cellId) then
            log("ENUTROF", "→ Retrait PM sur " .. menace.name)
            castSpell(pelleRepousse.id, menace.cellId)
            global.sleep(300)
        end
    end
    
    -- Repositionnement
    if moi.MP > 0 then
        local safeCell = MapAnalyzer:getSafestCell()
        if safeCell then
            local path = findPath(moi.cellId, safeCell)
            if path then
                for i = 1, math.min(#path, moi.MP) do
                    map.move(path[i])
                    global.sleep(100)
                end
            end
        end
    end
    
    finishTurn()
end
```

---

## 📝 INSTRUCTIONS D'INSTALLATION

### Étape 1 : Créer la structure
```
/Frigost/Scripts/TeamCraEnu/
├── main.lua
├── /core/
│   ├── map_analyzer.lua
│   ├── combat_calculator.lua
│   ├── movement_manager.lua
│   ├── stats_manager.lua
│   └── placement_manager.lua
├── /ai/
│   ├── cra_ai.lua
│   └── enutrof_ai.lua
├── /data/
│   ├── spells_config.lua
│   └── constants.lua
└── /lib/
    ├── JSON.lua (télécharger depuis doc Frigost)
    └── utils.lua