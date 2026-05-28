# Ovvycmb — Architecture Document

## Overview

Ovvycmb is a premium desktop application for organizing multiple DOFUS, DOFUS Retro, and WAKFU game clients simultaneously. It provides window management, hotkeys, monitoring, automation QoL features, a GPU overlay, and AI-powered analysis agents.

## System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Ovvycmb.App (.exe)                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  WPF Shell                                           │   │
│  │  ├── MainWindow (borderless, custom chrome)          │   │
│  │  ├── WebView2 (React UI at localhost:7337)           │   │
│  │  └── SystemTrayService (NotifyIcon)                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  OverlayWindow (WPF transparent, click-through)      │   │
│  │  ├── HP bars per account                             │   │
│  │  ├── Alert widget                                    │   │
│  │  └── Combat timeline                                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ASP.NET Core (in-process, port 7337)                │   │
│  │  ├── Minimal API (/api/*)                            │   │
│  │  ├── SignalR Hub (/hub)                              │   │
│  │  ├── Swagger UI (/swagger)                           │   │
│  │  └── Prometheus metrics (/metrics)                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Core Services                                       │   │
│  │  ├── EventBus (Channel<T> broadcast)                 │   │
│  │  ├── AccountService (CRUD + focus)                   │   │
│  │  ├── LayoutService (CRUD + apply + auto-generate)    │   │
│  │  └── MonitoringService (background, 500ms scan)      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────┐ ┌────────────┐ ┌───────────────────────┐  │
│  │WindowManager│ │HotkeyService│ │AI Agents (7x Claude) │  │
│  │WinAPI P/Inv │ │RegisterHotKey│ │Architect/Security/   │  │
│  │EnumWindows  │ │WM_HOTKEY   │ │Performance/QA/Review  │  │
│  └─────────────┘ └────────────┘ └───────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  SQLite / Entity Framework Core                      │   │
│  │  Accounts · Groups · Layouts · Events                │   │
│  │  Hotkeys · AgentReports · Plugins · Settings         │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
                              │
                    WebSocket (SignalR)
                    REST API (fetch)
                              │
┌──────────────────────────────────────────────────────────────┐
│                React Frontend (WebView2)                     │
│  ├── Dashboard (account cards, event feed, stats)           │
│  ├── Layout Manager (apply/generate/manage layouts)         │
│  ├── AI Agents (run agents, view reports)                   │
│  ├── Plugins (manage game integrations)                     │
│  └── Settings (API key, window behavior, overlay)           │
└──────────────────────────────────────────────────────────────┘
```

## Module Responsibilities

| Module | Responsibility |
|--------|---------------|
| `Ovvycmb.Core` | Domain models, interfaces, event bus, configuration |
| `Ovvycmb.Storage` | SQLite persistence via EF Core, repositories |
| `Ovvycmb.WindowManager` | WinAPI window enumeration, layout engine, monitor detection |
| `Ovvycmb.Hotkeys` | Global hotkey registration via `RegisterHotKey` |
| `Ovvycmb.Ipc` | ASP.NET Core server, SignalR hub, REST endpoints |
| `Ovvycmb.Services` | Business logic, background monitoring loop |
| `Ovvycmb.AI` | Claude API client, 7 specialized AI agents |
| `Ovvycmb.Plugins` | Plugin host, plugin context, lifecycle management |
| `Ovvycmb.Overlay` | WPF transparent overlay, HP bars, alerts |
| `Ovvycmb.Telemetry` | Serilog logging, Prometheus metrics |
| `Ovvycmb.App` | WPF host, WebView2, system tray, entry point |

## Data Flow

```
Game Client (DOFUS.exe)
    │
    ▼ EnumWindows (every 500ms)
WindowManager.DetectGameClientsAsync()
    │
    ▼
MonitoringService.SyncWithDetectedClientsAsync()
    │
    ├── Updates Account.Status, Account.WindowHandle in SQLite
    │
    └── Publishes DomainEvent (AccountDetected / AccountLost / AccountStatusChanged)
            │
            ├── EventBus → SignalR Hub → React UI (real-time update)
            │
            ├── EventBus → OverlayService → OverlayWindow (HP bars update)
            │
            └── EventBus → PluginHost → Plugins (plugin events)
```

## Security Model

- No packet injection or memory modification
- WinAPI operations only: `SetForegroundWindow`, `MoveWindow`, `SendMessage`
- IPC server bound to localhost only (not accessible from network)
- Plugins loaded via `Assembly.LoadFrom` (full trust — official plugins only)
- Claude API key stored in SQLite settings (local only, never transmitted)
- No external telemetry — all data stays on device

## Performance Targets

| Metric | Target |
|--------|--------|
| RAM (idle, 8 clients) | < 80 MB |
| CPU (idle) | < 1% |
| Window scan cycle | 500ms |
| IPC response time | < 50ms |
| Overlay frame rate | 30 FPS |
| App startup time | < 3 seconds |

## AI Agents

7 specialized agents powered by Claude API:

| Agent | Purpose |
|-------|---------|
| Architect | Reviews architecture, detects technical debt |
| Security | Scans for vulnerabilities, unsafe patterns |
| Performance | Profiles CPU/RAM, identifies bottlenecks |
| QA | Generates test strategies, stress scenarios |
| Code Reviewer | Reviews code quality, conventions |
| Refactor | Proposes structural improvements |
| OCR Vision | Calibrates screen detection pipeline |

All agents: store results in SQLite, publish `AgentReportReady` events, support Claude context injection.
