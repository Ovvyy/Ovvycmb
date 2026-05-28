use ovvy_core::{events::AppEvent, state::SharedAppState};
use std::time::Duration;
use tokio::time::interval;
use tracing::{info, warn};

pub async fn run_watchdog(state: SharedAppState) {
    let mut ticker = interval(Duration::from_secs(5));
    info!("Watchdog started");

    loop {
        ticker.tick().await;

        let clients: Vec<_> = {
            let game_clients = state.game_clients.read().await;
            game_clients.iter().map(|(pid, c)| (*pid, c.window_handle)).collect()
        };

        for (pid, _hwnd) in clients {
            if !is_process_alive(pid) {
                warn!(pid, "Game client process died — triggering recovery");
                cleanup_dead_client(&state, pid).await;
            }
        }
    }
}

async fn cleanup_dead_client(state: &SharedAppState, pid: u32) {
    let removed = {
        let mut clients = state.game_clients.write().await;
        clients.remove(&pid)
    };

    if let Some(client) = removed {
        // Find account associated with this PID
        let account_id = {
            let accounts = state.accounts.read().await;
            accounts
                .values()
                .find(|a| a.process_id == Some(pid))
                .map(|a| a.id)
        };

        if let Some(id) = account_id {
            state.event_bus.publish(
                AppEvent::ClientCrashed { account_id: id, exit_code: None },
                "watchdog",
            );
        }
    }
}

fn is_process_alive(pid: u32) -> bool {
    #[cfg(target_os = "windows")]
    {
        use windows::Win32::System::Threading::{OpenProcess, PROCESS_QUERY_LIMITED_INFORMATION};
        unsafe {
            OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, pid).is_ok()
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        false
    }
}
