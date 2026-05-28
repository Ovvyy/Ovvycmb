use anyhow::Result;
use wasmtime::{Engine, Linker, Module, Store};
use tracing::info;

use crate::manifest::PluginManifest;

pub struct PluginSandbox {
    engine: Engine,
    manifest: PluginManifest,
}

impl PluginSandbox {
    pub fn new(manifest: PluginManifest) -> Result<Self> {
        let engine = Engine::default();
        Ok(Self { engine, manifest })
    }

    pub async fn load_wasm(&self, wasm_bytes: &[u8]) -> Result<LoadedPlugin> {
        let module = Module::new(&self.engine, wasm_bytes)?;
        info!("Loaded WASM plugin: {}", self.manifest.id);
        Ok(LoadedPlugin {
            module,
            manifest: self.manifest.clone(),
        })
    }
}

pub struct LoadedPlugin {
    module: Module,
    pub manifest: PluginManifest,
}

impl LoadedPlugin {
    pub fn call_init(&self) -> Result<()> {
        // WASM initialization via Wasmtime linker
        // Full implementation in plugin host
        Ok(())
    }
}
