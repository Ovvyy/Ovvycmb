use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::game::WindowBounds;

pub type ProfileId = Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LayoutProfile {
    pub id: ProfileId,
    pub name: String,
    pub description: Option<String>,
    pub layouts: Vec<Layout>,
    pub monitor_count: u32,
    pub is_default: bool,
    pub hotkey: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl LayoutProfile {
    pub fn new(name: impl Into<String>, monitor_count: u32) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            name: name.into(),
            description: None,
            layouts: Vec::new(),
            monitor_count,
            is_default: false,
            hotkey: None,
            created_at: now,
            updated_at: now,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Layout {
    pub account_slot: u32,
    pub bounds: WindowBounds,
    pub monitor_index: u32,
    pub z_order: i32,
    pub is_minimized: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum LayoutPreset {
    Grid2x2,
    Grid2x4,
    Grid4x4,
    Horizontal,
    Vertical,
    PrimaryFocus,
    TwoMonitorSplit,
    Custom,
}

impl LayoutPreset {
    pub fn generate(&self, count: u32, monitor_bounds: &[WindowBounds]) -> Vec<Layout> {
        let primary = monitor_bounds.first().copied().unwrap_or(WindowBounds {
            x: 0,
            y: 0,
            width: 1920,
            height: 1080,
        });

        match self {
            LayoutPreset::Grid2x2 => generate_grid(count, primary, 2, 2),
            LayoutPreset::Grid2x4 => generate_grid(count, primary, 2, 4),
            LayoutPreset::Grid4x4 => generate_grid(count, primary, 4, 4),
            LayoutPreset::Horizontal => generate_horizontal(count, primary),
            LayoutPreset::Vertical => generate_vertical(count, primary),
            _ => generate_grid(count, primary, 2, 2),
        }
    }
}

fn generate_grid(count: u32, bounds: WindowBounds, rows: u32, cols: u32) -> Vec<Layout> {
    let cell_w = bounds.width / cols;
    let cell_h = bounds.height / rows;

    (0..count.min(rows * cols))
        .map(|i| {
            let row = i / cols;
            let col = i % cols;
            Layout {
                account_slot: i,
                bounds: WindowBounds {
                    x: bounds.x + (col * cell_w) as i32,
                    y: bounds.y + (row * cell_h) as i32,
                    width: cell_w,
                    height: cell_h,
                },
                monitor_index: 0,
                z_order: 0,
                is_minimized: false,
            }
        })
        .collect()
}

fn generate_horizontal(count: u32, bounds: WindowBounds) -> Vec<Layout> {
    let cell_w = bounds.width / count.max(1);
    (0..count)
        .map(|i| Layout {
            account_slot: i,
            bounds: WindowBounds {
                x: bounds.x + (i * cell_w) as i32,
                y: bounds.y,
                width: cell_w,
                height: bounds.height,
            },
            monitor_index: 0,
            z_order: 0,
            is_minimized: false,
        })
        .collect()
}

fn generate_vertical(count: u32, bounds: WindowBounds) -> Vec<Layout> {
    let cell_h = bounds.height / count.max(1);
    (0..count)
        .map(|i| Layout {
            account_slot: i,
            bounds: WindowBounds {
                x: bounds.x,
                y: bounds.y + (i * cell_h) as i32,
                width: bounds.width,
                height: cell_h,
            },
            monitor_index: 0,
            z_order: 0,
            is_minimized: false,
        })
        .collect()
}
