use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ParsedHotkey {
    pub ctrl: bool,
    pub alt: bool,
    pub shift: bool,
    pub win: bool,
    pub key: String,
    pub vk_code: Option<u32>,
}

impl ParsedHotkey {
    pub fn parse(s: &str) -> Option<Self> {
        let parts: Vec<&str> = s.split('+').map(str::trim).collect();
        let mut hotkey = ParsedHotkey {
            ctrl: false,
            alt: false,
            shift: false,
            win: false,
            key: String::new(),
            vk_code: None,
        };

        for part in &parts {
            match part.to_uppercase().as_str() {
                "CTRL" | "CONTROL" => hotkey.ctrl = true,
                "ALT" => hotkey.alt = true,
                "SHIFT" => hotkey.shift = true,
                "WIN" | "WINDOWS" | "META" => hotkey.win = true,
                key => {
                    hotkey.key = key.to_string();
                    hotkey.vk_code = key_to_vk(key);
                }
            }
        }

        if hotkey.key.is_empty() {
            None
        } else {
            Some(hotkey)
        }
    }

    pub fn modifiers_win32(&self) -> u32 {
        let mut mods = 0u32;
        if self.alt { mods |= 0x0001; }   // MOD_ALT
        if self.ctrl { mods |= 0x0002; }  // MOD_CONTROL
        if self.shift { mods |= 0x0004; } // MOD_SHIFT
        if self.win { mods |= 0x0008; }   // MOD_WIN
        mods
    }
}

fn key_to_vk(key: &str) -> Option<u32> {
    match key.to_uppercase().as_str() {
        "A"..="Z" => Some(key.chars().next()?.to_ascii_uppercase() as u32),
        "0"..="9" => Some(key.chars().next()? as u32),
        "F1" => Some(0x70), "F2" => Some(0x71), "F3" => Some(0x72),
        "F4" => Some(0x73), "F5" => Some(0x74), "F6" => Some(0x75),
        "F7" => Some(0x76), "F8" => Some(0x77), "F9" => Some(0x78),
        "F10" => Some(0x79), "F11" => Some(0x7A), "F12" => Some(0x7B),
        "TAB" => Some(0x09),
        "SPACE" => Some(0x20),
        "ENTER" | "RETURN" => Some(0x0D),
        "ESCAPE" | "ESC" => Some(0x1B),
        "DELETE" | "DEL" => Some(0x2E),
        "INSERT" => Some(0x2D),
        "HOME" => Some(0x24),
        "END" => Some(0x23),
        "PAGEUP" => Some(0x21),
        "PAGEDOWN" => Some(0x22),
        "LEFT" => Some(0x25), "UP" => Some(0x26),
        "RIGHT" => Some(0x27), "DOWN" => Some(0x28),
        _ => None,
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum HotkeyAction {
    FocusNext,
    FocusPrev,
    FocusAccount { index: u32 },
    ApplyLayout,
    ToggleOverlay,
    EmergencyStop,
    Custom { name: String },
}
