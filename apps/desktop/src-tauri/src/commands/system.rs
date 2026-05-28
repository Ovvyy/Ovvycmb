use tauri::State;
use ovvy_core::state::SharedAppState;

#[tauri::command]
pub async fn get_system_info(state: State<'_, SharedAppState>) -> Result<serde_json::Value, String> {
    Ok(serde_json::json!({
        "version": env!("CARGO_PKG_VERSION"),
        "os": std::env::consts::OS,
        "arch": std::env::consts::ARCH,
        "account_count": state.account_count().await,
        "online_accounts": state.online_account_count().await,
        "game_clients": state.game_clients.read().await.len(),
    }))
}
