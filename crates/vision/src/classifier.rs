use ovvy_core::game::GameState;
use ovvy_ocr::detector::DetectionResult;

pub struct StateClassifier;

impl StateClassifier {
    pub fn classify(detections: &[DetectionResult]) -> GameState {
        for d in detections {
            match d.event_type.as_str() {
                "combat_started" | "combat_your_turn" if d.confidence > 0.85 => {
                    return GameState::InCombat { turn_number: 1 };
                }
                "trade_dialog" if d.confidence > 0.85 => {
                    return GameState::InTrade;
                }
                _ => {}
            }
        }
        GameState::InGame
    }
}
