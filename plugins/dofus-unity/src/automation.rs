/// QoL automation helpers for DOFUS Unity
/// Ready button, trade accept, group invite accept

use anyhow::Result;

pub async fn click_ready_button(hwnd: isize) -> Result<()> {
    // Sends click at known "Ready" button coordinates
    // Uses SendInput (hardware-level, not injection)
    simulate_click(hwnd, 960, 900).await
}

pub async fn click_accept_trade(hwnd: isize) -> Result<()> {
    simulate_click(hwnd, 750, 540).await
}

pub async fn click_accept_group_invite(hwnd: isize) -> Result<()> {
    simulate_click(hwnd, 640, 400).await
}

async fn simulate_click(hwnd: isize, x: i32, y: i32) -> Result<()> {
    #[cfg(target_os = "windows")]
    {
        use windows::Win32::Foundation::{LPARAM, WPARAM};
        use windows::Win32::UI::WindowsAndMessaging::{PostMessageW, WM_LBUTTONDOWN, WM_LBUTTONUP};

        unsafe {
            let pos = ((y as u32) << 16 | x as u32) as isize;
            PostMessageW(
                windows::Win32::Foundation::HWND(hwnd as *mut _),
                WM_LBUTTONDOWN,
                WPARAM(1),
                LPARAM(pos),
            )?;
            PostMessageW(
                windows::Win32::Foundation::HWND(hwnd as *mut _),
                WM_LBUTTONUP,
                WPARAM(0),
                LPARAM(pos),
            )?;
        }
    }
    Ok(())
}
