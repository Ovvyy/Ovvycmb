# Ovvycmb — Architecture Document

## Overview

Ovvycmb is a premium multi-account organizer for DOFUS, DOFUS Retro, and WAKFU.
It is designed as a professional-grade desktop product: performant, modular, secure, and maintainable.

---

## Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| Backend Core | **Rust** | Memory-safe, near-zero overhead, runs 24/7 with 16+ clients |
| Frontend | **Tauri v2 + React** | 3-10× lighter than Electron; native WebView2; Rust IPC |
| UI Framework | **React 18 + Tailwind CSS** | Component ecosystem, fast iteration |
| Animations | **Framer Motion** | GPU-accelerated, smooth 60fps transitions |
| State | **Zustand** | Minimal footprint, no Redux boilerplate |
| Window Mgmt | **windows-rs (WinAPI)** | Native EnumWindows, SetForegroundWindow, MoveWindow |
| Screen Capture | **GDI BitBlt / DXGI** | Low-latency captures for OCR pipeline |
| Overlay | **Direct2D + Layered Windows** | GPU rendering, per-pixel alpha, click-through |
| Database | **SQLite via sqlx** | Embedded, zero-config, async |
| IPC | **Axum WebSocket + REST** | Real-time event streaming to frontend |
| Plugins | **WASM via Wasmtime** | Sandboxed, capability-restricted, safe |
| AI Agents | **Claude API (Anthropic)** | Intelligent analysis, optional, cloud/local hybrid |
| Observability | **tracing + OpenTelemetry** | Structured logs, metrics, spans |
| CI/CD | **GitHub Actions** | Windows builds, tests, security audit, releases |

---

## Process Architecture

```
┌─────────────────────────────────────────────────────┐
│  ovvycmb-desktop (Tauri)                            │
│  ┌──────────────┐  ┌───────────────────────────┐   │
│  │ React UI     │  │ Rust Backend (Tauri cmds) │   │
│  │ - Dashboard  │←─│ - AccountManager          │   │
│  │ - Layout Mgr │  │ - LayoutEngine            │   │
│  │ - Agents     │  │ - HotkeyManager           │   │
│  │ - Settings   │  │ - AgentBus                │   │
│  └──────────────┘  └───────────┬───────────────┘   │
└──────────────────────────────────┼──────────────────┘
                                   │ WebSocket/REST
┌──────────────────────────────────┼──────────────────┐
│  ovvycmb-daemon                  │                  │
│  ┌──────────────────────────┐    │                  │
│  │ IPC Server (Axum :7337)  │←───┘                  │
│  │ - WS event streaming     │                       │
│  │ - REST RPC endpoints     │                       │
│  └──────────┬───────────────┘                       │
│             │                                        │
│  ┌──────────▼───────────────────────────────────┐   │
│  │ Core Engine                                  │   │
│  │ - Process Scanner (500ms scan loop)          │   │
│  │ - EventBus (broadcast channel)               │   │
│  │ - AppState (RwLock<HashMap>)                 │   │
│  │ - HotkeyManager (WinAPI RegisterHotKey)      │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌─────────────────┐  ┌───────────────────────┐     │
│  │ OCR Pipeline    │  │ Plugin Host            │     │
│  │ (GDI capture +  │  │ (WASM Wasmtime)       │     │
│  │  template match)│  │                       │     │
│  └─────────────────┘  └───────────────────────┘     │
└──────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  ovvycmb-overlay                                    │
│  - Direct2D layered window per game client          │
│  - HP bars, combat timer, status widgets            │
│  - Connects to daemon via WS for state              │
└─────────────────────────────────────────────────────┘
```

---

## Monorepo Structure

```
ovvycmb/
├── apps/
│   ├── desktop/              # Tauri app (UI + Rust commands)
│   │   ├── src-tauri/        # Rust backend (window, hotkeys, agents)
│   │   └── src/              # React frontend
│   ├── daemon/               # Background service (IPC, scanner)
│   └── overlay/              # Direct2D GPU overlay process
│
├── crates/                   # Shared Rust crates
│   ├── core/                 # Domain models, events, state, config
│   ├── window-manager/       # WinAPI window detection + manipulation
│   ├── hotkeys/              # Global hotkey system
│   ├── ocr/                  # Screen capture + template detection
│   ├── vision/               # Computer vision pipeline
│   ├── ipc/                  # Axum REST+WS server
│   ├── storage/              # SQLite repositories
│   ├── telemetry/            # Tracing + metrics
│   ├── plugin-sdk/           # WASM plugin host
│   └── ai-agents/            # Claude-powered analysis agents
│
├── plugins/                  # Official game plugins
│   ├── dofus-unity/          # DOFUS Unity integration
│   ├── dofus-retro/          # DOFUS Retro integration
│   └── wakfu/                # WAKFU integration
│
├── docs/
│   ├── architecture/         # This document + diagrams
│   └── api/                  # IPC API reference
│
└── .github/workflows/        # CI/CD pipelines
```

---

## Event Architecture

All inter-component communication uses a zero-copy broadcast channel (`tokio::sync::broadcast`).

```
EventBus (capacity: 1024)
    │
    ├─► OCR Pipeline — publishes: CombatStarted, TurnStarted, CaptchaDetected
    ├─► Window Scanner — publishes: AccountStatusChanged, ClientCrashed
    ├─► Hotkey Manager — publishes: HotkeyTriggered
    ├─► Tauri Commands — publishes: AccountAdded, AccountRemoved, LayoutChanged
    │
    └─► Subscribers:
        ├── IPC WebSocket (→ frontend)
        ├── Storage (event persistence)
        ├── Watchdog (crash recovery)
        └── Agent Bus (analysis triggers)
```

---

## Database Schema

See `crates/storage/src/migrations/001_initial.sql` for the complete schema.

Key tables:
- `accounts` — account registry with live state
- `layout_profiles` — saved window dispositions
- `events` — event history (7-day retention)
- `plugin_registry` — installed plugins
- `agent_reports` — AI analysis results
- `app_config` — key-value configuration store

---

## AI Agents

Each agent is a Rust struct implementing the `Agent` trait:

```rust
#[async_trait]
pub trait Agent: Send + Sync {
    fn id(&self) -> AgentId;
    fn description(&self) -> &str;
    async fn run(&self, ctx: &AgentContext) -> Result<AgentReport>;
}
```

| Agent | Purpose |
|-------|---------|
| `architect` | Architecture review, technical debt, refactoring suggestions |
| `security` | Vulnerability scanning, unsafe patterns, credential handling |
| `performance` | CPU/RAM profiling, leak detection, render bottlenecks |
| `qa` | Test generation, stress testing, crash reproduction |
| `code_reviewer` | Code quality, conventions, duplication |
| `refactor` | Structural improvements, module simplification |
| `ocr_vision` | CV pipeline calibration, template accuracy tuning |

Agents communicate results via `AgentReport` published to the `EventBus` and stored in `agent_reports` table.

---

## Plugin System

Plugins are WASM modules sandboxed via Wasmtime with capability-based access control:

```
plugin.json (PluginManifest)
└── capabilities: [ReadAccounts, PublishEvents, WindowOverlay]
    └── entry_wasm: "plugin.wasm"
```

Sensitive capabilities (WriteAccounts, NetworkLocal, FileSystem) require explicit user consent.

---

## Security Model

- **No packet injection** — all automation uses WinAPI SendMessage/PostMessage
- **No anti-cheat bypass** — only observes window state via WinAPI and screen pixels
- **IPC localhost only** — binds to 127.0.0.1:7337
- **Plugin sandbox** — WASM capability restrictions via Wasmtime
- **API keys** — stored in OS credential vault (Windows Credential Manager)
- **No telemetry to external servers** — all metrics are local

---

## Roadmap

### MVP (v0.1) — Current
- [x] Monorepo architecture
- [x] Core domain models
- [x] WinAPI window detection
- [x] Layout manager (presets + profiles)
- [x] Global hotkeys
- [x] Tauri desktop app
- [x] React UI (dashboard, accounts, layout, agents, settings)
- [x] SQLite persistence
- [x] Event bus
- [x] AI agent framework
- [x] Plugin SDK
- [x] CI/CD pipeline

### v0.2 — OCR & Overlay
- [ ] Direct2D overlay rendering
- [ ] Template-based combat detection
- [ ] HP bar reading
- [ ] Turn timer
- [ ] Alerts system

### v0.3 — Automation
- [ ] Auto-ready in combat
- [ ] Trade dialog detection & accept
- [ ] Group invite handler
- [ ] Smart hotkey rotation
- [ ] Auto-reconnect on disconnect

### v0.4 — Intelligence
- [ ] AI agent deep integration
- [ ] Anomaly detection
- [ ] Combat analytics
- [ ] Initiative-based focus ordering

### v1.0 — Enterprise
- [ ] Plugin marketplace
- [ ] User profiles & cloud sync (opt-in)
- [ ] Installer (NSIS + MSI)
- [ ] Auto-updater
- [ ] i18n (FR/EN)
