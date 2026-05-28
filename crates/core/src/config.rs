use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub general: GeneralConfig,
    pub window_manager: WindowManagerConfig,
    pub overlay: OverlayConfig,
    pub hotkeys: HotkeyConfig,
    pub automation: AutomationConfig,
    pub telemetry: TelemetryConfig,
    pub ai: AiConfig,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            general: GeneralConfig::default(),
            window_manager: WindowManagerConfig::default(),
            overlay: OverlayConfig::default(),
            hotkeys: HotkeyConfig::default(),
            automation: AutomationConfig::default(),
            telemetry: TelemetryConfig::default(),
            ai: AiConfig::default(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeneralConfig {
    pub app_name: String,
    pub language: String,
    pub theme: Theme,
    pub minimize_to_tray: bool,
    pub start_with_windows: bool,
    pub check_updates: bool,
    pub safe_mode: bool,
}

impl Default for GeneralConfig {
    fn default() -> Self {
        Self {
            app_name: "Ovvycmb".to_string(),
            language: "fr".to_string(),
            theme: Theme::Dark,
            minimize_to_tray: true,
            start_with_windows: false,
            check_updates: true,
            safe_mode: false,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum Theme {
    Dark,
    Light,
    System,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WindowManagerConfig {
    pub scan_interval_ms: u64,
    pub focus_delay_ms: u64,
    pub restore_on_launch: bool,
    pub remember_positions: bool,
    pub dpi_aware: bool,
}

impl Default for WindowManagerConfig {
    fn default() -> Self {
        Self {
            scan_interval_ms: 500,
            focus_delay_ms: 50,
            restore_on_launch: true,
            remember_positions: true,
            dpi_aware: true,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OverlayConfig {
    pub enabled: bool,
    pub opacity: f32,
    pub position: OverlayPosition,
    pub widgets: OverlayWidgets,
    pub font_size: u32,
    pub click_through: bool,
}

impl Default for OverlayConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            opacity: 0.85,
            position: OverlayPosition::TopRight,
            widgets: OverlayWidgets::default(),
            font_size: 12,
            click_through: false,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum OverlayPosition {
    TopLeft,
    TopRight,
    BottomLeft,
    BottomRight,
    Custom { x: i32, y: i32 },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OverlayWidgets {
    pub hp_bars: bool,
    pub combat_timeline: bool,
    pub account_status: bool,
    pub alerts: bool,
    pub live_logs: bool,
    pub minimap: bool,
}

impl Default for OverlayWidgets {
    fn default() -> Self {
        Self {
            hp_bars: true,
            combat_timeline: true,
            account_status: true,
            alerts: true,
            live_logs: false,
            minimap: false,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HotkeyConfig {
    pub focus_next: Option<String>,
    pub focus_prev: Option<String>,
    pub apply_layout: Option<String>,
    pub toggle_overlay: Option<String>,
    pub emergency_stop: Option<String>,
}

impl Default for HotkeyConfig {
    fn default() -> Self {
        Self {
            focus_next: Some("Alt+Tab".to_string()),
            focus_prev: Some("Alt+Shift+Tab".to_string()),
            apply_layout: Some("Ctrl+Alt+L".to_string()),
            toggle_overlay: Some("Ctrl+Alt+O".to_string()),
            emergency_stop: Some("Ctrl+Alt+X".to_string()),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutomationConfig {
    pub auto_accept_trade: bool,
    pub auto_ready_combat: bool,
    pub auto_accept_group: bool,
    pub turn_alert_threshold_secs: u32,
    pub auto_reconnect: bool,
    pub reconnect_delay_secs: u32,
}

impl Default for AutomationConfig {
    fn default() -> Self {
        Self {
            auto_accept_trade: false,
            auto_ready_combat: false,
            auto_accept_group: false,
            turn_alert_threshold_secs: 5,
            auto_reconnect: true,
            reconnect_delay_secs: 10,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TelemetryConfig {
    pub local_metrics: bool,
    pub structured_logging: bool,
    pub log_level: String,
    pub retain_days: u32,
}

impl Default for TelemetryConfig {
    fn default() -> Self {
        Self {
            local_metrics: true,
            structured_logging: true,
            log_level: "info".to_string(),
            retain_days: 7,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AiConfig {
    pub enabled: bool,
    pub api_key: Option<String>,
    pub model: String,
    pub local_memory: bool,
}

impl Default for AiConfig {
    fn default() -> Self {
        Self {
            enabled: false,
            api_key: None,
            model: "claude-sonnet-4-6".to_string(),
            local_memory: true,
        }
    }
}
