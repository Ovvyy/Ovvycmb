/// GPU-accelerated overlay process using Direct2D
/// Renders HP bars, combat timers, and status widgets
/// on top of DOFUS windows via layered/transparent windows

use anyhow::Result;
use tracing::info;

#[cfg(target_os = "windows")]
mod windows_overlay;

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();
    info!("Ovvycmb overlay starting");

    #[cfg(target_os = "windows")]
    windows_overlay::run().await?;

    #[cfg(not(target_os = "windows"))]
    eprintln!("Overlay is Windows-only");

    Ok(())
}
