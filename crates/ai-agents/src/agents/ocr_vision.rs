use anyhow::Result;
use async_trait::async_trait;
use crate::agent::{Agent, AgentContext, AgentId};
use crate::report::AgentReport;

pub struct OcrVisionAgent;

#[async_trait]
impl Agent for OcrVisionAgent {
    fn id(&self) -> AgentId { "ocr_vision" }
    fn description(&self) -> &str {
        "Trains CV pipelines, improves UI recognition, adjusts dynamic detection"
    }

    async fn run(&self, ctx: &AgentContext) -> Result<AgentReport> {
        let report = AgentReport::new("ocr_vision", "vision_calibration", "OCR/Vision calibration report");
        Ok(report)
    }
}
