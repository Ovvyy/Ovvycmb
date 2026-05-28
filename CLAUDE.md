# Ovvycmb — CLAUDE.md

## Project Overview

**Ovvycmb** is a premium multi-account organizer for DOFUS, DOFUS Retro, and WAKFU.
It is a Windows-first desktop application built with Rust + Tauri + React.

## Stack

- **Backend**: Rust (workspace of crates)
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Framer Motion
- **Desktop**: Tauri v2
- **Database**: SQLite via sqlx
- **IPC**: Axum WebSocket + REST (port 7337)
- **Plugins**: WASM via Wasmtime
- **AI**: Claude API (Anthropic) — optional, requires API key

## Key Commands

```bash
# Frontend dev
pnpm --filter desktop dev

# Tauri dev (needs Rust + Node)
pnpm --filter desktop tauri dev

# Build all Rust crates
cargo build --workspace

# Run tests
cargo test --workspace

# Build daemon
cargo build --bin ovvycmb-daemon

# Lint Rust
cargo clippy --all-targets -- -D warnings

# Format Rust
cargo fmt --all

# Typecheck frontend
pnpm --filter desktop typecheck
```

## Repository Structure

```
apps/desktop/     → Tauri desktop app (main UI)
apps/daemon/      → Background daemon process (IPC server, scanner)
apps/overlay/     → Direct2D GPU overlay
crates/core/      → Domain models, events, config, state
crates/window-manager/ → WinAPI window detection + layout
crates/hotkeys/   → Global hotkey registration
crates/ocr/       → Screen capture + detection pipeline
crates/ipc/       → Axum REST+WS server
crates/storage/   → SQLite repositories
crates/ai-agents/ → Claude-powered AI agents
crates/plugin-sdk/ → WASM plugin host
crates/telemetry/ → Tracing + metrics
plugins/          → Official game plugins (DOFUS Unity, Retro, WAKFU)
docs/             → Architecture docs
```

## Architecture Principles

1. **Event-driven**: All inter-component communication via `EventBus` (broadcast channel)
2. **Capability-based security**: Plugins restricted via WASM sandbox
3. **No packet injection**: Only WinAPI/SendMessage automation
4. **Local-first**: No external telemetry, all data stays on device
5. **Modular**: Each crate has a single responsibility

## Code Standards

- Use `thiserror` for library errors, `anyhow` for binary errors
- All async code via `tokio`
- Structured logging via `tracing` (not `println!`)
- Windows-specific code gated behind `#[cfg(target_os = "windows")]`
- Non-Windows must compile (stub implementations required)

## Windows-only code

Always provide stubs for non-Windows platforms so the codebase compiles in CI on Linux:

```rust
#[cfg(target_os = "windows")]
fn windows_only() { ... }

#[cfg(not(target_os = "windows"))]
fn windows_only() { /* stub */ }
```
