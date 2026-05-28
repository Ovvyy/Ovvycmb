use anyhow::Result;
use async_trait::async_trait;

use crate::agent::{Agent, AgentContext, AgentId};
use crate::claude_client::ClaudeClient;
use crate::report::{AgentReport, Finding, ReportSeverity};

const SYSTEM_PROMPT: &str = r#"
You are an expert software architect specializing in desktop applications, Rust, and gaming tools.
Your task is to analyze the OVVYCMB codebase architecture and provide:
1. Technical debt identification
2. Architecture improvements
3. Module coupling issues
4. Missing abstractions
5. Scalability concerns

Be specific, actionable, and reference actual code patterns.
Output a JSON object with fields: summary, findings (array of {title, description, severity, suggestion}).
"#;

pub struct ArchitectAgent {
    client: Option<ClaudeClient>,
}

impl ArchitectAgent {
    pub fn new(api_key: Option<String>) -> Self {
        Self {
            client: api_key.map(|k| ClaudeClient::new(k, "claude-sonnet-4-6")),
        }
    }
}

#[async_trait]
impl Agent for ArchitectAgent {
    fn id(&self) -> AgentId {
        "architect"
    }

    fn description(&self) -> &str {
        "Analyzes global architecture, detects technical debt, proposes refactors"
    }

    async fn run(&self, ctx: &AgentContext) -> Result<AgentReport> {
        let mut report = AgentReport::new("architect", "architecture_review", "Architecture analysis");

        if let Some(client) = &self.client {
            let prompt = format!(
                "Analyze this context and provide architecture feedback: {}",
                ctx.args
            );
            let response = client.complete(SYSTEM_PROMPT, &prompt).await?;

            if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(&response) {
                report.summary = parsed["summary"]
                    .as_str()
                    .unwrap_or("Analysis complete")
                    .to_string();

                if let Some(findings) = parsed["findings"].as_array() {
                    for f in findings {
                        report.add_finding(Finding {
                            title: f["title"].as_str().unwrap_or("Finding").to_string(),
                            description: f["description"].as_str().unwrap_or("").to_string(),
                            severity: match f["severity"].as_str() {
                                Some("critical") => ReportSeverity::Critical,
                                Some("warning") => ReportSeverity::Warning,
                                _ => ReportSeverity::Suggestion,
                            },
                            location: f["location"].as_str().map(String::from),
                            suggestion: f["suggestion"].as_str().map(String::from),
                        });
                    }
                }
            }
        } else {
            report.summary = "AI not configured — set API key to enable agent analysis".to_string();
            report.add_finding(Finding {
                title: "AI Agent Inactive".to_string(),
                description: "Configure an Anthropic API key to enable intelligent architecture review".to_string(),
                severity: ReportSeverity::Info,
                location: None,
                suggestion: Some("Settings → AI → API Key".to_string()),
            });
        }

        Ok(report)
    }
}
