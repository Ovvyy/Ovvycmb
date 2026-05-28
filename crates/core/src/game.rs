use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "snake_case")]
pub enum GameType {
    DofusUnity,
    DofusRetro,
    Wakfu,
}

impl GameType {
    pub fn display_name(&self) -> &'static str {
        match self {
            GameType::DofusUnity => "DOFUS",
            GameType::DofusRetro => "DOFUS Retro",
            GameType::Wakfu => "WAKFU",
        }
    }

    pub fn process_name(&self) -> &'static str {
        match self {
            GameType::DofusUnity => "Dofus.exe",
            GameType::DofusRetro => "Dofus Retro.exe",
            GameType::Wakfu => "Wakfu.exe",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum GameState {
    Login,
    CharacterSelect,
    Loading,
    InGame,
    InCombat { turn_number: u32 },
    InTrade,
    InDialog,
    Dead,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GameClient {
    pub process_id: u32,
    pub window_handle: isize,
    pub game_type: GameType,
    pub state: GameState,
    pub title: String,
    pub width: u32,
    pub height: u32,
    pub x: i32,
    pub y: i32,
    pub monitor_index: u32,
    pub is_focused: bool,
    pub is_minimized: bool,
}

impl GameClient {
    pub fn bounds(&self) -> WindowBounds {
        WindowBounds {
            x: self.x,
            y: self.y,
            width: self.width,
            height: self.height,
        }
    }
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct WindowBounds {
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
}

impl WindowBounds {
    pub fn center(&self) -> (i32, i32) {
        (
            self.x + self.width as i32 / 2,
            self.y + self.height as i32 / 2,
        )
    }
}
