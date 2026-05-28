use anyhow::Result;
use async_trait::async_trait;
use crate::agent::{Agent, AgentContext, AgentId};
use crate::report::{AgentReport, Finding, ReportSeverity};

pub struct QaAgent;

#[async_trait]
impl Agent for QaAgent {
    fn id(&self) -> AgentId { "qa" }
    fn description(&self) -> &str {
        "Generates tests, performs UI stress testing, reproduces crashes"
    }

    async fn run(&self, ctx: &AgentContext) -> Result<AgentReport> {
        let report = AgentReport::new("qa", "qa_scan", "QA analysis — generate tests for untested modules");
        Ok(report)
    }
}
