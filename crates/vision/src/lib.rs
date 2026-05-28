/// Computer vision pipeline for game state detection
/// Wraps the OCR crate with higher-level game-state interpretation

pub mod classifier;
pub mod tracker;

pub use classifier::StateClassifier;
