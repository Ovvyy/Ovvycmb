use ovvy_core::{game::WindowBounds, state::SharedAppState};
use ovvy_window_manager::{monitor::MonitorInfo, window_ops::create_window_ops};
use tauri::State;

#[tauri::command]
pub async fn scan_windows(state: State<'_, SharedAppState>) -> Result<serde_json::Value, String> {
    let detector = ovvy_window_manager::detector::create_detector();
    let clients = detector.scan_processes().await.map_err(|e| e.to_string())?;

    let mut game_clients = state.game_clients.write().await;
    game_clients.clear();
    for client in &clients {
        game_clients.insert(client.process_id, client.clone());
    }

    Ok(serde_json::to_value(&clients).map_err(|e| e.to_string())?)
}

#[tauri::command]
pub async fn get_monitors() -> Result<Vec<MonitorInfo>, String> {
    ovvy_window_manager::monitor::enumerate_monitors().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn set_window_bounds(
    hwnd: i64,
    x: i32,
    y: i32,
    width: u32,
    height: u32,
) -> Result<(), String> {
    let ops = create_window_ops();
    ops.set_bounds(hwnd as isize, WindowBounds { x, y, width, height })
        .await
        .map_err(|e| e.to_string())
}
