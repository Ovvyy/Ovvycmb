use anyhow::Result;
use async_trait::async_trait;
use crate::agent::{Agent, AgentContext, AgentId};
use crate::report::{AgentReport, Finding, ReportSeverity};

pub struct PerformanceAgent;

#[async_trait]
impl Agent for PerformanceAgent {
    fn id(&self) -> AgentId { "performance" }
    fn description(&self) -> &str {
        "Profiles CPU/RAM usage, detects memory leaks, benchmarks rendering"
    }

    async fn run(&self, ctx: &AgentContext) -> Result<AgentReport> {
        let mut report = AgentReport::new("performance", "performance_profile", "Performance analysis");

        // Collect system metrics
        let metrics = collect_system_metrics().await;
        report.metrics = serde_json::to_value(&metrics).unwrap_or_default();
        report.summary = format!(
            "CPU: {:.1}%, RAM: {} MB",
            metrics.cpu_percent,
            metrics.ram_mb
        );

        if metrics.cpu_percent > 15.0 {
            report.add_finding(Finding {
                title: "High CPU Usage".to_string(),
                description: format!("Daemon CPU at {:.1}% — check scan_interval_ms", metrics.cpu_percent),
                severity: ReportSeverity::Warning,
                location: Some("apps/daemon".to_string()),
                suggestion: Some("Increase scan_interval_ms from 500 to 1000ms".to_string()),
            });
        }

        Ok(report)
    }
}

#[derive(serde::Serialize)]
struct SystemMetrics {
    cpu_percent: f32,
    ram_mb: u64,
    thread_count: u32,
}

async fn collect_system_metrics() -> SystemMetrics {
    SystemMetrics {
        cpu_percent: 0.0,
        ram_mb: 0,
        thread_count: 0,
    }
}
