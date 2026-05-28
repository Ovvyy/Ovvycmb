use anyhow::Result;
use async_trait::async_trait;
use ovvy_core::events::SharedEventBus;
use serde::{Deserialize, Serialize};

use crate::memory::AgentMemory;
use crate::report::AgentReport;

pub type AgentId = &'static str;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentContext {
    pub agent_id: String,
    pub event_bus: Option<()>,
    pub args: serde_json::Value,
}

#[async_trait]
pub trait Agent: Send + Sync {
    fn id(&self) -> AgentId;
    fn description(&self) -> &str;

    async fn run(&self, ctx: &AgentContext) -> Result<AgentReport>;

    async fn run_periodic(&self, _ctx: &AgentContext) -> Result<()> {
        Ok(())
    }
}
