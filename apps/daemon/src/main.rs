use anyhow::Result;
use directories::ProjectDirs;
use ovvy_core::{config::AppConfig, events::create_event_bus, state::AppState};
use ovvy_ipc::IpcServer;
use ovvy_storage::Database;
use ovvy_telemetry::init_telemetry;
use std::path::PathBuf;
use std::sync::Arc;
use tracing::info;

#[tokio::main]
async fn main() -> Result<()> {
    init_telemetry("info", false)?;
    info!("Ovvycmb daemon starting...");

    let data_dir = get_data_dir();
    tokio::fs::create_dir_all(&data_dir).await?;

    let db_path = data_dir.join("ovvycmb.db");
    let db = Database::connect(&db_path).await?;

    let event_bus = create_event_bus();
    let config = AppConfig::default();
    let state = Arc::new(AppState::new(config, event_bus.clone()));

    // Start background scan loop
    let scan_state = state.clone();
    tokio::spawn(async move {
        scan_loop(scan_state).await;
    });

    // IPC server on port 7337
    info!("IPC server starting on port 7337");
    IpcServer::new(state, 7337).run().await?;

    Ok(())
}

async fn scan_loop(state: Arc<ovvy_core::state::AppState>) {
    use std::time::Duration;
    use tokio::time::interval;
    use ovvy_window_manager::detector::create_detector;

    let detector = create_detector();
    let mut ticker = interval(Duration::from_millis(500));

    loop {
        ticker.tick().await;
        match detector.scan_processes().await {
            Ok(clients) => {
                let mut game_clients = state.game_clients.write().await;
                for client in clients {
                    game_clients.insert(client.process_id, client);
                }
            }
            Err(e) => {
                tracing::warn!("Scan error: {}", e);
            }
        }
    }
}

fn get_data_dir() -> PathBuf {
    ProjectDirs::from("com", "ovvycmb", "Ovvycmb")
        .map(|d| d.data_local_dir().to_path_buf())
        .unwrap_or_else(|| PathBuf::from("./data"))
}
