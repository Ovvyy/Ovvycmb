use anyhow::Result;
use ovvy_core::events::{AppEvent, SharedEventBus};
use std::time::Duration;
use tokio::time::interval;
use tracing::{debug, info, warn};

use crate::capture::ScreenCapture;
use crate::detector::GameUiDetector;

pub struct OcrPipeline {
    detector: GameUiDetector,
    event_bus: SharedEventBus,
    scan_interval_ms: u64,
}

impl OcrPipeline {
    pub fn new(event_bus: SharedEventBus, scan_interval_ms: u64) -> Self {
        Self {
            detector: GameUiDetector::new(),
            event_bus,
            scan_interval_ms,
        }
    }

    pub async fn run_for_window(&self, hwnd: isize, account_id: uuid::Uuid) {
        let mut ticker = interval(Duration::from_millis(self.scan_interval_ms));

        loop {
            ticker.tick().await;

            match ScreenCapture::capture_window(hwnd).await {
                Ok(image) => {
                    let detections = self.detector.detect_all(&image);
                    for detection in detections {
                        debug!(
                            account = %account_id,
                            event = %detection.event_type,
                            confidence = detection.confidence,
                            "OCR detection"
                        );
                        self.handle_detection(account_id, &detection.event_type);
                    }
                }
                Err(e) => {
                    warn!(account = %account_id, "Screen capture failed: {}", e);
                }
            }
        }
    }

    fn handle_detection(&self, account_id: uuid::Uuid, event_type: &str) {
        let event = match event_type {
            "combat_started" => Some(AppEvent::CombatStarted { account_id }),
            "combat_your_turn" => Some(AppEvent::CombatTurnStarted {
                account_id,
                turn_number: 1,
                time_limit_secs: 30,
            }),
            "trade_dialog" => Some(AppEvent::TradeRequested {
                account_id,
                from_player: "unknown".to_string(),
            }),
            "captcha_dialog" => Some(AppEvent::CaptchaDetected { account_id }),
            _ => None,
        };

        if let Some(event) = event {
            self.event_bus.publish(event, "ocr_pipeline");
        }
    }
}
