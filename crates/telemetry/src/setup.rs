use anyhow::Result;
use tracing_subscriber::{fmt, layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};

pub fn init_telemetry(log_level: &str, json_output: bool) -> Result<()> {
    let env_filter = EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new(log_level));

    if json_output {
        tracing_subscriber::registry()
            .with(env_filter)
            .with(fmt::layer().json().with_current_span(true))
            .init();
    } else {
        tracing_subscriber::registry()
            .with(env_filter)
            .with(fmt::layer().with_target(true).with_thread_ids(true))
            .init();
    }

    Ok(())
}
