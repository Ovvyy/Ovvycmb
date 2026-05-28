use axum::extract::ws::{Message, WebSocket};
use futures::{sink::SinkExt, stream::StreamExt};
use ovvy_core::state::SharedAppState;
use tracing::{debug, info, warn};

pub async fn ws_handler(socket: WebSocket, state: SharedAppState) {
    let (mut sender, mut receiver) = socket.split();
    let mut event_rx = state.event_bus.subscribe();

    // Task: forward events to websocket client
    let mut event_task = tokio::spawn(async move {
        while let Ok(envelope) = event_rx.recv().await {
            if let Ok(json) = serde_json::to_string(&envelope) {
                if sender.send(Message::Text(json.into())).await.is_err() {
                    break;
                }
            }
        }
    });

    // Task: receive messages from websocket client
    let mut recv_task = tokio::spawn(async move {
        while let Some(Ok(msg)) = receiver.next().await {
            match msg {
                Message::Text(text) => {
                    debug!("WS received: {}", text);
                }
                Message::Close(_) => {
                    info!("WS client disconnected");
                    break;
                }
                Message::Ping(data) => {
                    // Pong is handled automatically by axum
                }
                _ => {}
            }
        }
    });

    tokio::select! {
        _ = &mut event_task => recv_task.abort(),
        _ = &mut recv_task => event_task.abort(),
    }
}
