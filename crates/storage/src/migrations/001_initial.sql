CREATE TABLE IF NOT EXISTS accounts (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    character_name TEXT,
    game_type   TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'offline',
    process_id  INTEGER,
    window_handle INTEGER,
    hp_current  INTEGER,
    hp_max      INTEGER,
    initiative  INTEGER,
    level       INTEGER,
    class       TEXT,
    server      TEXT,
    color_tag   TEXT,
    notes       TEXT,
    group_id    TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    last_seen   TEXT NOT NULL,
    created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS account_groups (
    id      TEXT PRIMARY KEY,
    name    TEXT NOT NULL,
    color   TEXT NOT NULL DEFAULT '#4f46e5'
);

CREATE TABLE IF NOT EXISTS layout_profiles (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    description     TEXT,
    monitor_count   INTEGER NOT NULL DEFAULT 1,
    is_default      INTEGER NOT NULL DEFAULT 0,
    hotkey          TEXT,
    layouts_json    TEXT NOT NULL DEFAULT '[]',
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
    id          TEXT PRIMARY KEY,
    timestamp   TEXT NOT NULL,
    event_type  TEXT NOT NULL,
    account_id  TEXT,
    payload     TEXT NOT NULL,
    source      TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_events_account ON events(account_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);

CREATE TABLE IF NOT EXISTS app_config (
    key     TEXT PRIMARY KEY,
    value   TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS plugin_registry (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    version     TEXT NOT NULL,
    enabled     INTEGER NOT NULL DEFAULT 1,
    config_json TEXT NOT NULL DEFAULT '{}',
    installed_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS agent_reports (
    id          TEXT PRIMARY KEY,
    agent_id    TEXT NOT NULL,
    report_type TEXT NOT NULL,
    summary     TEXT NOT NULL,
    details     TEXT NOT NULL DEFAULT '{}',
    severity    TEXT NOT NULL DEFAULT 'info',
    created_at  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_agent_reports_agent ON agent_reports(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_reports_created ON agent_reports(created_at DESC);
