pub mod agent;
pub mod bus;
pub mod claude_client;
pub mod memory;
pub mod report;

pub mod agents {
    pub mod architect;
    pub mod code_reviewer;
    pub mod ocr_vision;
    pub mod performance;
    pub mod qa;
    pub mod refactor;
    pub mod security;
}

pub use agent::{Agent, AgentContext, AgentId};
pub use bus::AgentBus;
pub use report::{AgentReport, ReportSeverity};
