use anyhow::Result;
use axum::{
    extract::{State, WebSocketUpgrade},
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use ovvy_core::state::SharedAppState;
use std::net::SocketAddr;
use tower_http::cors::CorsLayer;
use tracing::info;

use crate::protocol::{IpcRequest, IpcResponse};
use crate::websocket::ws_handler;

pub struct IpcServer {
    state: SharedAppState,
    port: u16,
}

impl IpcServer {
    pub fn new(state: SharedAppState, port: u16) -> Self {
        Self { state, port }
    }

    pub async fn run(self) -> Result<()> {
        let app = Router::new()
            .route("/api/v1/rpc", post(rpc_handler))
            .route("/api/v1/ws", get(ws_upgrade_handler))
            .route("/api/v1/health", get(health_handler))
            .layer(CorsLayer::permissive())
            .with_state(self.state);

        let addr = SocketAddr::from(([127, 0, 0, 1], self.port));
        info!("IPC server listening on {}", addr);

        let listener = tokio::net::TcpListener::bind(addr).await?;
        axum::serve(listener, app).await?;
        Ok(())
    }
}

async fn rpc_handler(
    State(state): State<SharedAppState>,
    Json(request): Json<IpcRequest>,
) -> Json<IpcResponse> {
    let response = dispatch(state, request).await;
    Json(response)
}

async fn ws_upgrade_handler(
    ws: WebSocketUpgrade,
    State(state): State<SharedAppState>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| ws_handler(socket, state))
}

async fn health_handler() -> Json<serde_json::Value> {
    Json(serde_json::json!({ "status": "ok", "version": env!("CARGO_PKG_VERSION") }))
}

async fn dispatch(state: SharedAppState, request: IpcRequest) -> IpcResponse {
    match request {
        IpcRequest::ListAccounts => {
            let accounts = state.accounts.read().await;
            IpcResponse::ok(accounts.values().collect::<Vec<_>>())
        }

        IpcRequest::GetMonitors => {
            match ovvy_window_manager::monitor::enumerate_monitors() {
                Ok(monitors) => IpcResponse::ok(monitors),
                Err(e) => IpcResponse::error("MONITOR_ERROR", e.to_string()),
            }
        }

        IpcRequest::GetConfig => {
            let config = state.config.read().await;
            IpcResponse::ok(&*config)
        }

        IpcRequest::GetRecentEvents { limit } => {
            IpcResponse::ok(serde_json::json!({ "events": [], "limit": limit }))
        }

        _ => IpcResponse::ok(serde_json::json!({ "message": "handled" })),
    }
}
