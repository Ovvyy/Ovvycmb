use anyhow::Result;
use async_trait::async_trait;
use ovvy_core::game::WindowBounds;
use tracing::{debug, warn};

#[async_trait]
pub trait WindowOps: Send + Sync {
    async fn set_bounds(&self, hwnd: isize, bounds: WindowBounds) -> Result<()>;
    async fn focus_window(&self, hwnd: isize) -> Result<()>;
    async fn minimize_window(&self, hwnd: isize) -> Result<()>;
    async fn restore_window(&self, hwnd: isize) -> Result<()>;
    async fn set_topmost(&self, hwnd: isize, topmost: bool) -> Result<()>;
    async fn set_title(&self, hwnd: isize, title: &str) -> Result<()>;
}

#[cfg(target_os = "windows")]
pub mod windows_impl {
    use super::*;
    use windows::Win32::Foundation::HWND;
    use windows::Win32::UI::WindowsAndMessaging::{
        MoveWindow, SetForegroundWindow, ShowWindow, SetWindowPos,
        SW_MINIMIZE, SW_RESTORE, SW_SHOWNOACTIVATE,
        HWND_TOPMOST, HWND_NOTOPMOST, SWP_NOSIZE, SWP_NOMOVE,
        SWP_NOACTIVATE, SWP_SHOWWINDOW, SetWindowTextW,
    };

    pub struct WindowsOps;

    #[async_trait]
    impl WindowOps for WindowsOps {
        async fn set_bounds(&self, hwnd: isize, bounds: WindowBounds) -> Result<()> {
            tokio::task::spawn_blocking(move || unsafe {
                let hwnd = HWND(hwnd as *mut _);
                MoveWindow(
                    hwnd,
                    bounds.x,
                    bounds.y,
                    bounds.width as i32,
                    bounds.height as i32,
                    true,
                )?;
                Ok::<(), anyhow::Error>(())
            })
            .await??;
            debug!("Set bounds for hwnd {:x}: {:?}", hwnd, bounds);
            Ok(())
        }

        async fn focus_window(&self, hwnd: isize) -> Result<()> {
            tokio::task::spawn_blocking(move || unsafe {
                let hwnd = HWND(hwnd as *mut _);
                SetForegroundWindow(hwnd);
                Ok::<(), anyhow::Error>(())
            })
            .await??;
            Ok(())
        }

        async fn minimize_window(&self, hwnd: isize) -> Result<()> {
            tokio::task::spawn_blocking(move || unsafe {
                let hwnd = HWND(hwnd as *mut _);
                ShowWindow(hwnd, SW_MINIMIZE);
                Ok::<(), anyhow::Error>(())
            })
            .await??;
            Ok(())
        }

        async fn restore_window(&self, hwnd: isize) -> Result<()> {
            tokio::task::spawn_blocking(move || unsafe {
                let hwnd = HWND(hwnd as *mut _);
                ShowWindow(hwnd, SW_RESTORE);
                Ok::<(), anyhow::Error>(())
            })
            .await??;
            Ok(())
        }

        async fn set_topmost(&self, hwnd: isize, topmost: bool) -> Result<()> {
            tokio::task::spawn_blocking(move || unsafe {
                let hwnd = HWND(hwnd as *mut _);
                let insert_after = if topmost { HWND_TOPMOST } else { HWND_NOTOPMOST };
                SetWindowPos(
                    hwnd,
                    insert_after,
                    0, 0, 0, 0,
                    SWP_NOSIZE | SWP_NOMOVE | SWP_NOACTIVATE,
                )?;
                Ok::<(), anyhow::Error>(())
            })
            .await??;
            Ok(())
        }

        async fn set_title(&self, hwnd: isize, title: &str) -> Result<()> {
            let title: Vec<u16> = title.encode_utf16().chain(std::iter::once(0)).collect();
            tokio::task::spawn_blocking(move || unsafe {
                let hwnd = HWND(hwnd as *mut _);
                SetWindowTextW(hwnd, windows::core::PCWSTR(title.as_ptr()))?;
                Ok::<(), anyhow::Error>(())
            })
            .await??;
            Ok(())
        }
    }
}

#[cfg(not(target_os = "windows"))]
pub struct StubWindowOps;

#[cfg(not(target_os = "windows"))]
#[async_trait]
impl WindowOps for StubWindowOps {
    async fn set_bounds(&self, _hwnd: isize, _bounds: WindowBounds) -> Result<()> { Ok(()) }
    async fn focus_window(&self, _hwnd: isize) -> Result<()> { Ok(()) }
    async fn minimize_window(&self, _hwnd: isize) -> Result<()> { Ok(()) }
    async fn restore_window(&self, _hwnd: isize) -> Result<()> { Ok(()) }
    async fn set_topmost(&self, _hwnd: isize, _topmost: bool) -> Result<()> { Ok(()) }
    async fn set_title(&self, _hwnd: isize, _title: &str) -> Result<()> { Ok(()) }
}

pub fn create_window_ops() -> Box<dyn WindowOps> {
    #[cfg(target_os = "windows")]
    return Box::new(windows_impl::WindowsOps);
    #[cfg(not(target_os = "windows"))]
    return Box::new(StubWindowOps);
}
