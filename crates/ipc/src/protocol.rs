use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "cmd", rename_all = "snake_case")]
pub enum IpcRequest {
    // Account management
    ListAccounts,
    AddAccount { name: String, game_type: String },
    RemoveAccount { id: String },
    UpdateAccount { id: String, data: serde_json::Value },
    FocusAccount { id: String },

    // Layout management
    ListProfiles,
    ApplyProfile { id: String },
    SaveProfile { name: String, layouts: serde_json::Value },
    DeleteProfile { id: String },

    // Window management
    ScanWindows,
    SetWindowBounds { hwnd: i64, x: i32, y: i32, width: u32, height: u32 },
    GetMonitors,

    // Events
    GetRecentEvents { limit: u32 },
    SubscribeEvents,

    // Config
    GetConfig,
    UpdateConfig { key: String, value: serde_json::Value },

    // Agents
    RunAgent { agent_id: String, args: serde_json::Value },
    GetAgentReports { agent_id: Option<String> },

    // Plugins
    ListPlugins,
    EnablePlugin { id: String },
    DisablePlugin { id: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "status", rename_all = "snake_case")]
pub enum IpcResponse {
    Ok { data: serde_json::Value },
    Error { code: String, message: String },
}

impl IpcResponse {
    pub fn ok(data: impl Serialize) -> Self {
        Self::Ok {
            data: serde_json::to_value(data).unwrap_or(serde_json::Value::Null),
        }
    }

    pub fn error(code: impl Into<String>, message: impl Into<String>) -> Self {
        Self::Error {
            code: code.into(),
            message: message.into(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IpcMessage {
    pub id: Uuid,
    pub payload: serde_json::Value,
}
