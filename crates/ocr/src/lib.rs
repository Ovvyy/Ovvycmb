pub mod capture;
pub mod detector;
pub mod pipeline;
pub mod templates;

pub use capture::ScreenCapture;
pub use detector::{DetectionResult, GameUiDetector};
pub use pipeline::OcrPipeline;
