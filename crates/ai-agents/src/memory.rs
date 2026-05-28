use serde::{Deserialize, Serialize};
use std::collections::VecDeque;

const MAX_MEMORY_ENTRIES: usize = 100;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryEntry {
    pub key: String,
    pub value: serde_json::Value,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Default)]
pub struct AgentMemory {
    entries: VecDeque<MemoryEntry>,
    kv: std::collections::HashMap<String, serde_json::Value>,
}

impl AgentMemory {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn remember(&mut self, key: impl Into<String>, value: impl Serialize) {
        let key = key.into();
        let value = serde_json::to_value(value).unwrap_or_default();

        if self.entries.len() >= MAX_MEMORY_ENTRIES {
            self.entries.pop_front();
        }

        self.entries.push_back(MemoryEntry {
            key: key.clone(),
            value: value.clone(),
            timestamp: chrono::Utc::now(),
        });

        self.kv.insert(key, value);
    }

    pub fn recall(&self, key: &str) -> Option<&serde_json::Value> {
        self.kv.get(key)
    }

    pub fn recent_entries(&self, n: usize) -> Vec<&MemoryEntry> {
        self.entries.iter().rev().take(n).collect()
    }
}
