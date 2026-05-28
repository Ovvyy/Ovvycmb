use ovvy_ai_agents::{
    agents::{
        architect::ArchitectAgent,
        security::SecurityAgent,
        performance::PerformanceAgent,
        qa::QaAgent,
        code_reviewer::CodeReviewerAgent,
        refactor::RefactorAgent,
        ocr_vision::OcrVisionAgent,
    },
    bus::AgentBus,
    report::AgentReport,
};
use ovvy_core::state::SharedAppState;
use std::sync::Arc;
use tauri::State;

#[tauri::command]
pub async fn list_agents() -> Result<Vec<serde_json::Value>, String> {
    Ok(vec![
        serde_json::json!({ "id": "architect", "description": "Architecture review and technical debt detection" }),
        serde_json::json!({ "id": "security", "description": "Security scan and vulnerability analysis" }),
        serde_json::json!({ "id": "performance", "description": "CPU/RAM profiling and leak detection" }),
        serde_json::json!({ "id": "qa", "description": "Test generation and stress testing" }),
        serde_json::json!({ "id": "code_reviewer", "description": "Continuous code quality review" }),
        serde_json::json!({ "id": "refactor", "description": "Structural improvement suggestions" }),
        serde_json::json!({ "id": "ocr_vision", "description": "OCR/CV pipeline calibration" }),
    ])
}

#[tauri::command]
pub async fn run_agent(
    state: State<'_, SharedAppState>,
    agent_id: String,
    args: serde_json::Value,
) -> Result<AgentReport, String> {
    let api_key = state.config.read().await.ai.api_key.clone();

    let ctx = ovvy_ai_agents::agent::AgentContext {
        agent_id: agent_id.clone(),
        event_bus: None,
        args,
    };

    let report = match agent_id.as_str() {
        "architect" => ArchitectAgent::new(api_key).run(&ctx).await,
        "security" => SecurityAgent.run(&ctx).await,
        "performance" => PerformanceAgent.run(&ctx).await,
        "qa" => QaAgent.run(&ctx).await,
        "code_reviewer" => CodeReviewerAgent.run(&ctx).await,
        "refactor" => RefactorAgent.run(&ctx).await,
        "ocr_vision" => OcrVisionAgent.run(&ctx).await,
        _ => return Err(format!("Unknown agent: {}", agent_id)),
    };

    report.map_err(|e| e.to_string())
}
