use anyhow::Result;
use ovvy_core::game::WindowBounds;
use serde::{Deserialize, Serialize};
use tracing::info;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MonitorInfo {
    pub index: u32,
    pub name: String,
    pub bounds: WindowBounds,
    pub work_area: WindowBounds,
    pub dpi: f32,
    pub is_primary: bool,
}

impl MonitorInfo {
    pub fn scale_factor(&self) -> f32 {
        self.dpi / 96.0
    }
}

pub fn enumerate_monitors() -> Result<Vec<MonitorInfo>> {
    #[cfg(target_os = "windows")]
    {
        windows_enumerate()
    }
    #[cfg(not(target_os = "windows"))]
    {
        Ok(vec![MonitorInfo {
            index: 0,
            name: "Primary".to_string(),
            bounds: WindowBounds { x: 0, y: 0, width: 1920, height: 1080 },
            work_area: WindowBounds { x: 0, y: 0, width: 1920, height: 1040 },
            dpi: 96.0,
            is_primary: true,
        }])
    }
}

#[cfg(target_os = "windows")]
fn windows_enumerate() -> Result<Vec<MonitorInfo>> {
    use std::sync::Mutex;
    use windows::Win32::Foundation::{BOOL, LPARAM, RECT};
    use windows::Win32::Graphics::Gdi::{
        EnumDisplayMonitors, GetMonitorInfoW, HDC, HMONITOR, MONITORINFOEXW,
    };
    use windows::Win32::UI::HiDpi::GetDpiForMonitor;

    let monitors: Mutex<Vec<MonitorInfo>> = Mutex::new(Vec::new());
    let ptr = &monitors as *const _ as isize;

    unsafe {
        EnumDisplayMonitors(
            HDC::default(),
            None,
            Some(enum_monitors_callback),
            LPARAM(ptr),
        );
    }

    Ok(monitors.into_inner().unwrap_or_default())
}

#[cfg(target_os = "windows")]
unsafe extern "system" fn enum_monitors_callback(
    hmonitor: windows::Win32::Graphics::Gdi::HMONITOR,
    _hdc: windows::Win32::Graphics::Gdi::HDC,
    _lprect: *mut windows::Win32::Foundation::RECT,
    lparam: windows::Win32::Foundation::LPARAM,
) -> windows::Win32::Foundation::BOOL {
    use std::sync::Mutex;
    use windows::Win32::Graphics::Gdi::{GetMonitorInfoW, MONITORINFOEXW};
    use windows::Win32::UI::HiDpi::{GetDpiForMonitor, MDT_EFFECTIVE_DPI};
    use ovvy_core::game::WindowBounds;

    let mut info = MONITORINFOEXW::default();
    info.monitorInfo.cbSize = std::mem::size_of::<MONITORINFOEXW>() as u32;

    if GetMonitorInfoW(hmonitor, &mut info.monitorInfo as *mut _ as *mut _).as_bool() {
        let r = info.monitorInfo.rcMonitor;
        let w = info.monitorInfo.rcWork;

        let mut dpi_x = 96u32;
        let mut dpi_y = 96u32;
        let _ = GetDpiForMonitor(hmonitor, MDT_EFFECTIVE_DPI, &mut dpi_x, &mut dpi_y);

        let monitors = &*(lparam.0 as *const Mutex<Vec<MonitorInfo>>);
        if let Ok(mut guard) = monitors.lock() {
            let index = guard.len() as u32;
            guard.push(MonitorInfo {
                index,
                name: format!("Monitor {}", index + 1),
                bounds: WindowBounds {
                    x: r.left,
                    y: r.top,
                    width: (r.right - r.left).max(0) as u32,
                    height: (r.bottom - r.top).max(0) as u32,
                },
                work_area: WindowBounds {
                    x: w.left,
                    y: w.top,
                    width: (w.right - w.left).max(0) as u32,
                    height: (w.bottom - w.top).max(0) as u32,
                },
                dpi: dpi_x as f32,
                is_primary: info.monitorInfo.dwFlags & 1 != 0,
            });
        }
    }

    windows::Win32::Foundation::BOOL(1)
}
