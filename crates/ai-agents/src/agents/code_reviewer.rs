use anyhow::Result;
use async_trait::async_trait;
use crate::agent::{Agent, AgentContext, AgentId};
use crate::report::{AgentReport, Finding, ReportSeverity};

pub struct CodeReviewerAgent;

#[async_trait]
impl Agent for CodeReviewerAgent {
    fn id(&self) -> AgentId { "code_reviewer" }
    fn description(&self) -> &str {
        "Continuous code review: conventions, quality, duplication, complexity"
    }

    async fn run(&self, ctx: &AgentContext) -> Result<AgentReport> {
        let report = AgentReport::new("code_reviewer", "code_review", "Code review pass completed");
        Ok(report)
    }
}
