use anyhow::Result;
use async_trait::async_trait;
use ovvy_core::game::{GameClient, GameState, GameType};
use std::collections::HashMap;
use tracing::{debug, info, warn};

#[async_trait]
pub trait GameDetector: Send + Sync {
    async fn scan_processes(&self) -> Result<Vec<GameClient>>;
    async fn get_client(&self, pid: u32) -> Result<Option<GameClient>>;
    async fn is_process_alive(&self, pid: u32) -> bool;
}

#[cfg(target_os = "windows")]
pub mod windows_impl {
    use super::*;
    use windows::Win32::Foundation::{HWND, LPARAM, BOOL};
    use windows::Win32::UI::WindowsAndMessaging::{
        EnumWindows, GetWindowTextW, GetWindowThreadProcessId,
        IsWindowVisible, IsIconic,
    };
    use windows::Win32::System::Threading::{
        OpenProcess, PROCESS_QUERY_INFORMATION, PROCESS_VM_READ,
    };
    use std::sync::Mutex;

    pub struct WindowsGameDetector {
        target_games: Vec<GameType>,
    }

    impl WindowsGameDetector {
        pub fn new() -> Self {
            Self {
                target_games: vec![
                    GameType::DofusUnity,
                    GameType::DofusRetro,
                    GameType::Wakfu,
                ],
            }
        }

        fn matches_game_type(title: &str) -> Option<GameType> {
            let lower = title.to_lowercase();
            if lower.contains("dofus") && !lower.contains("retro") {
                Some(GameType::DofusUnity)
            } else if lower.contains("retro") || lower.contains("dofus retro") {
                Some(GameType::DofusRetro)
            } else if lower.contains("wakfu") {
                Some(GameType::Wakfu)
            } else {
                None
            }
        }
    }

    #[async_trait]
    impl GameDetector for WindowsGameDetector {
        async fn scan_processes(&self) -> Result<Vec<GameClient>> {
            let clients = tokio::task::spawn_blocking(scan_windows).await??;
            debug!("Detected {} game clients", clients.len());
            Ok(clients)
        }

        async fn get_client(&self, pid: u32) -> Result<Option<GameClient>> {
            let clients = self.scan_processes().await?;
            Ok(clients.into_iter().find(|c| c.process_id == pid))
        }

        async fn is_process_alive(&self, pid: u32) -> bool {
            tokio::task::spawn_blocking(move || {
                unsafe {
                    let handle = OpenProcess(PROCESS_QUERY_INFORMATION, false, pid);
                    handle.is_ok()
                }
            })
            .await
            .unwrap_or(false)
        }
    }

    fn scan_windows() -> Result<Vec<GameClient>> {
        let clients: Mutex<Vec<GameClient>> = Mutex::new(Vec::new());
        let clients_ptr = &clients as *const _ as isize;

        unsafe {
            EnumWindows(
                Some(enum_windows_callback),
                LPARAM(clients_ptr),
            )?;
        }

        Ok(clients.into_inner().unwrap_or_default())
    }

    unsafe extern "system" fn enum_windows_callback(hwnd: HWND, lparam: LPARAM) -> BOOL {
        if !IsWindowVisible(hwnd).as_bool() {
            return BOOL(1);
        }

        let mut title = [0u16; 512];
        let len = GetWindowTextW(hwnd, &mut title);
        if len == 0 {
            return BOOL(1);
        }

        let title_str = String::from_utf16_lossy(&title[..len as usize]);

        if let Some(game_type) = WindowsGameDetector::matches_game_type(&title_str) {
            let mut pid = 0u32;
            GetWindowThreadProcessId(hwnd, Some(&mut pid));

            use windows::Win32::UI::WindowsAndMessaging::{GetWindowRect, IsIconic};
            use windows::Win32::Foundation::RECT;

            let mut rect = RECT::default();
            let _ = GetWindowRect(hwnd, &mut rect);

            let client = GameClient {
                process_id: pid,
                window_handle: hwnd.0 as isize,
                game_type,
                state: GameState::InGame,
                title: title_str,
                width: (rect.right - rect.left).max(0) as u32,
                height: (rect.bottom - rect.top).max(0) as u32,
                x: rect.left,
                y: rect.top,
                monitor_index: 0,
                is_focused: false,
                is_minimized: IsIconic(hwnd).as_bool(),
            };

            let clients = &*(lparam.0 as *const Mutex<Vec<GameClient>>);
            if let Ok(mut guard) = clients.lock() {
                guard.push(client);
            }
        }

        BOOL(1)
    }
}

#[cfg(not(target_os = "windows"))]
pub struct StubDetector;

#[cfg(not(target_os = "windows"))]
#[async_trait]
impl GameDetector for StubDetector {
    async fn scan_processes(&self) -> Result<Vec<GameClient>> {
        Ok(vec![])
    }

    async fn get_client(&self, _pid: u32) -> Result<Option<GameClient>> {
        Ok(None)
    }

    async fn is_process_alive(&self, _pid: u32) -> bool {
        false
    }
}

pub fn create_detector() -> Box<dyn GameDetector> {
    #[cfg(target_os = "windows")]
    return Box::new(windows_impl::WindowsGameDetector::new());

    #[cfg(not(target_os = "windows"))]
    return Box::new(StubDetector);
}
