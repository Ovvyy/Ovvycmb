export type GameType = "dofus_unity" | "dofus_retro" | "wakfu";

export type AccountStatus =
  | "Offline"
  | "Connecting"
  | "Online"
  | "InCombat"
  | "Trading"
  | "Idle"
  | "Disconnected"
  | "Crashed"
  | "WaitingCaptcha";

export interface Account {
  id: string;
  name: string;
  character_name?: string;
  game_type: GameType;
  status: AccountStatus;
  process_id?: number;
  window_handle?: number;
  hp_current?: number;
  hp_max?: number;
  initiative?: number;
  level?: number;
  class?: string;
  server?: string;
  color_tag?: string;
  notes?: string;
  group_id?: string;
  order_index: number;
  last_seen: string;
  created_at: string;
}

export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Layout {
  account_slot: number;
  bounds: WindowBounds;
  monitor_index: number;
  z_order: number;
  is_minimized: boolean;
}

export interface LayoutProfile {
  id: string;
  name: string;
  description?: string;
  layouts: Layout[];
  monitor_count: number;
  is_default: boolean;
  hotkey?: string;
  created_at: string;
  updated_at: string;
}

export interface MonitorInfo {
  index: number;
  name: string;
  bounds: WindowBounds;
  work_area: WindowBounds;
  dpi: number;
  is_primary: boolean;
}

export interface AgentReport {
  id: string;
  agent_id: string;
  report_type: string;
  summary: string;
  findings: AgentFinding[];
  metrics: Record<string, unknown>;
  created_at: string;
}

export interface AgentFinding {
  title: string;
  description: string;
  severity: "Info" | "Warning" | "Critical" | "Suggestion";
  location?: string;
  suggestion?: string;
}

export type AppView =
  | "dashboard"
  | "accounts"
  | "layout"
  | "agents"
  | "plugins"
  | "settings";
