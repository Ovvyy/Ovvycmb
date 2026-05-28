use anyhow::Result;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use tracing::info;

use crate::agent::{Agent, AgentContext};
use crate::report::AgentReport;

pub struct AgentBus {
    agents: RwLock<HashMap<String, Arc<dyn Agent>>>,
}

impl AgentBus {
    pub fn new() -> Self {
        Self {
            agents: RwLock::new(HashMap::new()),
        }
    }

    pub async fn register(&self, agent: Arc<dyn Agent>) {
        let id = agent.id().to_string();
        info!("Registered agent: {}", id);
        self.agents.write().await.insert(id, agent);
    }

    pub async fn run_agent(&self, agent_id: &str, args: serde_json::Value) -> Result<AgentReport> {
        let agents = self.agents.read().await;
        let agent = agents
            .get(agent_id)
            .ok_or_else(|| anyhow::anyhow!("Agent not found: {}", agent_id))?;

        let ctx = AgentContext {
            agent_id: agent_id.to_string(),
            event_bus: None,
            args,
        };

        agent.run(&ctx).await
    }

    pub async fn list_agents(&self) -> Vec<(String, String)> {
        self.agents
            .read()
            .await
            .iter()
            .map(|(id, a)| (id.clone(), a.description().to_string()))
            .collect()
    }
}

impl Default for AgentBus {
    fn default() -> Self {
        Self::new()
    }
}
