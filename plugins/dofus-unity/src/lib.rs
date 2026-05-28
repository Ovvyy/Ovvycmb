/// DOFUS Unity plugin
/// Provides game-specific detection, automation helpers, and UI element recognition
/// for DOFUS (Unity) clients

use ovvy_core::game::GameType;

pub const GAME_TYPE: GameType = GameType::DofusUnity;
pub const PLUGIN_VERSION: &str = "0.1.0";

pub mod detection;
pub mod automation;
