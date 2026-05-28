use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum ReportSeverity {
    Info,
    Warning,
    Critical,
    Suggestion,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Finding {
    pub title: String,
    pub description: String,
    pub severity: ReportSeverity,
    pub location: Option<String>,
    pub suggestion: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentReport {
    pub id: Uuid,
    pub agent_id: String,
    pub report_type: String,
    pub summary: String,
    pub findings: Vec<Finding>,
    pub metrics: serde_json::Value,
    pub created_at: DateTime<Utc>,
}

impl AgentReport {
    pub fn new(agent_id: impl Into<String>, report_type: impl Into<String>, summary: impl Into<String>) -> Self {
        Self {
            id: Uuid::new_v4(),
            agent_id: agent_id.into(),
            report_type: report_type.into(),
            summary: summary.into(),
            findings: Vec::new(),
            metrics: serde_json::Value::Object(Default::default()),
            created_at: Utc::now(),
        }
    }

    pub fn add_finding(&mut self, finding: Finding) {
        self.findings.push(finding);
    }

    pub fn critical_count(&self) -> usize {
        self.findings.iter().filter(|f| f.severity == ReportSeverity::Critical).count()
    }

    pub fn warning_count(&self) -> usize {
        self.findings.iter().filter(|f| f.severity == ReportSeverity::Warning).count()
    }
}
