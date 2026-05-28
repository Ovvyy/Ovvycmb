use anyhow::Result;
use ovvy_core::profiles::{Layout, LayoutProfile};
use ovvy_core::game::GameClient;
use tracing::info;

use crate::monitor::MonitorInfo;
use crate::window_ops::WindowOps;

pub struct LayoutEngine {
    window_ops: Box<dyn WindowOps>,
    monitors: Vec<MonitorInfo>,
}

impl LayoutEngine {
    pub fn new(window_ops: Box<dyn WindowOps>, monitors: Vec<MonitorInfo>) -> Self {
        Self { window_ops, monitors }
    }

    pub async fn apply_profile(
        &self,
        profile: &LayoutProfile,
        clients: &[GameClient],
    ) -> Result<()> {
        info!(
            profile = %profile.name,
            client_count = clients.len(),
            "Applying layout profile"
        );

        for (slot_idx, client) in clients.iter().enumerate() {
            if let Some(layout) = profile.layouts.get(slot_idx) {
                self.apply_layout(client, layout).await?;
            }
        }

        Ok(())
    }

    async fn apply_layout(&self, client: &GameClient, layout: &Layout) -> Result<()> {
        if layout.is_minimized {
            self.window_ops.minimize_window(client.window_handle).await?;
        } else {
            self.window_ops.restore_window(client.window_handle).await?;
            self.window_ops
                .set_bounds(client.window_handle, layout.bounds)
                .await?;
        }
        Ok(())
    }

    pub async fn focus_by_order(&self, clients: &[GameClient], order_index: usize) -> Result<()> {
        if let Some(client) = clients.get(order_index) {
            self.window_ops.focus_window(client.window_handle).await?;
        }
        Ok(())
    }

    pub async fn cascade_focus(&self, clients: &[GameClient]) -> Result<()> {
        for client in clients.iter().rev() {
            self.window_ops.restore_window(client.window_handle).await?;
        }
        Ok(())
    }
}
