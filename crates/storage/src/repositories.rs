use anyhow::Result;
use chrono::Utc;
use ovvy_core::accounts::Account;
use ovvy_core::events::EventEnvelope;
use ovvy_core::profiles::LayoutProfile;
use serde_json;
use sqlx::Row;
use uuid::Uuid;

use crate::db::DbPool;

pub struct AccountRepository {
    pool: DbPool,
}

impl AccountRepository {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }

    pub async fn upsert(&self, account: &Account) -> Result<()> {
        sqlx::query!(
            r#"INSERT OR REPLACE INTO accounts
               (id, name, character_name, game_type, status, process_id, window_handle,
                hp_current, hp_max, initiative, level, class, server, color_tag, notes,
                group_id, order_index, last_seen, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"#,
            account.id.to_string(),
            account.name,
            account.character_name,
            serde_json::to_string(&account.game_type)?,
            serde_json::to_string(&account.status)?,
            account.process_id.map(|p| p as i64),
            account.window_handle,
            account.hp_current.map(|h| h as i64),
            account.hp_max.map(|h| h as i64),
            account.initiative.map(|i| i as i64),
            account.level.map(|l| l as i64),
            account.class,
            account.server,
            account.color_tag,
            account.notes,
            account.group_id.map(|g| g.to_string()),
            account.order_index as i64,
            account.last_seen.to_rfc3339(),
            account.created_at.to_rfc3339(),
        )
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    pub async fn delete(&self, id: Uuid) -> Result<()> {
        sqlx::query!("DELETE FROM accounts WHERE id = ?", id.to_string())
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    pub async fn list(&self) -> Result<Vec<serde_json::Value>> {
        let rows = sqlx::query("SELECT * FROM accounts ORDER BY order_index ASC")
            .fetch_all(&self.pool)
            .await?;

        let accounts: Vec<serde_json::Value> = rows
            .iter()
            .map(|row| {
                serde_json::json!({
                    "id": row.get::<String, _>("id"),
                    "name": row.get::<String, _>("name"),
                    "character_name": row.get::<Option<String>, _>("character_name"),
                    "game_type": row.get::<String, _>("game_type"),
                    "status": row.get::<String, _>("status"),
                    "order_index": row.get::<i64, _>("order_index"),
                })
            })
            .collect();

        Ok(accounts)
    }
}

pub struct ProfileRepository {
    pool: DbPool,
}

impl ProfileRepository {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }

    pub async fn save(&self, profile: &LayoutProfile) -> Result<()> {
        let layouts_json = serde_json::to_string(&profile.layouts)?;
        sqlx::query!(
            r#"INSERT OR REPLACE INTO layout_profiles
               (id, name, description, monitor_count, is_default, hotkey, layouts_json, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"#,
            profile.id.to_string(),
            profile.name,
            profile.description,
            profile.monitor_count as i64,
            profile.is_default as i64,
            profile.hotkey,
            layouts_json,
            profile.created_at.to_rfc3339(),
            profile.updated_at.to_rfc3339(),
        )
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    pub async fn list(&self) -> Result<Vec<serde_json::Value>> {
        let rows = sqlx::query("SELECT * FROM layout_profiles ORDER BY name ASC")
            .fetch_all(&self.pool)
            .await?;

        let profiles = rows
            .iter()
            .map(|row| {
                serde_json::json!({
                    "id": row.get::<String, _>("id"),
                    "name": row.get::<String, _>("name"),
                    "is_default": row.get::<i64, _>("is_default") != 0,
                    "monitor_count": row.get::<i64, _>("monitor_count"),
                })
            })
            .collect();

        Ok(profiles)
    }
}

pub struct EventRepository {
    pool: DbPool,
}

impl EventRepository {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }

    pub async fn insert(&self, envelope: &EventEnvelope) -> Result<()> {
        let event_type = format!("{:?}", envelope.event)
            .split_whitespace()
            .next()
            .unwrap_or("Unknown")
            .to_string();

        let payload = serde_json::to_string(&envelope.event)?;

        sqlx::query!(
            "INSERT INTO events (id, timestamp, event_type, payload, source) VALUES (?, ?, ?, ?, ?)",
            envelope.id.to_string(),
            envelope.timestamp.to_rfc3339(),
            event_type,
            payload,
            envelope.source,
        )
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    pub async fn recent(&self, limit: u32) -> Result<Vec<serde_json::Value>> {
        let rows = sqlx::query(
            "SELECT * FROM events ORDER BY timestamp DESC LIMIT ?",
        )
        .bind(limit as i64)
        .fetch_all(&self.pool)
        .await?;

        let events = rows
            .iter()
            .map(|row| {
                serde_json::json!({
                    "id": row.get::<String, _>("id"),
                    "timestamp": row.get::<String, _>("timestamp"),
                    "event_type": row.get::<String, _>("event_type"),
                    "source": row.get::<String, _>("source"),
                })
            })
            .collect();

        Ok(events)
    }

    pub async fn cleanup_old(&self, retain_days: u32) -> Result<u64> {
        let cutoff = Utc::now() - chrono::Duration::days(retain_days as i64);
        let result = sqlx::query!(
            "DELETE FROM events WHERE timestamp < ?",
            cutoff.to_rfc3339()
        )
        .execute(&self.pool)
        .await?;
        Ok(result.rows_affected())
    }
}
