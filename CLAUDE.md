# Ovvycmb — CLAUDE.md

## Project Overview

**Ovvycmb** is a premium multi-account organizer for DOFUS, DOFUS Retro, and WAKFU.
It is a Windows-first desktop application built with C# .NET 8 + WPF + WebView2 + React.

## Stack

- **Backend**: C# .NET 8 (multi-project solution)
- **Desktop Host**: WPF + WebView2 (renders React frontend)
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Framer Motion
- **IPC**: ASP.NET Core Minimal API + SignalR (port 7337)
- **Database**: SQLite via Entity Framework Core
- **AI**: Claude API (Anthropic) via HTTP — optional, requires API key
- **Overlay**: WPF transparent click-through window

## Key Commands

```bash
# Build the entire solution
dotnet build Ovvycmb.sln

# Run tests
dotnet test Ovvycmb.sln

# Lint
dotnet build Ovvycmb.sln -warnaserror

# Frontend dev server (proxies to C# backend)
cd apps/desktop && pnpm dev

# Build frontend (outputs to src/Ovvycmb.App/wwwroot/)
cd apps/desktop && pnpm build

# Publish single .exe (Windows x64, self-contained)
dotnet publish src/Ovvycmb.App/Ovvycmb.App.csproj \
  -c Release -r win-x64 \
  --self-contained true \
  -p:PublishSingleFile=true \
  -p:EnableCompressionInSingleFile=true \
  -o publish/

# Full build (frontend + backend)
cd apps/desktop && pnpm build && cd ../.. && dotnet publish src/Ovvycmb.App/Ovvycmb.App.csproj -c Release -r win-x64 --self-contained -p:PublishSingleFile=true -o publish/
```

## Repository Structure

```
Ovvycmb.sln                  → Solution file
Directory.Build.props         → Shared MSBuild properties
Directory.Packages.props      → Centralized NuGet versions

src/
  Ovvycmb.Core/              → Domain models, events, interfaces
  Ovvycmb.Storage/           → EF Core + SQLite repositories
  Ovvycmb.WindowManager/     → WinAPI P/Invoke (window detection + layout)
  Ovvycmb.Hotkeys/           → Global hotkey registration
  Ovvycmb.Ipc/               → ASP.NET Core API + SignalR hub
  Ovvycmb.Services/          → Business logic services
  Ovvycmb.AI/                → Claude AI agents (7 specialized)
  Ovvycmb.Plugins/           → Plugin SDK + host (MEF-style)
  Ovvycmb.Overlay/           → WPF transparent GPU overlay
  Ovvycmb.Telemetry/         → Serilog + Prometheus metrics
  Ovvycmb.App/               → WPF host + WebView2 (main .exe)

apps/
  desktop/                   → React + TypeScript + Tailwind frontend

plugins/                     → Official game plugins (C#)
docs/                        → Architecture documentation
```

## Architecture

```
┌─────────────────────────────────────────────┐
│  Ovvycmb.App (WPF + WebView2)               │
│  ┌─────────────────────────────────────┐    │
│  │  React UI (Tailwind + Framer Motion) │    │
│  │  ← SignalR events                   │    │
│  │  → REST API calls                   │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ASP.NET Core (in-process, port 7337)       │
│  ├── /api/* — Minimal API endpoints         │
│  ├── /hub   — SignalR hub                   │
│  └── /metrics — Prometheus                  │
│                                             │
│  Services                                   │
│  ├── MonitoringService (background scan)    │
│  ├── AccountService                         │
│  └── LayoutService                          │
│                                             │
│  Infrastructure                             │
│  ├── EventBus (in-memory broadcast)         │
│  ├── SQLite / EF Core                       │
│  ├── WindowManager (WinAPI P/Invoke)        │
│  ├── HotkeyService (RegisterHotKey)         │
│  ├── OverlayWindow (WPF transparent)        │
│  ├── AI Agents (Claude API)                 │
│  └── PluginHost (Assembly.LoadFrom)         │
└─────────────────────────────────────────────┘
```

## Code Standards

- Use C# nullable reference types everywhere
- All async methods use `CancellationToken`
- Use `ILogger<T>` via DI (no Console.WriteLine)
- Windows-specific code: test with `RuntimeInformation.IsOSPlatform(OSPlatform.Windows)` or `#if WINDOWS`
- Domain events via `IEventBus` — never direct method calls between modules
- EF Core repositories use scoped lifetime
- SignalR hub handles all real-time push to frontend
- No packet injection, no memory modification, no anti-cheat bypass

## Architecture Principles

1. **Event-driven**: All inter-module communication via `IEventBus`
2. **Local-first**: No external telemetry, all data on device
3. **Modular**: Each project has a single responsibility
4. **Windows-native**: WinAPI for window management, zero web dependencies for core features
5. **Plugin-safe**: Plugins load into app domain (no WASM sandbox — full trust required)

## IPC Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/accounts | List all accounts |
| POST | /api/accounts | Create account |
| PUT | /api/accounts/{id} | Update account |
| DELETE | /api/accounts/{id} | Delete account |
| POST | /api/accounts/{id}/focus | Focus game window |
| GET | /api/layouts | List layouts |
| POST | /api/layouts | Create layout |
| POST | /api/layouts/{id}/apply | Apply layout |
| POST | /api/layouts/auto-generate | Auto-generate grid layout |
| GET | /api/system/health | Health check |
| GET | /api/system/monitors | List monitors |
| GET | /api/system/clients | List detected clients |
| GET | /api/events | Recent events |
| WS | /hub | SignalR real-time events |
| GET | /swagger | API documentation |
| GET | /metrics | Prometheus metrics |
