use anyhow::Result;
use ovvy_core::events::{AppEvent, SharedEventBus};
use std::collections::HashMap;
use tracing::{debug, info, warn};

use crate::parser::{HotkeyAction, ParsedHotkey};

pub struct HotkeyManager {
    registrations: HashMap<u32, (ParsedHotkey, HotkeyAction)>,
    event_bus: SharedEventBus,
    next_id: u32,
}

impl HotkeyManager {
    pub fn new(event_bus: SharedEventBus) -> Self {
        Self {
            registrations: HashMap::new(),
            event_bus,
            next_id: 1,
        }
    }

    pub fn register(&mut self, hotkey_str: &str, action: HotkeyAction) -> Result<u32> {
        let hotkey = ParsedHotkey::parse(hotkey_str)
            .ok_or_else(|| anyhow::anyhow!("Invalid hotkey: {}", hotkey_str))?;

        let id = self.next_id;
        self.next_id += 1;

        #[cfg(target_os = "windows")]
        self.register_win32(id, &hotkey)?;

        info!(id, hotkey = hotkey_str, "Registered hotkey");
        self.registrations.insert(id, (hotkey, action));
        Ok(id)
    }

    pub fn unregister(&mut self, id: u32) -> Result<()> {
        #[cfg(target_os = "windows")]
        self.unregister_win32(id)?;

        self.registrations.remove(&id);
        info!(id, "Unregistered hotkey");
        Ok(())
    }

    pub fn unregister_all(&mut self) {
        let ids: Vec<u32> = self.registrations.keys().copied().collect();
        for id in ids {
            let _ = self.unregister(id);
        }
    }

    pub fn on_hotkey_triggered(&self, id: u32) {
        if let Some((_, action)) = self.registrations.get(&id) {
            let event = match action {
                HotkeyAction::FocusNext => AppEvent::HotkeyTriggered {
                    action: "focus_next".to_string(),
                    account_id: None,
                },
                HotkeyAction::FocusPrev => AppEvent::HotkeyTriggered {
                    action: "focus_prev".to_string(),
                    account_id: None,
                },
                HotkeyAction::FocusAccount { index } => AppEvent::HotkeyTriggered {
                    action: format!("focus_account_{}", index),
                    account_id: None,
                },
                HotkeyAction::ApplyLayout => AppEvent::HotkeyTriggered {
                    action: "apply_layout".to_string(),
                    account_id: None,
                },
                HotkeyAction::ToggleOverlay => AppEvent::HotkeyTriggered {
                    action: "toggle_overlay".to_string(),
                    account_id: None,
                },
                HotkeyAction::EmergencyStop => AppEvent::HotkeyTriggered {
                    action: "emergency_stop".to_string(),
                    account_id: None,
                },
                HotkeyAction::Custom { name } => AppEvent::HotkeyTriggered {
                    action: name.clone(),
                    account_id: None,
                },
            };
            self.event_bus.publish(event, "hotkeys");
        }
    }

    #[cfg(target_os = "windows")]
    fn register_win32(&self, id: u32, hotkey: &ParsedHotkey) -> Result<()> {
        use windows::Win32::UI::Input::KeyboardAndMouse::RegisterHotKey;
        use windows::Win32::Foundation::HWND;

        let vk = hotkey.vk_code.unwrap_or(0);
        if vk == 0 {
            return Err(anyhow::anyhow!("Unknown virtual key for hotkey"));
        }

        unsafe {
            RegisterHotKey(
                HWND::default(),
                id as i32,
                windows::Win32::UI::Input::KeyboardAndMouse::HOT_KEY_MODIFIERS(
                    hotkey.modifiers_win32()
                ),
                vk,
            )?;
        }
        Ok(())
    }

    #[cfg(target_os = "windows")]
    fn unregister_win32(&self, id: u32) -> Result<()> {
        use windows::Win32::UI::Input::KeyboardAndMouse::UnregisterHotKey;
        use windows::Win32::Foundation::HWND;

        unsafe {
            UnregisterHotKey(HWND::default(), id as i32)?;
        }
        Ok(())
    }
}
