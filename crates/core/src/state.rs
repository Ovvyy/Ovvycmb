use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::accounts::{Account, AccountId};
use crate::config::AppConfig;
use crate::events::SharedEventBus;
use crate::game::GameClient;
use crate::profiles::LayoutProfile;

#[derive(Debug)]
pub struct AppState {
    pub config: Arc<RwLock<AppConfig>>,
    pub accounts: Arc<RwLock<HashMap<AccountId, Account>>>,
    pub game_clients: Arc<RwLock<HashMap<u32, GameClient>>>,
    pub profiles: Arc<RwLock<HashMap<Uuid, LayoutProfile>>>,
    pub active_profile_id: Arc<RwLock<Option<Uuid>>>,
    pub focused_account_id: Arc<RwLock<Option<AccountId>>>,
    pub event_bus: SharedEventBus,
}

impl AppState {
    pub fn new(config: AppConfig, event_bus: SharedEventBus) -> Self {
        Self {
            config: Arc::new(RwLock::new(config)),
            accounts: Arc::new(RwLock::new(HashMap::new())),
            game_clients: Arc::new(RwLock::new(HashMap::new())),
            profiles: Arc::new(RwLock::new(HashMap::new())),
            active_profile_id: Arc::new(RwLock::new(None)),
            focused_account_id: Arc::new(RwLock::new(None)),
            event_bus,
        }
    }

    pub async fn account_count(&self) -> usize {
        self.accounts.read().await.len()
    }

    pub async fn online_account_count(&self) -> usize {
        self.accounts
            .read()
            .await
            .values()
            .filter(|a| a.is_alive())
            .count()
    }
}

pub type SharedAppState = Arc<AppState>;
