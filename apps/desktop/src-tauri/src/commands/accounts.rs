use ovvy_core::{
    accounts::{Account, AccountId},
    game::GameType,
    state::SharedAppState,
    events::AppEvent,
};
use serde::{Deserialize, Serialize};
use tauri::State;
use uuid::Uuid;

#[derive(Debug, Deserialize)]
pub struct AddAccountRequest {
    pub name: String,
    pub game_type: String,
}

#[derive(Debug, Serialize)]
pub struct AccountsResponse {
    pub accounts: Vec<Account>,
}

#[tauri::command]
pub async fn list_accounts(state: State<'_, SharedAppState>) -> Result<Vec<Account>, String> {
    let accounts = state.accounts.read().await;
    let mut list: Vec<Account> = accounts.values().cloned().collect();
    list.sort_by_key(|a| a.order_index);
    Ok(list)
}

#[tauri::command]
pub async fn add_account(
    state: State<'_, SharedAppState>,
    name: String,
    game_type: String,
) -> Result<Account, String> {
    let gt = match game_type.as_str() {
        "dofus_unity" => GameType::DofusUnity,
        "dofus_retro" => GameType::DofusRetro,
        "wakfu" => GameType::Wakfu,
        _ => return Err(format!("Unknown game type: {}", game_type)),
    };

    let account = Account::new(name, gt);
    let id = account.id;

    state.accounts.write().await.insert(id, account.clone());
    state.event_bus.publish(AppEvent::AccountAdded { account_id: id }, "desktop");

    Ok(account)
}

#[tauri::command]
pub async fn remove_account(
    state: State<'_, SharedAppState>,
    id: String,
) -> Result<(), String> {
    let uuid = Uuid::parse_str(&id).map_err(|e| e.to_string())?;
    state.accounts.write().await.remove(&uuid);
    state.event_bus.publish(AppEvent::AccountRemoved { account_id: uuid }, "desktop");
    Ok(())
}

#[tauri::command]
pub async fn focus_account(
    state: State<'_, SharedAppState>,
    id: String,
) -> Result<(), String> {
    let uuid = Uuid::parse_str(&id).map_err(|e| e.to_string())?;

    let hwnd = {
        let accounts = state.accounts.read().await;
        accounts.get(&uuid).and_then(|a| a.window_handle)
    };

    if let Some(hwnd) = hwnd {
        #[cfg(target_os = "windows")]
        unsafe {
            use windows::Win32::Foundation::HWND;
            use windows::Win32::UI::WindowsAndMessaging::SetForegroundWindow;
            SetForegroundWindow(HWND(hwnd as *mut _));
        }
        *state.focused_account_id.write().await = Some(uuid);
        state.event_bus.publish(AppEvent::AccountFocused { account_id: uuid }, "desktop");
    }

    Ok(())
}

#[tauri::command]
pub async fn update_account_order(
    state: State<'_, SharedAppState>,
    ordered_ids: Vec<String>,
) -> Result<(), String> {
    let mut accounts = state.accounts.write().await;
    for (i, id_str) in ordered_ids.iter().enumerate() {
        if let Ok(uuid) = Uuid::parse_str(id_str) {
            if let Some(account) = accounts.get_mut(&uuid) {
                account.order_index = i as u32;
            }
        }
    }
    Ok(())
}
