use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

pub type AccountId = Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum AccountStatus {
    Offline,
    Connecting,
    Online,
    InCombat,
    Trading,
    Idle,
    Disconnected,
    Crashed,
    WaitingCaptcha,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Account {
    pub id: AccountId,
    pub name: String,
    pub character_name: Option<String>,
    pub game_type: crate::game::GameType,
    pub status: AccountStatus,
    pub process_id: Option<u32>,
    pub window_handle: Option<isize>,
    pub hp_current: Option<u32>,
    pub hp_max: Option<u32>,
    pub initiative: Option<u32>,
    pub level: Option<u32>,
    pub class: Option<String>,
    pub server: Option<String>,
    pub last_seen: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub color_tag: Option<String>,
    pub notes: Option<String>,
    pub group_id: Option<Uuid>,
    pub order_index: u32,
}

impl Account {
    pub fn new(name: impl Into<String>, game_type: crate::game::GameType) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            name: name.into(),
            character_name: None,
            game_type,
            status: AccountStatus::Offline,
            process_id: None,
            window_handle: None,
            hp_current: None,
            hp_max: None,
            initiative: None,
            level: None,
            class: None,
            server: None,
            last_seen: now,
            created_at: now,
            color_tag: None,
            notes: None,
            group_id: None,
            order_index: 0,
        }
    }

    pub fn hp_percent(&self) -> Option<f32> {
        match (self.hp_current, self.hp_max) {
            (Some(cur), Some(max)) if max > 0 => Some(cur as f32 / max as f32 * 100.0),
            _ => None,
        }
    }

    pub fn is_alive(&self) -> bool {
        !matches!(self.status, AccountStatus::Offline | AccountStatus::Crashed | AccountStatus::Disconnected)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AccountGroup {
    pub id: Uuid,
    pub name: String,
    pub color: String,
    pub account_ids: Vec<AccountId>,
}
