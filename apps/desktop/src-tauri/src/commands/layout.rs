use ovvy_core::{
    profiles::{LayoutPreset, LayoutProfile},
    state::SharedAppState,
};
use serde::{Deserialize, Serialize};
use tauri::State;
use uuid::Uuid;

#[tauri::command]
pub async fn list_profiles(state: State<'_, SharedAppState>) -> Result<Vec<LayoutProfile>, String> {
    let profiles = state.profiles.read().await;
    let mut list: Vec<LayoutProfile> = profiles.values().cloned().collect();
    list.sort_by(|a, b| a.name.cmp(&b.name));
    Ok(list)
}

#[tauri::command]
pub async fn apply_profile(
    state: State<'_, SharedAppState>,
    profile_id: String,
) -> Result<(), String> {
    let uuid = Uuid::parse_str(&profile_id).map_err(|e| e.to_string())?;
    *state.active_profile_id.write().await = Some(uuid);

    let profile = state.profiles.read().await.get(&uuid).cloned();
    if let Some(profile) = profile {
        let clients: Vec<_> = state.game_clients.read().await.values().cloned().collect();
        let window_ops = ovvy_window_manager::window_ops::create_window_ops();
        let monitors = ovvy_window_manager::monitor::enumerate_monitors()
            .map_err(|e| e.to_string())?;
        let engine = ovvy_window_manager::LayoutEngine::new(window_ops, monitors);
        engine.apply_profile(&profile, &clients).await.map_err(|e| e.to_string())?;

        state.event_bus.publish(
            ovvy_core::events::AppEvent::WindowLayoutChanged { profile_id: uuid },
            "desktop",
        );
    }

    Ok(())
}

#[tauri::command]
pub async fn save_profile(
    state: State<'_, SharedAppState>,
    name: String,
    monitor_count: u32,
) -> Result<LayoutProfile, String> {
    let profile = LayoutProfile::new(name, monitor_count);
    let id = profile.id;
    state.profiles.write().await.insert(id, profile.clone());
    Ok(profile)
}

#[tauri::command]
pub async fn delete_profile(
    state: State<'_, SharedAppState>,
    profile_id: String,
) -> Result<(), String> {
    let uuid = Uuid::parse_str(&profile_id).map_err(|e| e.to_string())?;
    state.profiles.write().await.remove(&uuid);
    Ok(())
}

#[tauri::command]
pub async fn get_preset_layouts(
    count: u32,
    preset: String,
) -> Result<serde_json::Value, String> {
    let preset_enum = match preset.as_str() {
        "grid_2x2" => LayoutPreset::Grid2x2,
        "grid_2x4" => LayoutPreset::Grid2x4,
        "grid_4x4" => LayoutPreset::Grid4x4,
        "horizontal" => LayoutPreset::Horizontal,
        "vertical" => LayoutPreset::Vertical,
        _ => LayoutPreset::Grid2x2,
    };

    let monitors = ovvy_window_manager::monitor::enumerate_monitors()
        .map_err(|e| e.to_string())?;
    let monitor_bounds: Vec<_> = monitors.iter().map(|m| m.bounds).collect();
    let layouts = preset_enum.generate(count, &monitor_bounds);

    Ok(serde_json::to_value(layouts).map_err(|e| e.to_string())?)
}
