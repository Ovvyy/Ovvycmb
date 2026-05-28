mod commands;
mod state;
mod tray;
mod watchdog;

use ovvy_core::{config::AppConfig, events::create_event_bus, state::AppState};
use ovvy_telemetry::init_telemetry;
use std::sync::Arc;
use tauri::{Manager, RunEvent};
use tracing::info;

pub fn run() {
    let _ = init_telemetry("info", false);

    let event_bus = create_event_bus();
    let config = AppConfig::default();
    let app_state = Arc::new(AppState::new(config, event_bus));

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }))
        .manage(app_state.clone())
        .invoke_handler(tauri::generate_handler![
            commands::accounts::list_accounts,
            commands::accounts::add_account,
            commands::accounts::remove_account,
            commands::accounts::focus_account,
            commands::accounts::update_account_order,
            commands::layout::list_profiles,
            commands::layout::apply_profile,
            commands::layout::save_profile,
            commands::layout::delete_profile,
            commands::layout::get_preset_layouts,
            commands::windows::scan_windows,
            commands::windows::get_monitors,
            commands::windows::set_window_bounds,
            commands::config::get_config,
            commands::config::update_config,
            commands::agents::run_agent,
            commands::agents::list_agents,
            commands::plugins::list_plugins,
            commands::system::get_system_info,
        ])
        .setup(|app| {
            tray::setup_tray(app)?;
            info!("Ovvycmb desktop initialized");
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("Error building Tauri application")
        .run(|_app, event| {
            if let RunEvent::ExitRequested { api, .. } = event {
                // Prevent exit on window close — keep in tray
                api.prevent_exit();
            }
        });
}
