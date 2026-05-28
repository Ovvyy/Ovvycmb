use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginManifest {
    pub id: String,
    pub name: String,
    pub version: String,
    pub description: String,
    pub author: String,
    pub homepage: Option<String>,
    pub min_app_version: String,
    pub capabilities: Vec<PluginCapability>,
    pub entry_wasm: String,
    pub config_schema: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum PluginCapability {
    ReadAccounts,
    WriteAccounts,
    ReadEvents,
    PublishEvents,
    WindowOverlay,
    HotkeyRegister,
    NetworkLocal,
    FileSystem { path: String },
}

impl PluginCapability {
    pub fn is_sensitive(&self) -> bool {
        matches!(
            self,
            Self::WriteAccounts | Self::NetworkLocal | Self::FileSystem { .. }
        )
    }
}
