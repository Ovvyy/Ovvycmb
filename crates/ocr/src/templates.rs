// Template calibration data for DOFUS UI elements
// Templates are loaded from disk at runtime; this module manages the registry

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TemplateEntry {
    pub id: String,
    pub game_type: String,
    pub description: String,
    pub file: String,
    pub threshold: f32,
    pub region_hint: Option<[f32; 4]>,
}

pub struct TemplateRegistry {
    templates: HashMap<String, TemplateEntry>,
    base_dir: PathBuf,
}

impl TemplateRegistry {
    pub fn new(base_dir: PathBuf) -> Self {
        Self {
            templates: HashMap::new(),
            base_dir,
        }
    }

    pub async fn load_all(&mut self) -> anyhow::Result<()> {
        let index_path = self.base_dir.join("index.json");
        if !index_path.exists() {
            return Ok(());
        }

        let content = tokio::fs::read_to_string(&index_path).await?;
        let entries: Vec<TemplateEntry> = serde_json::from_str(&content)?;

        for entry in entries {
            self.templates.insert(entry.id.clone(), entry);
        }

        Ok(())
    }

    pub fn get(&self, id: &str) -> Option<&TemplateEntry> {
        self.templates.get(id)
    }

    pub fn list(&self) -> Vec<&TemplateEntry> {
        self.templates.values().collect()
    }
}
