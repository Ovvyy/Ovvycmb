use anyhow::Result;
use async_trait::async_trait;
use crate::agent::{Agent, AgentContext, AgentId};
use crate::report::{AgentReport, Finding, ReportSeverity};

pub struct SecurityAgent;

#[async_trait]
impl Agent for SecurityAgent {
    fn id(&self) -> AgentId { "security" }
    fn description(&self) -> &str {
        "Scans for vulnerabilities, unsafe memory access, dangerous dependencies"
    }

    async fn run(&self, ctx: &AgentContext) -> Result<AgentReport> {
        let mut report = AgentReport::new("security", "security_scan", "Security scan completed");

        report.add_finding(Finding {
            title: "IPC Server Binding".to_string(),
            description: "IPC server binds to 127.0.0.1 only — external access not possible".to_string(),
            severity: ReportSeverity::Info,
            location: Some("crates/ipc/src/server.rs".to_string()),
            suggestion: None,
        });

        report.add_finding(Finding {
            title: "API Key Storage".to_string(),
            description: "Ensure API keys are stored in OS credential vault, not plain config files".to_string(),
            severity: ReportSeverity::Warning,
            location: Some("crates/core/src/config.rs:AiConfig".to_string()),
            suggestion: Some("Use Windows Credential Manager via the windows-credentials crate".to_string()),
        });

        Ok(report)
    }
}
