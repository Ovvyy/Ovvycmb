use ovvy_core::{config::AppConfig, state::SharedAppState};
use tauri::State;

#[tauri::command]
pub async fn get_config(state: State<'_, SharedAppState>) -> Result<AppConfig, String> {
    Ok(state.config.read().await.clone())
}

#[tauri::command]
pub async fn update_config(
    state: State<'_, SharedAppState>,
    key: String,
    value: serde_json::Value,
) -> Result<(), String> {
    let mut config = state.config.write().await;
    // Patch specific config keys via JSON merge
    match key.as_str() {
        "overlay.enabled" => {
            if let Some(v) = value.as_bool() {
                config.overlay.enabled = v;
            }
        }
        "overlay.opacity" => {
            if let Some(v) = value.as_f64() {
                config.overlay.opacity = v as f32;
            }
        }
        "window_manager.scan_interval_ms" => {
            if let Some(v) = value.as_u64() {
                config.window_manager.scan_interval_ms = v;
            }
        }
        "general.theme" => {
            if let Ok(theme) = serde_json::from_value(value) {
                config.general.theme = theme;
            }
        }
        _ => {}
    }

    state.event_bus.publish(
        ovvy_core::events::AppEvent::ConfigChanged { key },
        "desktop",
    );

    Ok(())
}
