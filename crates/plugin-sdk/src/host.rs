use anyhow::Result;
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::sync::RwLock;
use tracing::{info, warn};

use crate::manifest::PluginManifest;
use crate::sandbox::{LoadedPlugin, PluginSandbox};

pub struct PluginHost {
    plugins: Arc<RwLock<HashMap<String, LoadedPlugin>>>,
    plugin_dir: PathBuf,
}

impl PluginHost {
    pub fn new(plugin_dir: PathBuf) -> Self {
        Self {
            plugins: Arc::new(RwLock::new(HashMap::new())),
            plugin_dir,
        }
    }

    pub async fn load_plugin(&self, manifest: PluginManifest) -> Result<()> {
        let id = manifest.id.clone();
        let wasm_path = self.plugin_dir.join(&id).join(&manifest.entry_wasm);

        if !wasm_path.exists() {
            return Err(anyhow::anyhow!("WASM file not found: {}", wasm_path.display()));
        }

        let wasm_bytes = tokio::fs::read(&wasm_path).await?;
        let sandbox = PluginSandbox::new(manifest)?;
        let loaded = sandbox.load_wasm(&wasm_bytes).await?;

        loaded.call_init()?;

        info!("Plugin loaded: {}", id);
        self.plugins.write().await.insert(id, loaded);
        Ok(())
    }

    pub async fn unload_plugin(&self, id: &str) -> Result<()> {
        let removed = self.plugins.write().await.remove(id);
        if removed.is_some() {
            info!("Plugin unloaded: {}", id);
        } else {
            warn!("Plugin not found for unload: {}", id);
        }
        Ok(())
    }

    pub async fn list_plugins(&self) -> Vec<String> {
        self.plugins.read().await.keys().cloned().collect()
    }

    pub async fn auto_load_plugins(&self) -> Result<()> {
        let mut dir = tokio::fs::read_dir(&self.plugin_dir).await?;
        while let Some(entry) = dir.next_entry().await? {
            let manifest_path = entry.path().join("plugin.json");
            if manifest_path.exists() {
                let content = tokio::fs::read_to_string(&manifest_path).await?;
                if let Ok(manifest) = serde_json::from_str::<PluginManifest>(&content) {
                    if let Err(e) = self.load_plugin(manifest).await {
                        warn!("Failed to load plugin: {}", e);
                    }
                }
            }
        }
        Ok(())
    }
}
