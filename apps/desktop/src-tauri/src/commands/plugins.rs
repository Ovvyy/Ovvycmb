use tauri::State;
use ovvy_core::state::SharedAppState;

#[tauri::command]
pub async fn list_plugins(state: State<'_, SharedAppState>) -> Result<Vec<serde_json::Value>, String> {
    // Returns installed plugin metadata
    Ok(vec![
        serde_json::json!({
            "id": "dofus-unity",
            "name": "DOFUS (Unity)",
            "version": "0.1.0",
            "description": "Official DOFUS Unity integration plugin",
            "enabled": true,
            "official": true,
        }),
        serde_json::json!({
            "id": "dofus-retro",
            "name": "DOFUS Retro",
            "version": "0.1.0",
            "description": "Official DOFUS Retro integration plugin",
            "enabled": true,
            "official": true,
        }),
    ])
}
