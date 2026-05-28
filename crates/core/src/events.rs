use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::broadcast;
use uuid::Uuid;

use crate::accounts::AccountId;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum AppEvent {
    // Account lifecycle
    AccountAdded { account_id: AccountId },
    AccountRemoved { account_id: AccountId },
    AccountStatusChanged { account_id: AccountId, status: crate::accounts::AccountStatus },
    AccountFocused { account_id: AccountId },

    // Game events
    CombatStarted { account_id: AccountId },
    CombatEnded { account_id: AccountId, victory: Option<bool> },
    CombatTurnStarted { account_id: AccountId, turn_number: u32, time_limit_secs: u32 },
    TradeRequested { account_id: AccountId, from_player: String },
    GroupInviteReceived { account_id: AccountId, from_player: String },
    ClientCrashed { account_id: AccountId, exit_code: Option<i32> },
    ClientDisconnected { account_id: AccountId },
    CaptchaDetected { account_id: AccountId },
    LevelUp { account_id: AccountId, new_level: u32 },

    // Window management
    WindowLayoutChanged { profile_id: Uuid },
    WindowMoved { account_id: AccountId, x: i32, y: i32, width: u32, height: u32 },
    WindowMinimized { account_id: AccountId },
    WindowRestored { account_id: AccountId },

    // Hotkeys
    HotkeyTriggered { action: String, account_id: Option<AccountId> },

    // System
    DaemonStarted,
    DaemonStopping,
    ConfigChanged { key: String },
    PluginLoaded { plugin_id: String },
    PluginUnloaded { plugin_id: String },
    AgentReport { agent_id: String, report_type: String, summary: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventEnvelope {
    pub id: Uuid,
    pub timestamp: DateTime<Utc>,
    pub event: AppEvent,
    pub source: String,
}

impl EventEnvelope {
    pub fn new(event: AppEvent, source: impl Into<String>) -> Self {
        Self {
            id: Uuid::new_v4(),
            timestamp: Utc::now(),
            event,
            source: source.into(),
        }
    }
}

#[derive(Clone)]
pub struct EventBus {
    sender: broadcast::Sender<EventEnvelope>,
}

impl EventBus {
    pub fn new(capacity: usize) -> Self {
        let (sender, _) = broadcast::channel(capacity);
        Self { sender }
    }

    pub fn publish(&self, event: AppEvent, source: impl Into<String>) {
        let envelope = EventEnvelope::new(event, source);
        // Ignore errors when no receivers
        let _ = self.sender.send(envelope);
    }

    pub fn subscribe(&self) -> broadcast::Receiver<EventEnvelope> {
        self.sender.subscribe()
    }

    pub fn sender(&self) -> broadcast::Sender<EventEnvelope> {
        self.sender.clone()
    }
}

impl std::fmt::Debug for EventBus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("EventBus")
            .field("receiver_count", &self.sender.receiver_count())
            .finish()
    }
}

pub type SharedEventBus = Arc<EventBus>;

pub fn create_event_bus() -> SharedEventBus {
    Arc::new(EventBus::new(1024))
}
