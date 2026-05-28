use anyhow::Result;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use tracing::debug;

const ANTHROPIC_API_URL: &str = "https://api.anthropic.com/v1/messages";

#[derive(Debug, Clone)]
pub struct ClaudeClient {
    client: Client,
    api_key: String,
    model: String,
}

impl ClaudeClient {
    pub fn new(api_key: impl Into<String>, model: impl Into<String>) -> Self {
        Self {
            client: Client::new(),
            api_key: api_key.into(),
            model: model.into(),
        }
    }

    pub async fn complete(&self, system: &str, prompt: &str) -> Result<String> {
        let request = ClaudeRequest {
            model: self.model.clone(),
            max_tokens: 4096,
            system: system.to_string(),
            messages: vec![ClaudeMessage {
                role: "user".to_string(),
                content: prompt.to_string(),
            }],
        };

        debug!("Calling Claude API with model {}", self.model);

        let response = self
            .client
            .post(ANTHROPIC_API_URL)
            .header("x-api-key", &self.api_key)
            .header("anthropic-version", "2023-06-01")
            .header("content-type", "application/json")
            .json(&request)
            .send()
            .await?;

        let body: ClaudeResponse = response.json().await?;
        let text = body
            .content
            .into_iter()
            .filter_map(|c| if c.content_type == "text" { Some(c.text) } else { None })
            .collect::<Vec<_>>()
            .join("\n");

        Ok(text)
    }
}

#[derive(Serialize)]
struct ClaudeRequest {
    model: String,
    max_tokens: u32,
    system: String,
    messages: Vec<ClaudeMessage>,
}

#[derive(Serialize)]
struct ClaudeMessage {
    role: String,
    content: String,
}

#[derive(Deserialize)]
struct ClaudeResponse {
    content: Vec<ContentBlock>,
}

#[derive(Deserialize)]
struct ContentBlock {
    #[serde(rename = "type")]
    content_type: String,
    text: String,
}
