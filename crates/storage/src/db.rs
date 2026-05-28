use anyhow::Result;
use sqlx::{sqlite::SqlitePoolOptions, Pool, Sqlite};
use std::path::Path;
use tracing::info;

pub type DbPool = Pool<Sqlite>;

pub struct Database {
    pub pool: DbPool,
}

impl Database {
    pub async fn connect(db_path: &Path) -> Result<Self> {
        if let Some(parent) = db_path.parent() {
            tokio::fs::create_dir_all(parent).await?;
        }

        let url = format!("sqlite://{}?mode=rwc", db_path.display());
        info!("Connecting to database: {}", url);

        let pool = SqlitePoolOptions::new()
            .max_connections(5)
            .connect(&url)
            .await?;

        let db = Self { pool };
        db.run_migrations().await?;

        Ok(db)
    }

    async fn run_migrations(&self) -> Result<()> {
        sqlx::query(include_str!("migrations/001_initial.sql"))
            .execute(&self.pool)
            .await?;
        info!("Database migrations applied");
        Ok(())
    }

    pub async fn close(self) {
        self.pool.close().await;
    }
}
